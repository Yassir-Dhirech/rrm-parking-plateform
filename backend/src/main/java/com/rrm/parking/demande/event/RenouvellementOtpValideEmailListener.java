package com.rrm.parking.demande.event;

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
public class RenouvellementOtpValideEmailListener {

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyerConfirmation(RenouvellementOtpValideEvent evenement) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.nomComplet(),
                    "Confirmation de votre renouvellement " + evenement.reference(),
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "Ã‰chec de l'email de confirmation du renouvellement {}",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(RenouvellementOtpValideEvent evenement) {
        String nom = HtmlUtils.htmlEscape(evenement.nomComplet());
        String reference = HtmlUtils.htmlEscape(evenement.reference());
        String abonnement = HtmlUtils.htmlEscape(evenement.referenceAbonnement());
        String parking = HtmlUtils.htmlEscape(evenement.parkingNom());
        String forfait = HtmlUtils.htmlEscape(evenement.forfaitLibelle());
        String mode = HtmlUtils.htmlEscape(evenement.modePaiement().replace('_', ' '));
        String dateLimite = evenement.dateLimitePaiement()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;color:#0f172a">
                  <div style="max-width:640px;margin:auto;background:white;border-radius:12px;overflow:hidden">
                    <div style="background:#075985;color:white;padding:24px">
                      <h1 style="margin:0;font-size:24px">Renouvellement confirmÃ©</h1>
                    </div>
                    <div style="padding:28px">
                      <p>Bonjour <strong>%s</strong>,</p>
                      <p>Votre demande de renouvellement a Ã©tÃ© confirmÃ©e aprÃ¨s validation de l'OTP.</p>
                      <p><strong>Demande :</strong> %s<br>
                         <strong>Abonnement :</strong> %s<br>
                         <strong>Parking :</strong> %s<br>
                         <strong>Forfait :</strong> %s<br>
                         <strong>DurÃ©e :</strong> %d mois<br>
                         <strong>Mode de paiement :</strong> %s</p>
                      <div style="background:#ecfdf5;padding:16px;border-radius:8px">
                        <strong>Total Ã  payer : %s DH TTC</strong><br>
                        Aucun frais de nouvelle carte n'est appliquÃ©.
                      </div>
                      <p>Veuillez effectuer le paiement avant le <strong>%s</strong>.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                nom,
                reference,
                abonnement,
                parking,
                forfait,
                evenement.dureeEnMois(),
                mode,
                evenement.montantTotalTtc().toPlainString(),
                dateLimite
        );
    }
}