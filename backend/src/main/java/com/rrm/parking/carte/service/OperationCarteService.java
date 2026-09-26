package com.rrm.parking.carte.service;

import com.rrm.parking.carte.dto.response.DemandeOperationnelleResponse;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.event.CarteActiveeEvent;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OperationCarteService {

    private static final List<StatutDemandeOperationnelle> STATUTS_OUVERTS =
            List.of(StatutDemandeOperationnelle.CREEE,
                    StatutDemandeOperationnelle.AFFECTEE,
                    StatutDemandeOperationnelle.EN_COURS);
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");

    private final DemandeOperationnelleRepository operationRepository;
    private final DemandeClientRepository demandeRepository;
    private final CarteAccesRepository carteRepository;
    private final FactureRepository factureRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<DemandeOperationnelleResponse> listerImpressions() {
        return lister(TypeOperationCarte.IMPRESSION);
    }

    @Transactional(readOnly = true)
    public List<DemandeOperationnelleResponse> listerActivations() {
        return lister(TypeOperationCarte.ACTIVATION);
    }

    @Transactional(readOnly = true)
    public List<DemandeOperationnelleResponse> listerRemises() {
        return lister(TypeOperationCarte.REMISE);
    }

    @Transactional
    public DemandeOperationnelleResponse terminerImpression(
            Long operationId,
            Long utilisateurId,
            String numeroCarte
    ) {
        DemandeOperationnelle operation = charger(operationId,
                TypeOperationCarte.IMPRESSION);
        Utilisateur utilisateur = chargerUtilisateur(utilisateurId);
        prendreEnChargeSiNecessaire(operation, utilisateur);
        operation.terminerImpression(utilisateur, numeroCarte);

        DemandeOperationnelle activation = new DemandeOperationnelle(
                genererReference("ACT"),
                operation.getCarteAcces(),
                TypeOperationCarte.ACTIVATION,
                "Activation et test de la carte d'accès",
                utilisateur
        );
        activation.definirDemandeDeclencheuse(operation);
        if (operation.getDemandeClientSource() != null) {
            activation.definirDemandeClientSource(
                    operation.getDemandeClientSource()
            );
        }
        operationRepository.save(activation);
        return versReponse(operation);
    }

    @Transactional
    public DemandeOperationnelleResponse terminerActivation(
            Long operationId,
            Long utilisateurId
    ) {
        DemandeOperationnelle operation = charger(operationId,
                TypeOperationCarte.ACTIVATION);
        Utilisateur utilisateur = chargerUtilisateur(utilisateurId);
        ContexteDemande contexte = chargerContexte(operation);
        Facture facture = contexte.facture();
        if (facture == null) {
            throw new ConflitMetierException(
                    "La facture doit être générée avant l'activation de la carte"
            );
        }

        prendreEnChargeSiNecessaire(operation, utilisateur);
        operation.terminerActivation(utilisateur);

        if (contexte.corporate()) {
            operationRepository.flush();
            marquerCorporatePretSiToutesCartesActives(
                    operation,
                    contexte,
                    utilisateur
            );
            return versReponse(operation, contexte);
        }

        if (contexte.renouvellement()) {
            publierNotificationActivation(operation, contexte);
            return versReponse(operation, contexte);
        }

        DemandeOperationnelle remise = new DemandeOperationnelle(
                genererReference("REM"),
                operation.getCarteAcces(),
                TypeOperationCarte.REMISE,
                "Remise de la carte d'accès au client",
                utilisateur
        );
        remise.definirDemandeDeclencheuse(operation);
        if (operation.getDemandeClientSource() != null) {
            remise.definirDemandeClientSource(
                    operation.getDemandeClientSource()
            );
        }
        operationRepository.save(remise);

        publierNotificationActivation(operation, contexte);
        return versReponse(operation, contexte);
    }

    private void publierNotificationActivation(
            DemandeOperationnelle operation,
            ContexteDemande contexte
    ) {
        Facture facture = contexte.facture();
        var periode = facture.getPaiement().getPeriodeAbonnement();
        eventPublisher.publishEvent(new CarteActiveeEvent(
                facture.getId(),
                contexte.demande().getReference(),
                operation.getCarteAcces().getReference(),
                contexte.email(),
                contexte.nomClient(),
                contexte.renouvellement(),
                periode == null ? null : periode.getDateDebut(),
                periode == null ? null : periode.getDateFin()
        ));
    }

    private void marquerCorporatePretSiToutesCartesActives(
            DemandeOperationnelle operation,
            ContexteDemande contexte,
            Utilisateur superviseur
    ) {
        DemandeNouveauContratCorporate demande =
                (DemandeNouveauContratCorporate) contexte.demande();
        var cartes = carteRepository.findByAbonnementIdOrderByIdAsc(
                operation.getCarteAcces().getAbonnement().getId()
        );
        boolean toutesActives = cartes.size() == demande.getNombrePlaces()
                && cartes.stream().allMatch(carte ->
                carte.getStatut() == StatutCarteAcces.ACTIVE);
        if (!toutesActives) {
            return;
        }

        var derniereActivation = cartes.stream()
                .map(carte -> carte.getDateActivation())
                .filter(java.util.Objects::nonNull)
                .max(java.time.LocalDateTime::compareTo)
                .orElseThrow(() -> new ConflitMetierException(
                        "La date d'activation des cartes est introuvable"
                ));
        demande.marquerCartesActivees(derniereActivation, superviseur);
        demandeRepository.save(demande);
    }

    @Transactional
    public DemandeOperationnelleResponse terminerRemise(
            Long operationId,
            Long utilisateurId
    ) {
        DemandeOperationnelle operation = charger(operationId,
                TypeOperationCarte.REMISE);
        Utilisateur utilisateur = chargerUtilisateur(utilisateurId);
        prendreEnChargeSiNecessaire(operation, utilisateur);
        operation.terminerRemise(utilisateur);
        return versReponse(operation);
    }

    private List<DemandeOperationnelleResponse> lister(TypeOperationCarte type) {
        return operationRepository
                .findByTypeOperationAndStatutInOrderByDateCreationAsc(
                        type, STATUTS_OUVERTS)
                .stream().map(this::versReponse).toList();
    }

    private DemandeOperationnelle charger(Long id, TypeOperationCarte type) {
        DemandeOperationnelle operation = operationRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande opérationnelle introuvable"));
        if (operation.getTypeOperation() != type) {
            throw new ConflitMetierException(
                    "Le type de la demande opérationnelle est invalide");
        }
        return operation;
    }

    private Utilisateur chargerUtilisateur(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Utilisateur authentifié introuvable"));
    }

    private void prendreEnChargeSiNecessaire(
            DemandeOperationnelle operation,
            Utilisateur utilisateur
    ) {
        if (operation.getStatut() == StatutDemandeOperationnelle.CREEE
                || operation.getStatut() == StatutDemandeOperationnelle.AFFECTEE) {
            operation.prendreEnCharge(utilisateur);
        }
    }

    private DemandeOperationnelleResponse versReponse(
            DemandeOperationnelle operation
    ) {
        return versReponse(operation, chargerContexte(operation));
    }

    private DemandeOperationnelleResponse versReponse(
            DemandeOperationnelle operation,
            ContexteDemande contexte
    ) {
        var demande = contexte.demande();
        var facture = contexte.facture();
        return DemandeOperationnelleResponse.depuis(
                operation, demande.getId(), demande.getReference(),
                contexte.nomClient(), contexte.identifiantClient(),
                contexte.email(), contexte.immatriculation(),
                contexte.parkingNom(),
                facture == null ? null : facture.getId(),
                facture == null ? null : facture.getNumero()
        );
    }

    private ContexteDemande chargerContexte(DemandeOperationnelle operation) {
        Long abonnementId = operation.getCarteAcces().getAbonnement().getId();
        DemandeClient brute = operation.getDemandeClientSource();
        if (brute == null) {
            brute = demandeRepository.findByAbonnementGenereId(abonnementId)
                    .orElseThrow(() -> new RessourceIntrouvableException(
                            "Demande cliente liée à la carte introuvable"));
        }
        DemandeClient reelle = (DemandeClient) Hibernate.unproxy(brute);
        Client clientBrut = (Client) Hibernate.unproxy(reelle.getClient());

        if (reelle instanceof DemandeNouveauContratCorporate corporate
                && clientBrut instanceof ClientEntreprise entreprise) {
            Facture facture = factureRepository
                    .findByPaiementDemandeId(reelle.getId())
                    .orElse(null);
            return new ContexteDemande(
                    reelle,
                    entreprise.getRaisonSociale(),
                    entreprise.getIce(),
                    entreprise.getEmail(),
                    facture,
                    operation.getCarteAcces().getImmatriculationAffectee(),
                    corporate.getParking().getNom(),
                    false,
                    true
            );
        }

        if (!(clientBrut instanceof ClientParticulier client)) {
            throw new ConflitMetierException("Ce type de demande n'est pas pris en charge");
        }

        DemandeNouvelAbonnementRegulier demandeInitiale = demandeRepository
                .findByAbonnementGenereId(abonnementId)
                .map(Hibernate::unproxy)
                .filter(DemandeNouvelAbonnementRegulier.class::isInstance)
                .map(DemandeNouvelAbonnementRegulier.class::cast)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande initiale liée à la carte introuvable"));

        boolean renouvellement = reelle instanceof DemandeRenouvellementRegulier;
        String parkingNom = renouvellement
                ? ((DemandeRenouvellementRegulier) reelle)
                        .getTarifParking().getParking().getNom()
                : demandeInitiale.getTarifParking().getParking().getNom();
        Facture facture = factureRepository.findByPaiementDemandeId(reelle.getId())
                .orElse(null);
        return new ContexteDemande(
                reelle,
                client.getNomComplet(),
                client.getCin(),
                client.getEmail(),
                facture,
                demandeInitiale.getVehicule().getImmatriculation(),
                parkingNom,
                renouvellement,
                false
        );
    }

    private String genererReference(String prefixe) {
        String reference;
        String date = LocalDate.now(ZONE_RRM)
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        do {
            reference = prefixe + "-" + date + "-"
                    + UUID.randomUUID().toString().substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (operationRepository.existsByReference(reference));
        return reference;
    }

    private record ContexteDemande(
            DemandeClient demande,
            String nomClient,
            String identifiantClient,
            String email,
            Facture facture,
            String immatriculation,
            String parkingNom,
            boolean renouvellement,
            boolean corporate
    ) {
    }
}
