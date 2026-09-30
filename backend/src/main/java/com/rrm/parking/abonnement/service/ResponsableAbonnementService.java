package com.rrm.parking.abonnement.service;

import com.rrm.parking.abonnement.dto.ResponsableAbonnementResponse;
import com.rrm.parking.abonnement.entity.*;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResponsableAbonnementService {
    private final AbonnementRepository abonnements;
    private final CarteAccesRepository cartes;
    private final FactureRepository factures;
    private final NotificationRepository notifications;
    private final AuditLogRepository audit;

    @Transactional(readOnly = true)
    public Page<ResponsableAbonnementResponse> lister(int page, int taille,
                                                      String recherche,
                                                      StatutAbonnement statut) {
        if (page < 0 || taille < 1 || taille > 100) {
            throw new IllegalArgumentException("Pagination invalide");
        }
        String motif = "%" + (recherche == null ? "" : recherche.trim().toLowerCase()) + "%";
        return abonnements.rechercher(motif, statut, PageRequest.of(page, taille,
                Sort.by(Sort.Direction.DESC, "dateCreation")))
                .map(abonnement -> versReponse(abonnement, false));
    }

    @Transactional(readOnly = true)
    public ResponsableAbonnementResponse consulter(Long id) {
        return versReponse(charger(id), true);
    }

    @Transactional
    public ResponsableAbonnementResponse suspendre(Long id, String motif, String acteur) {
        if (motif == null || motif.isBlank() || motif.trim().length() > 1000) {
            throw new IllegalArgumentException("Le motif de suspension est obligatoire (1000 caractères maximum)");
        }
        Abonnement abonnement = abonnements.findByIdForUpdate(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Abonnement introuvable"));
        if (abonnement.getStatut() != StatutAbonnement.ACTIF) {
            throw new ConflitMetierException("Seul un abonnement actif peut être suspendu");
        }
        abonnement.suspendre(motif.trim());
        // L'état applicatif change ici ; aucune commande n'est envoyée au système de barrières.
        for (CarteAcces carte : cartes.findByAbonnementIdOrderByIdAsc(id)) {
            if (carte.getStatut() == StatutCarteAcces.ACTIVE) {
                carte.suspendre(motif.trim());
            }
        }
        audit.save(new AuditLog(null, acteur, null, TypeActionAudit.SUSPENSION,
                ResultatAudit.SUCCES, "ABONNEMENT", id, abonnement.getReference(),
                "Suspension de l'abonnement", motif.trim(), null, null,
                "POST", "/api/responsable/abonnements/" + id + "/suspension", null));
        return versReponse(abonnement, true);
    }

    private Abonnement charger(Long id) {
        return abonnements.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Abonnement introuvable"));
    }

    private ResponsableAbonnementResponse versReponse(Abonnement abonnement, boolean detail) {
        Object reel = Hibernate.unproxy(abonnement);
        String type;
        String clientNom;
        String clientEmail;
        String entrepriseIce = null;
        String parkingNom = null;
        if (reel instanceof AbonnementRegulier regulier) {
            type = regulier.estAuNomEntreprise() ? "REGULIER_ENTREPRISE" : "REGULIER";
            clientNom = regulier.estAuNomEntreprise()
                    ? regulier.getEntrepriseNom() : regulier.getClient().getNomComplet();
            clientEmail = regulier.getClient().getEmail();
            entrepriseIce = regulier.getEntrepriseIce();
            parkingNom = regulier.getAffectationsParking().stream()
                    .max(Comparator.comparing(AffectationParking::getDateDebut))
                    .map(affectation -> affectation.getParking().getNom()).orElse(null);
        } else if (reel instanceof AbonnementEntreprise corporate) {
            type = "CORPORATE";
            clientNom = corporate.getContrat().getClientEntreprise().getRaisonSociale();
            clientEmail = corporate.getContrat().getClientEntreprise().getEmail();
            entrepriseIce = corporate.getContrat().getClientEntreprise().getIce();
        } else {
            throw new IllegalStateException("Type d'abonnement inconnu");
        }
        PeriodeAbonnement periode = abonnement.getPeriodes().stream()
                .max(Comparator.comparing(PeriodeAbonnement::getNumero)).orElse(null);
        List<CarteAcces> cartesAbonnement = cartes.findByAbonnementIdOrderByIdAsc(abonnement.getId());
        String immatriculation = cartesAbonnement.stream()
                .map(CarteAcces::getImmatriculationAffectee)
                .filter(value -> value != null && !value.isBlank())
                .findFirst().orElse(null);
        List<FactureResponse> facturesAbonnement = detail
                ? factures.findToutesParAbonnement(abonnement.getId())
                    .stream().map(FactureResponse::depuis).toList()
                : List.of();
        if (parkingNom == null && !facturesAbonnement.isEmpty()) {
            parkingNom = facturesAbonnement.get(0).parkingNom();
        }
        List<ResponsableAbonnementResponse.Relance> relances = detail && periode != null
                ? notifications.findByReferenceMetier("PERIODE-ABONNEMENT-" + periode.getId())
                    .stream().sorted(Comparator.comparing(Notification::getDateCreation))
                    .map(n -> new ResponsableAbonnementResponse.Relance(
                            n.getTypeNotification().name(), n.getStatut().name(),
                            n.getSujet(), n.getCanal().name(), n.getAdresseDestination(),
                            n.getDateEnvoiPrevue(), n.getDateEnvoi(), n.getDerniereErreur()))
                    .toList()
                : List.of();
        return new ResponsableAbonnementResponse(abonnement.getId(), abonnement.getReference(),
                type, clientNom, clientEmail, entrepriseIce, parkingNom,
                abonnement.getStatut().name(),
                periode == null ? null : periode.getDateDebut(),
                periode == null ? null : periode.getDateFin(), immatriculation,
                periode == null ? null : periode.calculerPrixTTC(),
                abonnement.getDateCreation(), facturesAbonnement, relances,
                detail ? cartesAbonnement.stream()
                        .map(c -> new ResponsableAbonnementResponse.Carte(
                                c.getReference(), c.getNumeroCarte(), c.getStatut().name(),
                                c.getImmatriculationAffectee())).toList() : List.of());
    }
}
