package com.rrm.parking.paiement.event;

import com.rrm.parking.facturation.service.RecuEmailService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class PaiementConfirmeEmailListenerTest {

    @Test
    void doitEnvoyerLeRecuApresConfirmation() {
        RecuEmailService recuEmailService =
                mock(RecuEmailService.class);
        PaiementConfirmeEmailListener listener =
                new PaiementConfirmeEmailListener(
                        recuEmailService
                );

        listener.envoyerRecu(
                new PaiementConfirmeEvent(42L)
        );

        verify(recuEmailService).envoyer(42L);
    }

    @Test
    void neDoitPasPropagerUneErreurEmail() {
        RecuEmailService recuEmailService =
                mock(RecuEmailService.class);
        doThrow(new IllegalStateException("Brevo indisponible"))
                .when(recuEmailService)
                .envoyer(42L);

        PaiementConfirmeEmailListener listener =
                new PaiementConfirmeEmailListener(
                        recuEmailService
                );

        assertDoesNotThrow(() ->
                listener.envoyerRecu(
                        new PaiementConfirmeEvent(42L)
                )
        );
    }
}
