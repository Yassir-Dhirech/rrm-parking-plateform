package com.rrm.parking.facturation.service;

import com.rrm.parking.facturation.dto.response.FactureLigneResponse;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FacturePdfServiceTest {

    @Test
    void factureRespecteLeNouveauModeleEtLesDonneesDuPaiement() throws Exception {
        FacturationService facturation = mock(FacturationService.class);
        when(facturation.consulter(1L)).thenReturn(factureExemple());

        byte[] pdf = new FacturePdfService(facturation).generer(1L);
        String aperçu = System.getProperty("invoice.preview.path");
        if (aperçu != null && !aperçu.isBlank()) {
            Files.write(Path.of(aperçu), pdf);
        }

        try (PDDocument document = Loader.loadPDF(pdf)) {
            assertEquals(1, document.getNumberOfPages());
            String texte = new PDFTextStripper().getText(document)
                    .replaceAll("\\s+", " ");
            assertTrue(texte.contains("ARRIBATTE DEVELLOPEMENT HOTELIERIE SARL"));
            assertTrue(texte.contains("03 RUE MCASCAR,HASSAN RABAT"));
            assertTrue(texte.contains("002268411000061"));
            assertTrue(texte.contains("Carte d’abonnement magnétique"));
            assertTrue(texte.contains("AAA N°0000184"));
            assertTrue(texte.contains("Ismail Behnane"));
            assertTrue(texte.contains("Responsable Business Unit"));
            assertTrue(texte.contains("Stationnement"));
            assertTrue(texte.contains("120 050,00"));
        }
    }

    private FactureResponse factureExemple() {
        BigDecimal taux = new BigDecimal("20.00");
        return new FactureResponse(
                1L, "P.B_HAD-106/2026", StatutFacture.EMISE, null,
                LocalDateTime.of(2026, 5, 18, 9, 0),
                1L, "PAY-1", 1L, "DEM-1",
                "ARRIBATTE DEVELLOPEMENT HOTELIERIE SARL",
                "002268411000061", "03 RUE MCASCAR,HASSAN RABAT",
                "client@example.ma", "ABO-1", "BAB AL HAD",
                "Jour lundi au dimanche de 08h à 20h .,", 240,
                LocalDate.of(2026, 5, 13), LocalDate.of(2046, 5, 12),
                null, "CHEQUE", "AAA N°0000184",
                new BigDecimal("100041.67"), new BigDecimal("20008.33"),
                new BigDecimal("120050.00"),
                List.of(
                        new FactureLigneResponse(1L, TypeLigneFacture.ABONNEMENT,
                                "Abonnement Jour lundi au dimanche de 08h à 20h .",
                                1, new BigDecimal("100000.00"), taux,
                                new BigDecimal("100000.00"),
                                new BigDecimal("20000.00"),
                                new BigDecimal("120000.00")),
                        new FactureLigneResponse(2L, TypeLigneFacture.CARTE_ACCES,
                                "Carte d'abonnement magnétique", 1,
                                new BigDecimal("41.67"), taux,
                                new BigDecimal("41.67"), new BigDecimal("8.33"),
                                new BigDecimal("50.00"))
                )
        );
    }
}
