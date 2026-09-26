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
public class DemandeCorporateRefuseeEmailListener {

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyer(DemandeCorporateRefuseeEvent evenement) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.destinataire(),
                    "Décision concernant votre demande corporate "
                            + evenement.reference(),
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "La demande corporate {} a été refusée, mais l'e-mail n'a pas pu être envoyé",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(DemandeCorporateRefuseeEvent evenement) {
        return """
                <!DOCTYPE html>
                <html lang="fr"><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                  <h2 style="color:#991b1b">Demande corporate refusée</h2>
                  <p>Bonjour <strong>%s</strong>,</p>
                  <p>Après étude du dossier de <strong>%s</strong>, la demande <strong>%s</strong> n'a pas été retenue.</p>
                  <p><strong>Motif du refus :</strong></p>
                  <div style="padding:14px;background:#fef2f2;border-left:4px solid #dc2626">%s</div>
                  <p>Pour toute précision, veuillez contacter Rabat Région Mobilité.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                  <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                </div></body></html>
                """.formatted(
                echapper(evenement.destinataire()),
                echapper(evenement.raisonSociale()),
                echapper(evenement.reference()),
                echapper(evenement.motif())
        );
    }

    private String echapper(String valeur) {
        return HtmlUtils.htmlEscape(valeur == null ? "" : valeur);
    }
}
