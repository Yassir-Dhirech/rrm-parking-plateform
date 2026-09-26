package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

class DemandeCorporateConvoqueeEmailListenerTest {

    @Test
    void doitInformerDuChequeDeLaSignatureEtDeLaLegalisationSansPieceJointe() {
        EmailEnvoiService email = mock(EmailEnvoiService.class);
        DemandeCorporateConvoqueeEmailListener listener =
                new DemandeCorporateConvoqueeEmailListener(email);
        DemandeCorporateConvoqueeEvent evenement =
                new DemandeCorporateConvoqueeEvent(
                        "DEM-CORP-TEST",
                        "SOCIETE TEST",
                        "MEDUSE TEST",
                        "corporate@example.com",
                        "Bab Chellah",
                        new BigDecimal("270150.00"),
                        LocalDateTime.of(2026, 9, 24, 14, 0)
                );

        listener.envoyer(evenement);

        ArgumentCaptor<String> contenu = ArgumentCaptor.forClass(String.class);
        verify(email).envoyer(
                eq("corporate@example.com"),
                eq("MEDUSE TEST"),
                eq("Votre demande corporate DEM-CORP-TEST est validée - rendez-vous au siège RRM"),
                contenu.capture()
        );
        assertThat(contenu.getValue())
                .contains("chèque", "270150,00 DH TTC")
                .contains("signerez le contrat")
                .contains("faire légaliser")
                .contains("n'est pas joint");
        verifyNoMoreInteractions(email);
    }
}
