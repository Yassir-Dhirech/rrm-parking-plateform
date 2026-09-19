package com.rrm.parking.carte.service;

import com.rrm.parking.carte.dto.response.DemandeOperationnelleResponse;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.event.CarteActiveeEvent;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
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

        DemandeOperationnelle remise = new DemandeOperationnelle(
                genererReference("REM"),
                operation.getCarteAcces(),
                TypeOperationCarte.REMISE,
                "Remise de la carte d'accès au client",
                utilisateur
        );
        remise.definirDemandeDeclencheuse(operation);
        operationRepository.save(remise);

        eventPublisher.publishEvent(new CarteActiveeEvent(
                facture.getId(), contexte.demande().getReference(),
                operation.getCarteAcces().getReference(),
                contexte.client().getEmail(), contexte.client().getNomComplet()
        ));
        return versReponse(operation, contexte);
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
                contexte.client().getNomComplet(), contexte.client().getCin(),
                contexte.client().getEmail(), demande.getVehicule().getImmatriculation(),
                demande.getTarifParking().getParking().getNom(),
                facture == null ? null : facture.getId(),
                facture == null ? null : facture.getNumero()
        );
    }

    private ContexteDemande chargerContexte(DemandeOperationnelle operation) {
        Long abonnementId = operation.getCarteAcces().getAbonnement().getId();
        DemandeClient brute = demandeRepository.findByAbonnementGenereId(abonnementId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande cliente liée à la carte introuvable"));
        DemandeClient reelle = (DemandeClient) Hibernate.unproxy(brute);
        if (!(reelle instanceof DemandeNouvelAbonnementRegulier demande)
                || !(Hibernate.unproxy(demande.getClient())
                instanceof ClientParticulier client)) {
            throw new ConflitMetierException(
                    "Ce type de demande n'est pas encore pris en charge");
        }
        Facture facture = factureRepository.findByPaiementDemandeId(demande.getId())
                .orElse(null);
        return new ContexteDemande(demande, client, facture);
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
            DemandeNouvelAbonnementRegulier demande,
            ClientParticulier client,
            Facture facture
    ) {
    }
}
