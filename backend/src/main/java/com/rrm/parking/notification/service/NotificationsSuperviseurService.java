package com.rrm.parking.notification.service;

import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.notification.dto.NotificationSuperviseurResponse;
import com.rrm.parking.notification.entity.NotificationUtilisateurEtat;
import com.rrm.parking.notification.repository.NotificationUtilisateurEtatRepository;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationsSuperviseurService {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final List<StatutDemandeOperationnelle> OUVERTES = List.of(
            StatutDemandeOperationnelle.CREEE,
            StatutDemandeOperationnelle.AFFECTEE,
            StatutDemandeOperationnelle.EN_COURS);

    private final AffectationAgentParkingRepository affectations;
    private final DemandeOperationnelleRepository operations;
    private final DemandeClientRepository demandes;
    private final NotificationUtilisateurEtatRepository etats;

    @Transactional(readOnly = true)
    public List<NotificationSuperviseurResponse> lister(Long superviseurId) {
        Map<String, NotificationUtilisateurEtat> etatsParCle = new HashMap<>();
        etats.findByUtilisateurId(superviseurId).forEach(etat ->
                etatsParCle.put(etat.getCleNotification(), etat));
        return evenements(superviseurId).values().stream()
                .filter(e -> !estMasquee(etatsParCle.get(e.id())))
                .sorted(Comparator.comparing(Evenement::createdAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(e -> new NotificationSuperviseurResponse(
                        e.id(), e.title(), e.message(), e.createdAt(), e.type(),
                        e.category(), estLue(etatsParCle.get(e.id())), e.link()))
                .toList();
    }

    @Transactional
    public void marquerLue(Long superviseurId, String id) {
        verifierEvenement(superviseurId, id);
        obtenirOuCreer(superviseurId, id).marquerLue();
    }

    @Transactional
    public void toutMarquerLu(Long superviseurId) {
        evenements(superviseurId).keySet().forEach(id ->
                obtenirOuCreer(superviseurId, id).marquerLue());
    }

    @Transactional
    public void masquer(Long superviseurId, String id) {
        verifierEvenement(superviseurId, id);
        obtenirOuCreer(superviseurId, id).masquer();
    }

    @Transactional
    public void toutMasquer(Long superviseurId) {
        evenements(superviseurId).keySet().forEach(id ->
                obtenirOuCreer(superviseurId, id).masquer());
    }

    private void verifierEvenement(Long superviseurId, String id) {
        if (id == null || !evenements(superviseurId).containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable");
        }
    }

    private NotificationUtilisateurEtat obtenirOuCreer(Long superviseurId, String id) {
        return etats.findByUtilisateurIdAndCleNotification(superviseurId, id)
                .orElseGet(() -> etats.save(new NotificationUtilisateurEtat(superviseurId, id)));
    }

    private boolean estLue(NotificationUtilisateurEtat etat) {
        return etat != null && etat.isLue();
    }

    private boolean estMasquee(NotificationUtilisateurEtat etat) {
        return etat != null && etat.isMasquee();
    }

    private Map<String, Evenement> evenements(Long superviseurId) {
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        var parkings = affectations.findAllByUtilisateurIdAndActiveTrue(superviseurId).stream()
                .filter(a -> a.getDateDebut() != null && !a.getDateDebut().isAfter(aujourdHui))
                .filter(a -> a.getDateFin() == null || !a.getDateFin().isBefore(aujourdHui))
                .collect(java.util.stream.Collectors.toMap(a -> a.getParking().getId(),
                        a -> a.getParking(), (a, b) -> a));
        Map<String, Evenement> resultat = new LinkedHashMap<>();
        for (var parking : parkings.values()) {
            Long parkingId = parking.getId();
            String parkingNom = parking.getNom();
            for (var operation : operations.findOuvertesParParking(
                    List.of(TypeOperationCarte.IMPRESSION, TypeOperationCarte.ACTIVATION),
                    OUVERTES, parkingId, aujourdHui)) {
                boolean impression = operation.getTypeOperation() == TypeOperationCarte.IMPRESSION;
                String id = "superviseur:" + operation.getTypeOperation() + ":" + operation.getId();
                resultat.putIfAbsent(id, new Evenement(id,
                        impression ? "Nouvelle demande d’impression" : "Nouvelle demande d’activation",
                        operation.getReference() + " · " + parkingNom
                                + (impression ? " · Carte à imprimer" : " · Carte à activer et tester"),
                        operation.getDateCreation(), "info", "DOSSIER",
                        impression ? "/superviseur/impressions-cartes?operationId=" + operation.getId()
                                : "/superviseur/activations-cartes?operationId=" + operation.getId()));
            }
            List<DemandeClient> aValider = new ArrayList<>(
                    demandes.nouvellesDemandesAValiderParParking(parkingId, StatutDemande.PAYEE));
            aValider.addAll(demandes.renouvellementsAValiderParParking(parkingId, StatutDemande.PAYEE));
            for (DemandeClient demande : aValider) {
                boolean renouvellement = Hibernate.unproxy(demande) instanceof DemandeRenouvellementRegulier;
                String id = "superviseur:DEMANDE:" + demande.getId();
                resultat.putIfAbsent(id, new Evenement(id,
                        renouvellement ? "Renouvellement à valider" : "Nouvel abonnement à valider",
                        demande.getReference() + " · " + parkingNom + " · Paiement confirmé",
                        demande.getDateModification() != null
                                ? demande.getDateModification() : demande.getDateSoumission(),
                        "warning", "DOSSIER",
                        "/superviseur/demandes/" + demande.getId()));
            }
        }
        return resultat;
    }

    private record Evenement(String id, String title, String message,
                             LocalDateTime createdAt, String type, String category,
                             String link) {}
}
