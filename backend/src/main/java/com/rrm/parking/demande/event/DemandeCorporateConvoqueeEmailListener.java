package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class DemandeCorporateConvoqueeEmailListener {

    private final EmailEnvoiService emailEnvoiService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyer(DemandeCorporateConvoqueeEvent evenement) {
        try {
            emailEnvoiService.envoyer(
                    evenement.email(),
                    evenement.destinataire(),
                    "Votre demande corporate " + evenement.reference()
                            + " est validée - rendez-vous au siège RRM",
                    construireContenu(evenement)
            );
        } catch (RuntimeException exception) {
            log.error(
                    "La convocation corporate {} a été enregistrée, mais l'e-mail n'a pas pu être envoyé",
                    evenement.reference(),
                    exception
            );
        }
    }

    private String construireContenu(
            DemandeCorporateConvoqueeEvent evenement
    ) {
        return """
                <!DOCTYPE html>
                <html lang="fr"><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px">
                <div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px">
                  <h2 style="color:#166534">Votre demande corporate est validée</h2>
                  <p>Bonjour <strong>%s</strong>,</p>
                  <p>La demande <strong>%s</strong> de la société <strong>%s</strong> a été validée. Le contrat relatif au parking <strong>%s</strong> est préparé.</p>
                  <div style="padding:16px;background:#f0fdf4;border-left:4px solid #16a34a">
                    <p><strong>Prochaine étape :</strong> veuillez vous présenter au siège de Rabat Région Mobilité muni du chèque de paiement d'un montant de <strong>%s DH TTC</strong>.</p>
                    <p>Vous signerez le contrat au bureau, l'emporterez pour le faire légaliser, puis remettrez le contrat légalisé au responsable RRM.</p>
                  </div>
                  <p><strong>Adresse :</strong> 1 rue Ghafsa, place Al Joulane, Hassan, Rabat.</p>
                  <p>Le contrat n'est pas joint à cet e-mail. Il sera mis à votre disposition au siège.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:25px 0">
                  <p style="font-size:12px;color:#64748b">Rabat Région Mobilité — RRM</p>
                </div></body></html>
                """.formatted(
                echapper(evenement.destinataire()),
                echapper(evenement.reference()),
                echapper(evenement.raisonSociale()),
                echapper(evenement.parkingNom()),
                echapper(formaterMontant(evenement.montantTotalTtc()))
        );
    }

    private String formaterMontant(BigDecimal valeur) {
        return valeur == null
                ? "0,00"
                : valeur.setScale(2, RoundingMode.HALF_UP)
                .toPlainString()
                .replace('.', ',');
    }

    private String echapper(String valeur) {
        return HtmlUtils.htmlEscape(valeur == null ? "" : valeur);
    }
}
