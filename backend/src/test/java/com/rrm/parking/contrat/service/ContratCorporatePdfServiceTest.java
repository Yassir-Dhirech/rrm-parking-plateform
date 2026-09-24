package com.rrm.parking.contrat.service;

import com.rrm.parking.demande.dto.response.DemandeCorporateDetailResponse;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.service.DemandeCorporateResponsableService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContratCorporatePdfServiceTest {

    @Test
    void doitRemplirLeModeleOfficielDeDouzePages() throws Exception {
        DemandeCorporateResponsableService responsable =
                mock(DemandeCorporateResponsableService.class);
        when(responsable.consulter(38L)).thenReturn(demandeCorporate());

        byte[] resultat = new ContratCorporatePdfService(responsable).generer(38L);

        try (PDDocument document = Loader.loadPDF(resultat)) {
            assertEquals(12, document.getNumberOfPages());
            String texte = new PDFTextStripper()
                    .getText(document)
                    .replaceAll("\\s+", " ");
            assertTrue(texte.contains("SOCIETE CORPORATE TEST"));
            assertTrue(texte.contains("MEDUSE TEST"));
            assertTrue(texte.contains("AB123456"));
            assertTrue(texte.contains("Bab Chellah"));
            assertTrue(texte.contains("270 150,00 Dhs"));
            assertTrue(texte.contains("CONDITIONS GENERALES"));
        }
    }

    private DemandeCorporateDetailResponse demandeCorporate() {
        return new DemandeCorporateDetailResponse(
                38L,
                "DEM-CORP-TEST",
                StatutDemande.VALIDEE,
                null,
                null,
                null,
                null,
                null,
                "SOCIETE CORPORATE TEST",
                "009876543210123",
                "RC-12345",
                "TF-12345/2026",
                "TEST",
                "MEDUSE",
                "AB123456",
                "0612345678",
                "corporate@example.com",
                "Construction d'un immeuble R+4 à usage de bureaux",
                "Avenue El Abtal 22, Rabat Agdal",
                "Tous les jours de 08h00 à 20h00",
                8L,
                "Bab Chellah",
                3,
                240,
                new BigDecimal("375.00"),
                new BigDecimal("270000.00"),
                new BigDecimal("150.00"),
                new BigDecimal("270150.00"),
                List.of("12345-A-1"),
                1L,
                "CTR-RRM-TEST",
                "EN_PREPARATION"
        );
    }
}
