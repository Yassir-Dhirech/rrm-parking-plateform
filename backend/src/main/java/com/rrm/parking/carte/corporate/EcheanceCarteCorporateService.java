package com.rrm.parking.carte.corporate;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EcheanceCarteCorporateService {
    private static final ZoneId ZONE = ZoneId.of("Africa/Casablanca");

    private final CarteAccesRepository cartes;
    private final EcheanceCarteCorporateRepository echeances;
    private final DemandeOperationnelleRepository operations;
    private final DemandeNouveauContratCorporateRepository demandes;
    private final UtilisateurRepository utilisateurs;

    @Scheduled(cron = "0 0 * * * *", zone = "Africa/Casablanca")
    @Transactional
    public void enregistrerRappels() {
        enregistrerRappels(LocalDate.now(ZONE));
    }

    @Transactional
    public void enregistrerRappels(LocalDate aujourdHui) {
        for (CarteAcces carte : cartes.findByStatut(StatutCarteAcces.ACTIVE)) {
            if (!estCorporateActive(carte)) continue;
            LocalDate echeance = carte.getDateActivation().toLocalDate().plusMonths(24);
            if (aujourdHui.isBefore(echeance.minusDays(2))) continue;
            EcheanceCarteCorporate dossier = echeances.findByCarteIdAndActivationReference(
                    carte.getId(), carte.getDateActivation())
                    .orElseGet(() -> echeances.save(new EcheanceCarteCorporate(carte)));
            dossier.enregistrerRappels(aujourdHui);
        }
    }

    @Transactional(readOnly = true)
    public EcheanceCarteCorporateResponse lister() {
        List<EcheanceCarteCorporateResponse.Carte> cartesActives = cartes.findByStatut(StatutCarteAcces.ACTIVE)
                .stream().filter(this::estCorporateActive)
                .map(carte -> {
                    var demande = demandeCorporate(carte);
                    var dossier = echeances.findByCarteIdAndActivationReference(
                            carte.getId(), carte.getDateActivation()).orElse(null);
                    LocalDate dateEcheance = carte.getDateActivation().toLocalDate().plusMonths(24);
                    return new EcheanceCarteCorporateResponse.Carte(
                            carte.getId(), carte.getReference(), carte.getNumeroCarte(),
                            carte.getImmatriculationAffectee(), carte.getAbonnement().getReference(),
                            nomEntreprise(carte), demande == null ? null : demande.getParking().getNom(),
                            carte.getDateActivation(), dateEcheance.minusDays(2), dateEcheance,
                            dossier == null ? null : dossier.getDateRappelAnticipe(),
                            dossier == null ? null : dossier.getDateRappelEcheance(),
                            dossier == null ? null : dossier.getId(),
                            dossier == null ? null : dossier.getStatut());
                }).sorted(Comparator.comparing(EcheanceCarteCorporateResponse.Carte::dateEcheance)).toList();
        List<EcheanceCarteCorporateResponse.Dossier> historique = echeances.findAllByOrderByDateEcheanceDesc()
                .stream().map(this::versDossier).toList();
        return new EcheanceCarteCorporateResponse(cartesActives, historique);
    }

    @Transactional
    public EcheanceCarteCorporateResponse.Dossier genererDemande(Long carteId, Long responsableId) {
        CarteAcces carte = cartes.findByIdForUpdate(carteId)
                .orElseThrow(() -> new RessourceIntrouvableException("Carte introuvable"));
        if (!estCorporateActive(carte)) {
            throw new ConflitMetierException("La carte corporate doit être active");
        }
        LocalDate aujourdHui = LocalDate.now(ZONE);
        LocalDate echeance = carte.getDateActivation().toLocalDate().plusMonths(24);
        if (aujourdHui.isBefore(echeance.minusDays(2))) {
            throw new ConflitMetierException("La demande est possible à partir du rappel J−2");
        }
        DemandeNouveauContratCorporate demandeSource = demandes.findByAbonnementGenereId(
                carte.getAbonnement().getId()).orElseThrow(() -> new ConflitMetierException(
                "Demande corporate d'origine introuvable"));
        EcheanceCarteCorporate dossier = echeances.findByCarteIdAndActivationReference(
                carteId, carte.getDateActivation())
                .orElseGet(() -> echeances.save(new EcheanceCarteCorporate(carte)));
        if (dossier.getStatut() != StatutEcheanceCorporate.A_TRAITER) {
            throw new ConflitMetierException("Une demande existe déjà pour ce cycle");
        }
        Utilisateur responsable = utilisateur(responsableId);
        DemandeOperationnelle operation = new DemandeOperationnelle(
                reference(), carte, TypeOperationCarte.ACTIVATION,
                "Réactivation corporate après 24 mois", responsable);
        operation.definirDemandeClientSource(demandeSource);
        operations.save(operation);
        dossier.enregistrerRappels(aujourdHui);
        dossier.demander(operation, responsable);
        return versDossier(dossier);
    }

    @Transactional
    public EcheanceCarteCorporateResponse.Dossier cloturer(Long dossierId, Long responsableId) {
        EcheanceCarteCorporate dossier = echeances.findById(dossierId)
                .orElseThrow(() -> new RessourceIntrouvableException("Dossier introuvable"));
        if (dossier.getStatut() != StatutEcheanceCorporate.DECLAREE) {
            throw new ConflitMetierException("Le superviseur doit d'abord déclarer la réactivation");
        }
        dossier.cloturer(utilisateur(responsableId));
        return versDossier(dossier);
    }

    private boolean estCorporateActive(CarteAcces carte) {
        return carte.getDateActivation() != null
                && carte.getStatut() == StatutCarteAcces.ACTIVE
                && carte.getAbonnement().getStatut() == StatutAbonnement.ACTIF
                && Hibernate.unproxy(carte.getAbonnement()) instanceof AbonnementEntreprise;
    }

    private DemandeNouveauContratCorporate demandeCorporate(CarteAcces carte) {
        return demandes.findByAbonnementGenereId(carte.getAbonnement().getId()).orElse(null);
    }

    private String nomEntreprise(CarteAcces carte) {
        return ((AbonnementEntreprise) Hibernate.unproxy(carte.getAbonnement()))
                .getContrat().getClientEntreprise().getRaisonSociale();
    }

    private EcheanceCarteCorporateResponse.Dossier versDossier(EcheanceCarteCorporate dossier) {
        var carte = dossier.getCarte();
        var demande = demandeCorporate(carte);
        return new EcheanceCarteCorporateResponse.Dossier(
                dossier.getId(), carte.getId(), carte.getReference(), nomEntreprise(carte),
                demande == null ? null : demande.getParking().getNom(),
                dossier.getActivationReference(), dossier.getDateEcheance(), dossier.getStatut(),
                dossier.getOperation() == null ? null : dossier.getOperation().getId(),
                dossier.getOperation() == null ? null : dossier.getOperation().getReference(),
                dossier.getDateDemande(), dossier.getDateDeclaration(), dossier.getDateCloture(),
                nom(dossier.getDemandeePar()), nom(dossier.getDeclareePar()), nom(dossier.getClotureePar()));
    }

    private String nom(Utilisateur utilisateur) {
        return utilisateur == null ? null : utilisateur.getPrenom() + " " + utilisateur.getNom();
    }

    private Utilisateur utilisateur(Long id) {
        return utilisateurs.findById(id).orElseThrow(() -> new RessourceIntrouvableException("Utilisateur introuvable"));
    }

    private String reference() {
        return "RCC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT);
    }
}
