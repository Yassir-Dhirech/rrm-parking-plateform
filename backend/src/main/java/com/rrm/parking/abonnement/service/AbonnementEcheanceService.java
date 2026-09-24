package com.rrm.parking.abonnement.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import com.rrm.parking.abonnement.repository.PeriodeAbonnementRepository;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.enums.CanalNotification;
import com.rrm.parking.notification.enums.StatutNotification;
import com.rrm.parking.notification.enums.TypeNotification;
import com.rrm.parking.notification.repository.NotificationRepository;
import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbonnementEcheanceService {

    private final PeriodeAbonnementRepository periodeRepository;
    private final CarteAccesRepository carteRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectProvider<EmailEnvoiService> emailServiceProvider;

    @Value("${app.frontend.renewal-url:http://localhost:5173/demande-publique?tab=RENEW}")
    private String renewalUrl;

    @Transactional
    public void traiterEcheances(LocalDate dateTraitement) {
        programmerRappels(
                dateTraitement.plusDays(10),
                dateTraitement,
                10,
                TypeNotification.ABONNEMENT_EXPIRATION_J10
        );
        programmerRappels(
                dateTraitement.plusDays(5),
                dateTraitement,
                5,
                TypeNotification.ABONNEMENT_EXPIRATION_J5
        );
        traiterExpirations(dateTraitement);
        envoyerNotificationsEnAttente(dateTraitement.atTime(LocalTime.MAX));
    }

    private void programmerRappels(
            LocalDate dateFin,
            LocalDate dateTraitement,
            int joursRestants,
            TypeNotification type
    ) {
        periodeRepository.findByStatutAndDateFin(
                        StatutPeriodeAbonnement.ACTIVE,
                        dateFin
                ).stream()
                .filter(this::abonnementRegulierActif)
                .forEach(periode -> {
                    if (renouvellementPlanifie(periode)) {
                        annulerNotificationsEnAttente(periode);
                        return;
                    }
                    creerRappel(periode, dateTraitement, joursRestants, type);
                });
    }

    private void traiterExpirations(LocalDate dateTraitement) {
        periodeRepository.findByStatutAndDateFinBefore(
                        StatutPeriodeAbonnement.ACTIVE,
                        dateTraitement
                ).forEach(periode -> {
                    if (!abonnementRegulierActif(periode)) {
                        return;
                    }

                    var periodeSuivante = periodeRepository
                            .findByAbonnementIdAndStatut(
                                    periode.getAbonnement().getId(),
                                    StatutPeriodeAbonnement.PLANIFIEE
                            )
                            .filter(suivante -> suivante.getDateDebut()
                                    .equals(periode.getDateFin().plusDays(1)));

                    periode.marquerExpiree();
                    if (periodeSuivante.isPresent()) {
                        periodeSuivante.get().activer();
                        annulerNotificationsEnAttente(periode);
                        return;
                    }

                    periode.getAbonnement().marquerExpire();
                    carteRepository.findByAbonnementId(
                                    periode.getAbonnement().getId())
                            .stream()
                            .filter(carte -> carte.getStatut()
                                    != StatutCarteAcces.EXPIREE)
                            .filter(carte -> carte.getStatut()
                                    != StatutCarteAcces.DESACTIVEE)
                            .forEach(carte -> carte.expirer());
                    creerNotificationExpiration(periode, dateTraitement);
                });
    }

    private boolean abonnementRegulierActif(PeriodeAbonnement periode) {
        Object abonnement = Hibernate.unproxy(periode.getAbonnement());
        return abonnement instanceof AbonnementRegulier
                && periode.getAbonnement().getStatut() == StatutAbonnement.ACTIF;
    }

    private boolean renouvellementPlanifie(PeriodeAbonnement periode) {
        return periodeRepository.findByAbonnementIdAndStatut(
                        periode.getAbonnement().getId(),
                        StatutPeriodeAbonnement.PLANIFIEE
                )
                .filter(suivante -> suivante.getDateDebut()
                        .equals(periode.getDateFin().plusDays(1)))
                .isPresent();
    }

    private void creerRappel(
            PeriodeAbonnement periode,
            LocalDate dateTraitement,
            int joursRestants,
            TypeNotification type
    ) {
        ClientParticulier client = client(periode);
        if (!emailDisponible(client)) return;

        String sujet = "Votre abonnement RRM expire dans "
                + joursRestants + " jours";
        String message = "Votre abonnement "
                + periode.getAbonnement().getReference()
                + " prendra fin le " + periode.getDateFin() + ".";
        creerNotification(
                periode, client, type, sujet,
                contenuEmail(client, sujet, message),
                dateTraitement
        );
    }

    private void creerNotificationExpiration(
            PeriodeAbonnement periode,
            LocalDate dateTraitement
    ) {
        ClientParticulier client = client(periode);
        if (!emailDisponible(client)) return;

        String sujet = "Votre abonnement RRM est terminé";
        String message = "Votre abonnement "
                + periode.getAbonnement().getReference()
                + " est terminé. Votre carte ne permet plus l'accès au parking.";
        creerNotification(
                periode, client, TypeNotification.ABONNEMENT_EXPIRE,
                sujet, contenuEmail(client, sujet, message), dateTraitement
        );
    }

    private void creerNotification(
            PeriodeAbonnement periode,
            ClientParticulier client,
            TypeNotification type,
            String sujet,
            String contenu,
            LocalDate dateTraitement
    ) {
        String referenceMetier = referenceMetier(periode);
        if (notificationRepository
                .findByReferenceMetierAndTypeNotification(referenceMetier, type)
                .isPresent()) {
            return;
        }

        notificationRepository.save(Notification.pourClient(
                genererReferenceNotification(), type, CanalNotification.EMAIL,
                sujet, contenu, client.getEmail(), client,
                referenceMetier, dateTraitement.atStartOfDay()
        ));
    }

    private void annulerNotificationsEnAttente(PeriodeAbonnement periode) {
        notificationRepository.findByReferenceMetier(referenceMetier(periode))
                .stream()
                .filter(notification -> notification.getStatut()
                        == StatutNotification.A_ENVOYER
                        || notification.getStatut() == StatutNotification.ECHEC)
                .forEach(Notification::annuler);
    }

    private void envoyerNotificationsEnAttente(LocalDateTime dateLimite) {
        EmailEnvoiService emailService = emailServiceProvider.getIfAvailable();
        if (emailService == null) return;

        notificationRepository
                .findByStatutInAndDateEnvoiPrevueLessThanEqualOrderByDateEnvoiPrevueAsc(
                        List.of(StatutNotification.A_ENVOYER,
                                StatutNotification.ECHEC),
                        dateLimite
                ).stream()
                .filter(notification -> notification.getCanal()
                        == CanalNotification.EMAIL)
                .forEach(notification -> envoyer(notification, emailService));
    }

    private void envoyer(
            Notification notification,
            EmailEnvoiService emailService
    ) {
        try {
            emailService.envoyer(
                    notification.getAdresseDestination(),
                    nomClient(notification),
                    notification.getSujet(),
                    notification.getContenu()
            );
            notification.marquerCommeEnvoyee();
        } catch (RuntimeException exception) {
            notification.marquerEchec(
                    exception.getMessage() == null
                            ? "Échec de l'envoi de l'email"
                            : exception.getMessage()
            );
            log.error("Échec de la notification {}",
                    notification.getReference(), exception);
        }
    }

    private ClientParticulier client(PeriodeAbonnement periode) {
        return ((AbonnementRegulier) Hibernate.unproxy(
                periode.getAbonnement())).getClient();
    }

    private boolean emailDisponible(ClientParticulier client) {
        return client.getEmail() != null && !client.getEmail().isBlank();
    }

    private String nomClient(Notification notification) {
        Object client = Hibernate.unproxy(notification.getClientDestinataire());
        return client instanceof ClientParticulier particulier
                ? particulier.getNomComplet()
                : "Client RRM";
    }

    private String contenuEmail(
            ClientParticulier client,
            String titre,
            String message
    ) {
        return """
                <!DOCTYPE html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                  <h2 style="color:#075985">%s</h2>
                  <p>Bonjour <strong>%s</strong>,</p><p>%s</p>
                  <p><a href="%s" style="display:inline-block;background:#075985;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px">Renouveler mon abonnement</a></p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                  <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                </div></body></html>
                """.formatted(
                HtmlUtils.htmlEscape(titre),
                HtmlUtils.htmlEscape(client.getNomComplet()),
                HtmlUtils.htmlEscape(message),
                HtmlUtils.htmlEscape(renewalUrl)
        );
    }

    private String referenceMetier(PeriodeAbonnement periode) {
        return "PERIODE-ABONNEMENT-" + periode.getId();
    }

    private String genererReferenceNotification() {
        String reference;
        do {
            reference = "NOTIF-ABO-"
                    + UUID.randomUUID().toString().substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (notificationRepository.existsByReference(reference));
        return reference;
    }
}
