package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.response.DecisionDemandeResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.CorrectionDemandeDemandeeEvent;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.tarification.entity.TarifParking;
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
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeValidationFinaleService {

    private static final ZoneId ZONE_RRM =
            ZoneId.of("Africa/Casablanca");

    private final DemandeClientRepository demandeClientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PaiementRepository paiementRepository;
    private final AbonnementRepository abonnementRepository;
    private final AbonnementRegulierRepository abonnementRegulierRepository;
    private final CarteAccesRepository carteAccesRepository;
    private final DemandeOperationnelleRepository demandeOperationnelleRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public DecisionDemandeResponse valider(
            Long demandeId,
            Long utilisateurId
    ) {
        DemandeNouvelAbonnementRegulier demande =
                chargerDemandePayee(demandeId);
        Utilisateur decideur = chargerUtilisateur(utilisateurId);
        ClientParticulier client = chargerClientParticulier(demande);
        TarifParking tarif = demande.getTarifParking();
        Paiement paiement = paiementRepository
                .findByDemandeIdAndStatut(
                        demandeId,
                        StatutPaiement.CONFIRME
                )
                .orElseThrow(() ->
                        new ConflitMetierException(
                                "Aucun paiement confirmé n'est associé à la demande"
                        )
                );

        demande.valider(
                decideur,
                "Validation finale du dossier payé"
        );

        LocalDate dateDebut = LocalDate.now(ZONE_RRM);
        LocalDate dateFin = dateDebut
                .plusMonths(tarif.getDureeEnMois())
                .minusDays(1);

        AbonnementRegulier abonnement =
                new AbonnementRegulier(
                        genererReferenceAbonnement(),
                        client
                );
        PeriodeAbonnement periode = new PeriodeAbonnement(
                1,
                dateDebut,
                dateFin,
                tarif.calculerMontantTotalHT(),
                tarif.getTauxTVA(),
                abonnement
        );

        abonnement.ajouterPeriode(periode);
        abonnement.affecterParkingInitial(
                tarif.getParking(),
                dateDebut
        );
        periode.activer();
        abonnement.activer();

        AbonnementRegulier abonnementEnregistre =
                abonnementRegulierRepository.save(abonnement);

        paiement.associerPeriodeAbonnement(periode);
        demande.associerAbonnementGenere(abonnementEnregistre);

        CarteAcces carte = carteAccesRepository.save(
                new CarteAcces(
                        genererReferenceCarte(),
                        abonnementEnregistre
                )
        );

        DemandeOperationnelle impression =
                new DemandeOperationnelle(
                        genererReferenceImpression(),
                        carte,
                        TypeOperationCarte.IMPRESSION,
                        "Impression de la première carte d'accès",
                        decideur
                );

        DemandeOperationnelle impressionEnregistree =
                demandeOperationnelleRepository.save(impression);

        return new DecisionDemandeResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                abonnementEnregistre.getId(),
                abonnementEnregistre.getReference(),
                carte.getId(),
                carte.getReference(),
                impressionEnregistree.getId(),
                impressionEnregistree.getReference()
        );
    }

    @Transactional
    public DecisionDemandeResponse demanderCorrection(
            Long demandeId,
            Long utilisateurId,
            String motif
    ) {
        DemandeNouvelAbonnementRegulier demande =
                chargerDemandePayee(demandeId);
        Utilisateur decideur = chargerUtilisateur(utilisateurId);
        ClientParticulier client = chargerClientParticulier(demande);

        demande.demanderCorrection(decideur, motif);

        eventPublisher.publishEvent(
                new CorrectionDemandeDemandeeEvent(
                        demande.getReference(),
                        client.getEmail(),
                        client.getNomComplet(),
                        motif.trim()
                )
        );

        return DecisionDemandeResponse.correction(
                demande.getId(),
                demande.getReference(),
                demande.getStatut()
        );
    }

    private DemandeNouvelAbonnementRegulier chargerDemandePayee(
            Long demandeId
    ) {
        DemandeClient demande = demandeClientRepository
                .findByIdPourMiseAJour(demandeId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Demande introuvable"
                        )
                );
        DemandeClient demandeReelle =
                (DemandeClient) Hibernate.unproxy(demande);

        if (!(demandeReelle
                instanceof DemandeNouvelAbonnementRegulier reguliere)) {
            throw new ConflitMetierException(
                    "Ce type de demande n'est pas encore pris en charge"
            );
        }

        if (reguliere.getStatut() != StatutDemande.PAYEE) {
            throw new ConflitMetierException(
                    "La demande doit être payée avant la décision finale"
            );
        }

        if (reguliere.getAbonnementGenere() != null) {
            throw new ConflitMetierException(
                    "La demande a déjà généré un abonnement"
            );
        }

        return reguliere;
    }

    private Utilisateur chargerUtilisateur(Long utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Utilisateur authentifié introuvable"
                        )
                );
    }

    private ClientParticulier chargerClientParticulier(
            DemandeNouvelAbonnementRegulier demande
    ) {
        Client client = (Client) Hibernate.unproxy(
                demande.getClient()
        );

        if (!(client instanceof ClientParticulier particulier)) {
            throw new ConflitMetierException(
                    "Le nouvel abonnement régulier exige un client particulier"
            );
        }

        return particulier;
    }

    private String genererReferenceAbonnement() {
        return genererReferenceUnique(
                "ABO",
                abonnementRepository::existsByReferenceIgnoreCase
        );
    }

    private String genererReferenceCarte() {
        return genererReferenceUnique(
                "CARTE",
                carteAccesRepository::existsByReference
        );
    }

    private String genererReferenceImpression() {
        return genererReferenceUnique(
                "IMP",
                demandeOperationnelleRepository::existsByReference
        );
    }

    private String genererReferenceUnique(
            String prefixe,
            java.util.function.Predicate<String> existe
    ) {
        String date = LocalDate.now(ZONE_RRM).format(
                DateTimeFormatter.BASIC_ISO_DATE
        );
        String reference;

        do {
            reference = prefixe
                    + "-"
                    + date
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (existe.test(reference));

        return reference;
    }
}
