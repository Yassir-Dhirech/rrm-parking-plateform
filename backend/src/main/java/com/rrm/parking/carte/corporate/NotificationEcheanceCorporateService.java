package com.rrm.parking.carte.corporate;

import com.rrm.parking.notification.entity.NotificationUtilisateurEtat;
import com.rrm.parking.notification.repository.NotificationUtilisateurEtatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationEcheanceCorporateService {
    private final EcheanceCarteCorporateRepository echeances;
    private final NotificationUtilisateurEtatRepository etats;

    public record Alerte(String id, String title, String message, LocalDateTime createdAt,
                         String type, String category, boolean read, String link) { }

    @Transactional(readOnly = true)
    public List<Alerte> lister(Long utilisateurId) {
        Map<String, NotificationUtilisateurEtat> etatsParCle = etats.findByUtilisateurId(utilisateurId)
                .stream().collect(Collectors.toMap(NotificationUtilisateurEtat::getCleNotification,
                        etat -> etat, (a, b) -> a));
        return evenements().stream()
                .filter(e -> !etatsParCle.containsKey(e.id()) || !etatsParCle.get(e.id()).isMasquee())
                .map(e -> new Alerte(e.id(), e.title(), e.message(), e.createdAt(), e.type(),
                        "DOSSIER", etatsParCle.containsKey(e.id()) && etatsParCle.get(e.id()).isLue(),
                        "/responsable/rappels-cartes-corporate"))
                .sorted(Comparator.comparing(Alerte::createdAt).reversed()).toList();
    }

    @Transactional
    public void marquerLue(Long utilisateurId, String id) {
        verifier(id);
        etat(utilisateurId, id).marquerLue();
    }

    @Transactional
    public void toutMarquerLu(Long utilisateurId) {
        evenements().forEach(e -> etat(utilisateurId, e.id()).marquerLue());
    }

    @Transactional
    public void masquer(Long utilisateurId, String id) {
        verifier(id);
        etat(utilisateurId, id).masquer();
    }

    @Transactional
    public void toutMasquer(Long utilisateurId) {
        evenements().forEach(e -> etat(utilisateurId, e.id()).masquer());
    }

    private NotificationUtilisateurEtat etat(Long utilisateurId, String id) {
        return etats.findByUtilisateurIdAndCleNotification(utilisateurId, id)
                .orElseGet(() -> etats.save(new NotificationUtilisateurEtat(utilisateurId, id)));
    }

    private void verifier(String id) {
        if (evenements().stream().noneMatch(e -> e.id().equals(id))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rappel introuvable");
        }
    }

    private List<Evenement> evenements() {
        List<Evenement> resultat = new ArrayList<>();
        for (EcheanceCarteCorporate dossier : echeances.findAllByOrderByDateEcheanceDesc()) {
            if (dossier.getStatut() == StatutEcheanceCorporate.CLOTUREE) continue;
            String description = dossier.getCarte().getReference() + " · échéance " + dossier.getDateEcheance();
            if (dossier.getDateRappelAnticipe() != null) {
                resultat.add(new Evenement("resp:corp:J2:" + dossier.getId(),
                        "Carte corporate à réactiver — J−2", description,
                        dossier.getDateRappelAnticipe(), "warning"));
            }
            if (dossier.getDateRappelEcheance() != null) {
                resultat.add(new Evenement("resp:corp:J0:" + dossier.getId(),
                        "Échéance de carte corporate — aujourd'hui", description,
                        dossier.getDateRappelEcheance(), "danger"));
            }
            if (dossier.getStatut() == StatutEcheanceCorporate.DECLAREE) {
                resultat.add(new Evenement("resp:corp:OK:" + dossier.getId(),
                        "Réactivation corporate déclarée", description + " · à clôturer",
                        dossier.getDateDeclaration(), "success"));
            }
        }
        return resultat;
    }

    private record Evenement(String id, String title, String message,
                             LocalDateTime createdAt, String type) { }
}
