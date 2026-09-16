package com.rrm.parking.facturation.service;

import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.dto.response.RecuConsultationResponse;
import com.rrm.parking.facturation.dto.response.RecuEmailResponse;
import com.rrm.parking.notification.service.EmailEnvoiService;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RecuEmailServiceTest {

    @Test
    void doitJoindreLePdfEtAfficherLeDecompteTtc() {
        RecuConsultationService consultationService =
                mock(RecuConsultationService.class);
        RecuPdfService pdfService =
                mock(RecuPdfService.class);
        EmailEnvoiService emailEnvoiService =
                mock(EmailEnvoiService.class);

        RecuConsultationResponse recu = new RecuConsultationResponse(
                42L,
                "REC-20260916-TEST",
                LocalDateTime.of(2026, 9, 16, 14, 0),
                new BigDecimal("1100.00"),
                new BigDecimal("1050.00"),
                new BigDecimal("50.00"),
                ModePaiement.ESPECE,
                7L,
                "PAY-20260916-TEST",
                StatutPaiement.CONFIRME,
                null,
                null,
                null,
                null,
                10L,
                "DEM-20260916-TEST",
                StatutDemande.PAYEE,
                "Bab Chellah",
                3,
                5L,
                "Agent Test",
                3L,
                "Client Test",
                "Test",
                "Client",
                "AB123456",
                "client@example.com",
                "0612345678"
        );
        byte[] pdf = "%PDF-test".getBytes();

        when(consultationService.consulter(42L))
                .thenReturn(recu);
        when(pdfService.generer(42L)).thenReturn(pdf);

        RecuEmailService service = new RecuEmailService(
                consultationService,
                pdfService,
                emailEnvoiService
        );

        RecuEmailResponse reponse = service.envoyer(42L);

        ArgumentCaptor<String> contenuHtml =
                ArgumentCaptor.forClass(String.class);
        verify(emailEnvoiService).envoyerAvecPieceJointe(
                org.mockito.ArgumentMatchers.eq("client@example.com"),
                org.mockito.ArgumentMatchers.eq("Client Test"),
                org.mockito.ArgumentMatchers.eq(
                        "Votre reçu de paiement RRM REC-20260916-TEST"
                ),
                contenuHtml.capture(),
                org.mockito.ArgumentMatchers.same(pdf),
                org.mockito.ArgumentMatchers.eq(
                        "REC-20260916-TEST.pdf"
                )
        );

        assertTrue(contenuHtml.getValue().contains("1050.00 DH TTC"));
        assertTrue(contenuHtml.getValue().contains("50.00 DH TTC"));
        assertTrue(contenuHtml.getValue().contains("1100.00 DH TTC"));
        assertEquals("ENVOYE", reponse.statut());
    }
}
