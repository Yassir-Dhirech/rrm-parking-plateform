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
public class CorporateOtpValideEmailListener {

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyerConfirmation(CorporateOtpValideEvent evenement) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.destinataire(),
                    "Confirmation de votre demande corporate "
                            + evenement.reference(),
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "Échec de l'email corporate pour la demande {}",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(CorporateOtpValideEvent evenement) {
        return """
                <!DOCTYPE html>
                <html lang="fr"><body style="font-family:Arial,sans-serif;color:#0f172a">
                <div style="max-width:640px;margin:auto;padding:28px">
                  <h1 style="color:#075985">Demande corporate confirmée</h1>
                  <p>Bonjour <strong>%s</strong>,</p>
                  <p>La demande de <strong>%s</strong> a été confirmée après validation du code OTP.</p>
                  <div style="padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
                    <p><strong>Référence :</strong> %s</p>
                    <p><strong>Projet :</strong> %s</p>
                    <p><strong>Parking :</strong> %s</p>
                    <p><strong>Places et cartes :</strong> %d</p>
                    <p><strong>Prix mensuel unitaire :</strong> %s DH TTC</p>
                    <p><strong>Abonnement 240 mois :</strong> %s DH TTC</p>
                    <p><strong>Cartes RFID :</strong> %s DH TTC</p>
                    <p><strong>Total :</strong> %s DH TTC</p>
                  </div>
                  <p>Votre dossier sera étudié par le responsable RRM. Conservez cette référence pour le suivi.</p>
                </div></body></html>
                """.formatted(
                echapper(evenement.destinataire()),
                echapper(evenement.raisonSociale()),
                echapper(evenement.reference()),
                echapper(evenement.libelleProjet()),
                echapper(evenement.parkingNom()),
                evenement.nombrePlaces(),
                evenement.prixMensuelUnitaireTtc().toPlainString(),
                evenement.montantAbonnementTtc().toPlainString(),
                evenement.fraisCartesTtc().toPlainString(),
                evenement.montantTotalTtc().toPlainString()
        );
    }

    private String echapper(String valeur) {
        return HtmlUtils.htmlEscape(valeur == null ? "" : valeur);
    }
}
