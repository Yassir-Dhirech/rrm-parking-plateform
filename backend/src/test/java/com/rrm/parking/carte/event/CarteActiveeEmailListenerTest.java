package com.rrm.parking.carte.event;

import com.rrm.parking.facturation.service.FacturePdfService;
import com.rrm.parking.notification.service.EmailEnvoiService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CarteActiveeEmailListenerTest {

    @Test
    void envoieLaFactureApresReactivationDuRenouvellement() {
        EmailEnvoiService emailEnvoiService =
                mock(EmailEnvoiService.class);
        FacturePdfService facturePdfService =
                mock(FacturePdfService.class);
        byte[] pdf = "%PDF-renouvellement".getBytes();
        when(facturePdfService.generer(12L)).thenReturn(pdf);

        CarteActiveeEmailListener listener =
                new CarteActiveeEmailListener(
                        emailEnvoiService,
                        facturePdfService
                );
        CarteActiveeEvent evenement = new CarteActiveeEvent(
                12L,
                "DEM-REN-20260922-TEST",
                "CARTE-20260919-TEST",
                "client@example.com",
                "Client Test",
                true,
                LocalDate.of(2026, 12, 19),
                LocalDate.of(2027, 3, 18)
        );

        listener.envoyer(evenement);

        ArgumentCaptor<String> contenu =
                ArgumentCaptor.forClass(String.class);
        verify(emailEnvoiService).envoyerAvecPieceJointe(
                eq("client@example.com"),
                eq("Client Test"),
                eq("Votre abonnement RRM a été renouvelé"),
                contenu.capture(),
                same(pdf),
                eq("facture-DEM-REN-20260922-TEST.pdf")
        );
        assertTrue(contenu.getValue().contains("réactivée et testée"));
        assertTrue(contenu.getValue().contains("19/12/2026"));
        assertTrue(contenu.getValue().contains("18/03/2027"));
    }
}
