package com.rrm.parking.demande.event;

import com.rrm.parking.notification.service.EmailEnvoiService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class DemandeOtpValideeEmailListenerTest {

    @Test
    void detailleAbonnementCarteEtTotalDansLEmail() {
        EmailEnvoiService emailEnvoiService = mock(EmailEnvoiService.class);
        DemandeOtpValideeEmailListener listener =
                new DemandeOtpValideeEmailListener(emailEnvoiService);

        DemandeOtpValideeEvent evenement = new DemandeOtpValideeEvent(
                "client@example.com",
                "Client Test",
                "DEM-20260916-TEST",
                "Bab El Had",
                "Rabat",
                "Nuit 5j/7",
                3,
                new BigDecimal("900.00"),
                new BigDecimal("50.00"),
                new BigDecimal("950.00"),
                "ESPECE",
                LocalDate.of(2026, 9, 23)
        );

        listener.envoyerConfirmation(evenement);

        ArgumentCaptor<String> contenu = ArgumentCaptor.forClass(String.class);
        verify(emailEnvoiService).envoyer(
                eq("client@example.com"),
                eq("Client Test"),
                eq("Confirmation de votre demande DEM-20260916-TEST"),
                contenu.capture()
        );

        assertThat(contenu.getValue())
                .contains("Abonnement TTC", "900.00 DH")
                .contains("Carte d’accès TTC", "50.00 DH")
                .contains("Total à payer TTC", "950.00 DH");
    }
}
