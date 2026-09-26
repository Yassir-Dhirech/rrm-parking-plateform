package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.abonnement.repository.PeriodeAbonnementRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.response.DecisionDemandeResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.CorrectionDemandeDemandeeEvent;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandeRenouvellementRegulierRepository;
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
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeValidationFinaleService {

    private static final ZoneId ZONE_RRM =
            ZoneId.of("Africa/Casablanca");

    private final DemandeClientRepository demandeClientRepository;
    private final DemandeRenouvellementRegulierRepository renouvellementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PaiementRepository paiementRepository;
    private final AbonnementRepository abonnementRepository;
    private final AbonnementRegulierRepository abonnementRegulierRepository;
    private final PeriodeAbonnementRepository periodeAbonnementRepository;
    private final CarteAccesRepository carteAccesRepository;
    private final DemandeOperationnelleRepository demandeOperationnelleRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public DecisionDemandeResponse valider(
            Long demandeId,
            Long utilisateurId
    ) {
        DemandeClient demande = chargerDemandePayee(demandeId);
        Utilisateur decideur = chargerUtilisateur(utilisateurId);
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

        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            return validerNouvelAbonnement(nouvelle, decideur, paiement);
        }

        if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            return validerRenouvellement(renouvellement, decideur, paiement);
        }

        throw new ConflitMetierException(
                "Ce type de demande n'est pas encore pris en charge"
        );
    }

    private DecisionDemandeResponse validerNouvelAbonnement(
            DemandeNouvelAbonnementRegulier demande,
            Utilisateur decideur,
            Paiement paiement
    ) {
        ClientParticulier client = chargerClientParticulier(demande);
        TarifParking tarif = demande.getTarifParking();

        demande.valider(decideur, "Validation finale du dossier payé");

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
        impression.definirDemandeClientSource(demande);

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
                impressionEnregistree.getReference(),
                null,
                null
        );
    }

    private DecisionDemandeResponse validerRenouvellement(
            DemandeRenouvellementRegulier demande,
            Utilisateur decideur,
            Paiement paiement
    ) {
        AbonnementRegulier abonnement = demande.getAbonnementConcerne();
        TarifParking nouveauTarif = demande.getTarifParking();
        PeriodeAbonnement dernierePeriode = abonnement.getPeriodes().stream()
                .filter(periode -> periode.getStatut()
                        != com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement.ANNULEE)
                .max(Comparator.comparing(PeriodeAbonnement::getNumero))
                .orElseThrow(() -> new ConflitMetierException(
                        "L'abonnement ne possède aucune période renouvelable"
                ));

        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        LocalDate dateDebut = dernierePeriode.getDateFin().isBefore(aujourdHui)
                ? aujourdHui
                : dernierePeriode.getDateFin().plusDays(1);
        LocalDate dateFin = dateDebut
                .plusMonths(nouveauTarif.getDureeEnMois())
                .minusDays(1);

        TarifParking ancienTarif = chargerDernierTarif(abonnement.getId());
        AffectationParking derniereAffectation = abonnement
                .getAffectationsParking().stream()
                .max(Comparator.comparing(AffectationParking::getDateDebut))
                .orElseThrow(() -> new ConflitMetierException(
                        "L'abonnement ne possède aucune affectation parking"
                ));

        boolean parkingChange = !memeEntite(
                derniereAffectation.getParking().getId(),
                nouveauTarif.getParking().getId(),
                derniereAffectation.getParking(),
                nouveauTarif.getParking()
        );
        boolean forfaitChange = !memeEntite(
                ancienTarif.getForfait().getId(),
                nouveauTarif.getForfait().getId(),
                ancienTarif.getForfait(),
                nouveauTarif.getForfait()
        );

        CarteAcces carte = chargerCarteExistante(abonnement.getId());
        boolean carteExpiree = carte.getStatut() == StatutCarteAcces.EXPIREE;

        demande.valider(decideur, "Validation finale du renouvellement payé");

        PeriodeAbonnement nouvellePeriode = new PeriodeAbonnement(
                dernierePeriode.getNumero() + 1,
                dateDebut,
                dateFin,
                nouveauTarif.calculerMontantTotalHT(),
                nouveauTarif.getTauxTVA(),
                abonnement
        );
        abonnement.ajouterPeriode(nouvellePeriode);

        if (parkingChange) {
            abonnement.changerParking(nouveauTarif.getParking(), dateDebut);
        }

        if (!dateDebut.isAfter(aujourdHui)) {
            nouvellePeriode.activer();
            if (abonnement.getStatut() == StatutAbonnement.EXPIRE) {
                abonnement.reactiverApresRenouvellement();
            }
        }

        PeriodeAbonnement periodeEnregistree =
                periodeAbonnementRepository.save(nouvellePeriode);
        abonnementRegulierRepository.save(abonnement);
        paiement.associerPeriodeAbonnement(periodeEnregistree);
        demande.associerPeriodeGeneree(periodeEnregistree);

        DemandeOperationnelle activation = new DemandeOperationnelle(
                genererReferenceActivation(),
                carte,
                TypeOperationCarte.ACTIVATION,
                motifActivation(carteExpiree, parkingChange, forfaitChange),
                decideur
        );
        activation.definirDemandeClientSource(demande);
        activation = demandeOperationnelleRepository.save(activation);

        return new DecisionDemandeResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                abonnement.getId(),
                abonnement.getReference(),
                carte.getId(),
                carte.getReference(),
                null,
                null,
                activation.getId(),
                activation.getReference()
        );
    }

    @Transactional
    public DecisionDemandeResponse demanderCorrection(
            Long demandeId,
            Long utilisateurId,
            String motif
    ) {
        DemandeClient demande = chargerDemandePayee(demandeId);
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

    private DemandeClient chargerDemandePayee(
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

        if (!(demandeReelle instanceof DemandeNouvelAbonnementRegulier)
                && !(demandeReelle instanceof DemandeRenouvellementRegulier)) {
            throw new ConflitMetierException(
                    "Ce type de demande n'est pas encore pris en charge"
            );
        }

        if (demandeReelle.getStatut() != StatutDemande.PAYEE) {
            throw new ConflitMetierException(
                    "La demande doit être payée avant la décision finale"
            );
        }

        if (demandeReelle instanceof DemandeNouvelAbonnementRegulier reguliere
                && reguliere.getAbonnementGenere() != null) {
            throw new ConflitMetierException(
                    "La demande a déjà généré un abonnement"
            );
        }

        if (demandeReelle instanceof DemandeRenouvellementRegulier renouvellement
                && renouvellement.getPeriodeGeneree() != null) {
            throw new ConflitMetierException(
                    "La demande a déjà généré une période"
            );
        }

        return demandeReelle;
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
            DemandeClient demande
    ) {
        Client client = (Client) Hibernate.unproxy(
                demande.getClient()
        );

        if (!(client instanceof ClientParticulier particulier)) {
            throw new ConflitMetierException(
                    "La demande régulière exige un client particulier"
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

    private String genererReferenceActivation() {
        return genererReferenceUnique(
                "ACT",
                demandeOperationnelleRepository::existsByReference
        );
    }

    private CarteAcces chargerCarteExistante(Long abonnementId) {
        List<CarteAcces> cartes = carteAccesRepository
                .findByAbonnementId(abonnementId).stream()
                .filter(carte -> carte.getStatut()
                        != StatutCarteAcces.DESACTIVEE)
                .toList();

        if (cartes.size() != 1) {
            throw new ConflitMetierException(
                    "L'abonnement doit posséder exactement une carte réutilisable"
            );
        }

        return cartes.getFirst();
    }

    private TarifParking chargerDernierTarif(Long abonnementId) {
        return renouvellementRepository
                .findFirstByAbonnementConcerneIdAndPeriodeGenereeIsNotNullOrderByDateModificationDesc(
                        abonnementId
                )
                .map(DemandeRenouvellementRegulier::getTarifParking)
                .orElseGet(() -> demandeClientRepository
                        .findByAbonnementGenereId(abonnementId)
                        .map(DemandeClient.class::cast)
                        .filter(DemandeNouvelAbonnementRegulier.class::isInstance)
                        .map(DemandeNouvelAbonnementRegulier.class::cast)
                        .map(DemandeNouvelAbonnementRegulier::getTarifParking)
                        .orElseThrow(() -> new ConflitMetierException(
                                "Le tarif précédent de l'abonnement est introuvable"
                        ))
                );
    }

    private boolean memeEntite(
            Long premierId,
            Long secondId,
            Object premier,
            Object second
    ) {
        if (premier == second) {
            return true;
        }
        return premierId != null && premierId.equals(secondId);
    }

    private String motifActivation(
            boolean carteExpiree,
            boolean parkingChange,
            boolean forfaitChange
    ) {
        StringBuilder motif = new StringBuilder(
                "Réactivation et test de la carte après renouvellement"
        );
        if (carteExpiree) motif.append(" ; carte expirée");
        if (parkingChange) motif.append(" ; changement de parking");
        if (forfaitChange) motif.append(" ; changement de forfait");
        return motif.toString();
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
