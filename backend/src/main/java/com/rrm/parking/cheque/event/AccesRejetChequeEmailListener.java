package com.rrm.parking.cheque.event;

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
@ConditionalOnProperty(name = "app.integration.brevo.enabled", havingValue = "true")
public class AccesRejetChequeEmailListener {
    private final EmailEnvoiService emails;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void envoyer(AccesRejetChequeEvent event) {
        try {
            String detail = event.accesRetabli()
                    ? "Toutes les cartes liées à cet abonnement ont été réactivées. Votre accès au parking est rétabli."
                    : "Votre abonnement est temporairement bloqué et vous n'avez plus accès au parking. "
                    + "Veuillez régulariser votre situation avec la banque, vérifier votre solde, puis effectuer "
                    + "un nouveau paiement en espèces ou par chèque certifié auprès du parking.";
            emails.envoyer(event.email(), event.clientNom(),
                    event.accesRetabli() ? "Votre accès au parking est rétabli"
                            : "Votre abonnement de parking est temporairement bloqué",
                    "<p>Bonjour " + HtmlUtils.htmlEscape(event.clientNom()) + ",</p><p>"
                            + detail + "</p><p>Abonnement : "
                            + HtmlUtils.htmlEscape(event.abonnementReference()) + "</p>");
        } catch (RuntimeException erreur) {
            log.error("Échec de l'envoi du message pour l'abonnement {}",
                    event.abonnementReference(), erreur);
        }
    }
}
