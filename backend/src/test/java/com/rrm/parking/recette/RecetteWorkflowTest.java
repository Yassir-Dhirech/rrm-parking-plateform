package com.rrm.parking.recette;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.recette.entity.LigneRecette;
import com.rrm.parking.recette.entity.Recette;
import com.rrm.parking.recette.entity.StatutRecette;
import com.rrm.parking.recette.service.RecetteDocumentService;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecetteWorkflowTest {
    private Recette recette() {
        Parking parking = new Parking(); parking.setNom("Bab El Had");
        Utilisateur superviseur = new Utilisateur(); superviseur.setPrenom("Samir"); superviseur.setNom("El Amrani");
        Recette r = new Recette("ARR-TEST", parking, superviseur, LocalDate.of(2026, 9, 29));
        LigneRecette cash = mock(LigneRecette.class);
        when(cash.getModePaiement()).thenReturn("ESPECE"); when(cash.getMontant()).thenReturn(new BigDecimal("600.00"));
        when(cash.getClientNom()).thenReturn("Client A");
        when(cash.getDatePaiement()).thenReturn(LocalDateTime.of(2026, 9, 20, 10, 0));
        LigneRecette cheque = mock(LigneRecette.class);
        when(cheque.getModePaiement()).thenReturn("CHEQUE"); when(cheque.getMontant()).thenReturn(new BigDecimal("900.00"));
        when(cheque.getClientNom()).thenReturn("Client B");
        when(cheque.getDatePaiement()).thenReturn(LocalDateTime.of(2026, 9, 25, 14, 0));
        r.ajouter(cash); r.ajouter(cheque);
        return r;
    }

    @Test
    void totalEtReceptionConforme() {
        Recette r = recette();
        assertEquals(new BigDecimal("600.00"), r.getTotalEspeces());
        assertEquals(new BigDecimal("900.00"), r.getTotalCheques());
        r.transmettre();
        assertEquals(StatutRecette.TRANSMISE, r.getStatut());
        r.receptionner(new Utilisateur(), new BigDecimal("600.00"), new BigDecimal("900.00"), 1, "", "AR-TEST");
        assertEquals(StatutRecette.RECUE, r.getStatut());
        assertThrows(IllegalStateException.class, () -> r.receptionner(new Utilisateur(), BigDecimal.ZERO, BigDecimal.ZERO, 0, "", "AR-2"));
    }

    @Test
    void ecartExigeObservationEtConserveLesDeuxMontants() {
        Recette r = recette(); r.transmettre();
        assertThrows(IllegalArgumentException.class, () -> r.receptionner(new Utilisateur(), new BigDecimal("500"),
                new BigDecimal("900"), 1, "", "AR-TEST"));
        r.receptionner(new Utilisateur(), new BigDecimal("500"), new BigDecimal("900"), 1, "Espèces manquantes", "AR-TEST");
        assertEquals(StatutRecette.RECUE_AVEC_RESERVES, r.getStatut());
        assertEquals(new BigDecimal("600.00"), r.getTotalEspeces());
        assertEquals(new BigDecimal("500"), r.getMontantEspecesRecu());
    }

    @Test
    void annulationBrouillonLibereSesLignes() {
        Recette r = recette(); r.annuler();
        assertTrue(r.getLignes().isEmpty());
        assertEquals(StatutRecette.ANNULEE, r.getStatut());
        assertThrows(IllegalStateException.class, r::transmettre);
    }

    @Test
    void excelSuitLaFeuilleVersementsEtLeTotal() throws Exception {
        Recette r = recette();
        byte[] bytes = new RecetteDocumentService().excel(r);
        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            var sheet = wb.getSheet("Versements à RRM");
            assertNotNull(sheet);
            assertEquals("N° de facture", sheet.getRow(9).getCell(0).getStringCellValue());
            assertEquals("TTC", sheet.getRow(9).getCell(9).getStringCellValue());
            assertEquals(600.0, sheet.getRow(10).getCell(9).getNumericCellValue());
            assertEquals(900.0, sheet.getRow(11).getCell(9).getNumericCellValue());
            assertEquals("SUM(J11:J12)", sheet.getRow(12).getCell(9).getCellFormula());
            assertEquals(1, wb.getAllPictures().size());
            var picture = (org.apache.poi.xssf.usermodel.XSSFPicture) sheet.getDrawingPatriarch().getShapes().getFirst();
            var anchor = (org.apache.poi.xssf.usermodel.XSSFClientAnchor) picture.getAnchor();
            assertTrue(anchor.getCol2() >= 1 && anchor.getRow2() >= 1, "Le logo doit occuper une surface visible");
            assertEquals(org.apache.poi.ss.usermodel.BorderStyle.THIN,
                    sheet.getRow(10).getCell(2).getCellStyle().getBorderBottom());
            assertEquals(org.apache.poi.ss.usermodel.BorderStyle.THIN,
                    sheet.getRow(10).getCell(2).getCellStyle().getBorderRight());
        }
    }

    @Test
    void accusePdfApresReceptionUniquement() throws Exception {
        Recette r = recette();
        RecetteDocumentService documents = new RecetteDocumentService();
        assertThrows(IllegalStateException.class, () -> documents.accuse(r));
        Utilisateur comptable = new Utilisateur(); comptable.setPrenom("Fatine"); comptable.setNom("Chraibi");
        r.transmettre();
        r.receptionner(comptable, new BigDecimal("600.00"), new BigDecimal("900.00"), 1, "", "AR-TEST");
        byte[] pdf = documents.accuse(r);
        assertEquals("%PDF", new String(pdf, 0, 4, java.nio.charset.StandardCharsets.US_ASCII));
        try (var doc = org.apache.pdfbox.Loader.loadPDF(pdf)) {
            assertTrue(doc.getPage(0).getResources().getXObjectNames().iterator().hasNext());
            String texte = new org.apache.pdfbox.text.PDFTextStripper().getText(doc);
            assertTrue(texte.contains("Informations de l'arrêté"));
            assertTrue(texte.contains("Détail de la remise"));
            assertTrue(texte.contains("Signature du comptable"));
        }
    }

    @Test
    void observationLongueEstConserveeEnAnnexe() throws Exception {
        Recette r = recette();
        String observation = "Écart justifié par le comptage physique des chèques. ".repeat(35);
        r.transmettre();
        r.receptionner(new Utilisateur(), new BigDecimal("500"), new BigDecimal("900"), 1, observation, "AR-LONG");
        try (var doc = org.apache.pdfbox.Loader.loadPDF(new RecetteDocumentService().accuse(r))) {
            assertTrue(doc.getNumberOfPages() > 1);
            String texte = new org.apache.pdfbox.text.PDFTextStripper().getText(doc);
            assertTrue(texte.contains("Observation détaillée en annexe"));
            assertTrue(texte.contains("comptage physique des chèques"));
        }
    }
}
