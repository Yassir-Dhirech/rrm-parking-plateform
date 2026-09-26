package com.rrm.parking.paiement.event;

import com.rrm.parking.facturation.service.RecuEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class PaiementConfirmeEmailListener {

    private final RecuEmailService recuEmailService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void envoyerRecu(
            PaiementConfirmeEvent evenement
    ) {
        try {
            recuEmailService.envoyer(evenement.recuId());
        } catch (RuntimeException exception) {
            log.error(
                    "Le paiement est confirmé, mais l'envoi du reçu {} a échoué",
                    evenement.recuId(),
                    exception
            );
        }
    }
}
