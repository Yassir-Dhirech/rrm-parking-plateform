package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class CorrectionDemandeEmailListener {

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void envoyer(
            CorrectionDemandeDemandeeEvent evenement
    ) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.nomClient(),
                    "Correction nécessaire pour votre demande "
                            + evenement.referenceDemande(),
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "La demande {} attend une correction, mais l'e-mail n'a pas pu être envoyé",
                    evenement.referenceDemande(),
                    exception
            );
        }
    }

    private String construireContenu(
            CorrectionDemandeDemandeeEvent evenement
    ) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                  <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                    <h2 style="color:#075985">Correction de votre dossier</h2>
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Votre demande <strong>%s</strong> nécessite une correction avant sa validation finale.</p>
                    <p><strong>Motif :</strong></p>
                    <div style="padding:14px;background:#fff7ed;border-left:4px solid #f97316">%s</div>
                    <p>Votre paiement reste enregistré. Aucun nouveau paiement ne sera demandé.</p>
                    <p>Veuillez corriger le même dossier puis le renvoyer en validation.</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                    <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                  </div>
                </body>
                </html>
                """.formatted(
                HtmlUtils.htmlEscape(evenement.nomClient()),
                HtmlUtils.htmlEscape(evenement.referenceDemande()),
                HtmlUtils.htmlEscape(evenement.motif())
        );
    }
}
