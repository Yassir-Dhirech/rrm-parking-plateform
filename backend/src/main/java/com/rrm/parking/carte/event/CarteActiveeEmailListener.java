package com.rrm.parking.carte.event;

import com.rrm.parking.facturation.service.FacturePdfService;
import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class CarteActiveeEmailListener {

    private static final DateTimeFormatter DATE_FRANCAISE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final EmailEnvoiService emailEnvoiService;
    private final FacturePdfService facturePdfService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyer(CarteActiveeEvent evenement) {
        try {
            byte[] facture = facturePdfService.generer(evenement.factureId());
            emailEnvoiService.envoyerAvecPieceJointe(
                    evenement.email(), evenement.nomClient(),
                    evenement.renouvellement()
                            ? "Votre abonnement RRM a été renouvelé"
                            : "Votre carte d'accès RRM est disponible",
                    construireContenu(evenement), facture,
                    "facture-" + evenement.referenceDemande() + ".pdf"
            );
        } catch (RuntimeException exception) {
            log.error(
                    "La carte {} est activée, mais l'e-mail de disponibilité a échoué",
                    evenement.referenceCarte(), exception);
        }
    }

    private String construireContenu(CarteActiveeEvent evenement) {
        if (evenement.renouvellement()) {
            return construireContenuRenouvellement(evenement);
        }

        return """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                  <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                    <h2 style="color:#075985">Votre carte d'accès est disponible</h2>
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Votre carte d'accès <strong>%s</strong> a été imprimée, activée et testée avec succès.</p>
                    <p>Vous pouvez venir la récupérer au parking. Votre facture imprimée et signée par le responsable y est également disponible.</p>
                    <p>La version PDF générée par la plateforme est jointe à cet e-mail.</p>
                    <p><strong>Référence de la demande :</strong> %s</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                    <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                  </div>
                </body>
                </html>
                """.formatted(
                HtmlUtils.htmlEscape(evenement.nomClient()),
                HtmlUtils.htmlEscape(evenement.referenceCarte()),
                HtmlUtils.htmlEscape(evenement.referenceDemande())
        );
    }

    private String construireContenuRenouvellement(
            CarteActiveeEvent evenement
    ) {
        String periode = evenement.dateDebut() == null
                || evenement.dateFin() == null
                ? ""
                : """
                    <p><strong>Nouvelle période :</strong> du %s au %s</p>
                    """.formatted(
                        evenement.dateDebut().format(DATE_FRANCAISE),
                        evenement.dateFin().format(DATE_FRANCAISE)
                );

        return """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                  <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                    <h2 style="color:#075985">Votre abonnement a été renouvelé</h2>
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Le renouvellement de votre abonnement a été validé. Votre carte d'accès <strong>%s</strong> a été réactivée et testée avec succès.</p>
                    %s
                    <p>La facture de votre renouvellement est jointe à cet e-mail.</p>
                    <p><strong>Référence de la demande :</strong> %s</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                    <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                  </div>
                </body>
                </html>
                """.formatted(
                HtmlUtils.htmlEscape(evenement.nomClient()),
                HtmlUtils.htmlEscape(evenement.referenceCarte()),
                periode,
                HtmlUtils.htmlEscape(evenement.referenceDemande())
        );
    }
}
