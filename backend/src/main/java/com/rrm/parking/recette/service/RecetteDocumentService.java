package com.rrm.parking.recette.service;

import com.rrm.parking.recette.entity.LigneRecette;
import com.rrm.parking.recette.entity.Recette;
import com.rrm.parking.recette.entity.StatutRecette;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.Units;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class RecetteDocumentService {
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] excel(Recette r) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet s = wb.createSheet("Versements à RRM");
            s.setDisplayGridlines(false);
            s.createRow(0).setHeightInPoints(42);
            s.createRow(1).setHeightInPoints(42);
            logo(wb, s, "/pdf/logo-rrm.png");
            String[] headers = {"N° de facture", "Abonné", "Client", "Mode de paiement", "N° chèque",
                    "Types d'abonnement", "Date début", "Date fin", "Vente Carte d'abonnement",
                    "TTC", "Observations", "Date de versement"};
            int[] widths = {22, 22, 28, 20, 20, 38, 16, 16, 22, 18, 38, 21};
            for (int i = 0; i < widths.length; i++) s.setColumnWidth(i, widths[i] * 256);
            CellStyle title = wb.createCellStyle();
            Font titleFont = wb.createFont(); titleFont.setBold(true); titleFont.setFontHeightInPoints((short) 15);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
            title.setFont(titleFont); title.setAlignment(HorizontalAlignment.CENTER);
            Row titleRow = s.createRow(2); titleRow.setHeightInPoints(28);
            titleRow.createCell(0).setCellValue("ETAT DES VERSEMENTS ESPECES ET REMISES DES CHEQUES DE L'ABONNEMENT");
            s.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(2, 2, 0, 11));
            s.getRow(2).getCell(0).setCellStyle(title);
            s.createRow(4).createCell(0).setCellValue("Parking de : " + r.getParking().getNom());
            s.createRow(5).createCell(0).setCellValue("Arrêté : " + r.getReference());
            s.createRow(6).createCell(0).setCellValue("Date d'arrêt : " + r.getDateArret().format(DATE)
                    + " | Année : " + r.getDateArret().getYear());
            if (!r.getLignes().isEmpty()) {
                var debut = r.getLignes().stream().map(l -> l.getDatePaiement().toLocalDate()).min(java.time.LocalDate::compareTo).orElseThrow();
                var fin = r.getLignes().stream().map(l -> l.getDatePaiement().toLocalDate()).max(java.time.LocalDate::compareTo).orElseThrow();
                s.createRow(7).createCell(0).setCellValue("Période des paiements sélectionnés : " + debut.format(DATE) + " au " + fin.format(DATE));
            }
            Row header = s.createRow(9); header.setHeightInPoints(42);
            CellStyle headStyle = wb.createCellStyle();
            fond(headStyle, 0, 82, 110);
            headStyle.setWrapText(true); headStyle.setAlignment(HorizontalAlignment.CENTER);
            headStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            Font bold = wb.createFont(); bold.setBold(true); bold.setColor(IndexedColors.WHITE.getIndex()); headStyle.setFont(bold);
            quadrillage(headStyle);
            for (int i = 0; i < headers.length; i++) { Cell c = header.createCell(i); c.setCellValue(headers[i]); c.setCellStyle(headStyle); }
            CellStyle[] body = {corps(wb, false, null), corps(wb, true, null)};
            CellStyle[] money = {corps(wb, false, "#,##0.00"), corps(wb, true, "#,##0.00")};
            CellStyle[] date = {corps(wb, false, "dd/mm/yyyy"), corps(wb, true, "dd/mm/yyyy")};
            int row = 10;
            for (LigneRecette l : r.getLignes()) {
                Row x = s.createRow(row++); x.setHeightInPoints(27);
                int bande = (row - 11) % 2;
                for (int i = 0; i < headers.length; i++) x.createCell(i).setCellStyle(body[bande]);
                set(x, 0, l.getNumeroFacture()); set(x, 1, l.getReferenceAbonnement()); set(x, 2, l.getClientNom());
                set(x, 3, l.getModePaiement().equals("ESPECE") ? "Espèce" : "Chèque");
                set(x, 4, l.getNumeroCheque()); set(x, 5, l.getTypeAbonnement());
                if (l.getDateDebutAbonnement() != null) { Cell c=x.getCell(6); c.setCellValue(l.getDateDebutAbonnement()); c.setCellStyle(date[bande]); }
                if (l.getDateFinAbonnement() != null) { Cell c=x.getCell(7); c.setCellValue(l.getDateFinAbonnement()); c.setCellStyle(date[bande]); }
                set(x, 8, l.isVenteCarte() ? "Oui" : "Non");
                Cell montant = x.getCell(9); montant.setCellValue(l.getMontant().doubleValue()); montant.setCellStyle(money[bande]);
                set(x, 10, l.getObservation());
                if (r.getDateReception() != null) { Cell c=x.getCell(11); c.setCellValue(r.getDateReception().toLocalDate()); c.setCellStyle(date[bande]); }
            }
            int first = 11;
            CellStyle summary = corps(wb, false, "#,##0.00");
            fond(summary, 229, 241, 246);
            Font summaryFont = wb.createFont(); summaryFont.setBold(true); summary.setFont(summaryFont);
            Row total = s.createRow(row++);
            ligneSynthese(total, headers.length, summary, "TOTAL TTC");
            total.getCell(9).setCellFormula("SUM(J" + first + ":J" + (row - 1) + ")");
            Row cash = s.createRow(row++); ligneSynthese(cash, headers.length, summary, "Espèces");
            cash.getCell(9).setCellValue(r.getTotalEspeces().doubleValue());
            Row cheque = s.createRow(row); ligneSynthese(cheque, headers.length, summary, "Chèques");
            cheque.getCell(9).setCellValue(r.getTotalCheques().doubleValue());
            s.createFreezePane(0, 10); s.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(9, Math.max(10, row - 3), 0, 11));
            s.setFitToPage(true); s.getPrintSetup().setLandscape(true);
            s.getPrintSetup().setPaperSize(PrintSetup.A3_PAPERSIZE);
            s.getPrintSetup().setFitWidth((short) 1); s.getPrintSetup().setFitHeight((short) 0);
            s.setRepeatingRows(new org.apache.poi.ss.util.CellRangeAddress(9, 9, -1, -1));
            s.setMargin(Sheet.LeftMargin, 0.25); s.setMargin(Sheet.RightMargin, 0.25);
            wb.getCreationHelper().createFormulaEvaluator().evaluateAll();
            wb.write(out); return out.toByteArray();
        }
    }

    private void set(Row row, int col, String value) { row.getCell(col).setCellValue(value == null ? "" : value); }

    private void quadrillage(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN); style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN); style.setBorderRight(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
    }

    private CellStyle corps(XSSFWorkbook wb, boolean alterne, String format) {
        CellStyle style = wb.createCellStyle(); quadrillage(style);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        if (alterne) fond(style, 247, 250, 252);
        if (format != null) style.setDataFormat(wb.createDataFormat().getFormat(format));
        return style;
    }

    private void fond(CellStyle style, int rouge, int vert, int bleu) {
        ((XSSFCellStyle) style).setFillForegroundColor(new XSSFColor(
                new byte[]{(byte) rouge, (byte) vert, (byte) bleu}, new DefaultIndexedColorMap()));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    }

    private void ligneSynthese(Row row, int colonnes, CellStyle style, String libelle) {
        row.setHeightInPoints(25);
        for (int i = 0; i < colonnes; i++) row.createCell(i).setCellStyle(style);
        row.getCell(8).setCellValue(libelle);
    }

    private void logo(XSSFWorkbook wb, Sheet sheet, String resource) throws IOException {
        try (InputStream in = getClass().getResourceAsStream(resource)) {
            if (in == null) throw new IOException("Logo RRM introuvable");
            int picture = wb.addPicture(in.readAllBytes(), Workbook.PICTURE_TYPE_PNG);
            ClientAnchor anchor = wb.getCreationHelper().createClientAnchor();
            anchor.setCol1(0); anchor.setRow1(0);
            anchor.setCol2(1); anchor.setRow2(2);
            anchor.setDx2(25 * Units.EMU_PER_PIXEL);
            sheet.createDrawingPatriarch().createPicture(anchor, picture);
        }
    }

    public byte[] accuse(Recette r) throws IOException {
        if (r.getStatut() != StatutRecette.RECUE && r.getStatut() != StatutRecette.RECUE_AVEC_RESERVES)
            throw new IllegalStateException("L'accusé n'est disponible qu'après réception");
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(new PDRectangle(600, 848)); doc.addPage(page);
            PDFont normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            String observation = r.getObservationReception() == null ? "" : r.getObservationReception().trim();
            List<String> lignesObservation = retourLigne(observation.replace('\n', ' ').replace('\r', ' '), normal, 9, 276);
            try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
                try (InputStream logo = getClass().getResourceAsStream("/pdf/logo-rrm.png")) {
                    if (logo == null) throw new IOException("Logo RRM introuvable");
                    PDImageXObject image = PDImageXObject.createFromByteArray(doc, logo.readAllBytes(), "logo-rrm");
                    c.drawImage(image, 42, 716, 155, 93);
                }
                texte(c, normal, 11, 390, 757, "Rabat, le " + r.getDateReception().toLocalDate().format(DATE));
                texte(c, bold, 17, 154, 673, "ACCUSÉ DE RÉCEPTION");

                var debut = r.getLignes().stream().map(l -> l.getDatePaiement().toLocalDate()).min(java.time.LocalDate::compareTo).orElseThrow();
                var fin = r.getLignes().stream().map(l -> l.getDatePaiement().toLocalDate()).max(java.time.LocalDate::compareTo).orElseThrow();
                enteteTableau(c, bold, 42, 635, 516, 30, "Informations de l'arrêté");
                ligneTableau(c, normal, bold, 42, 605, 516, 41, "N° d'accusé", r.getAccuseNumero(), "Référence de l'arrêté", r.getReference());
                ligneTableau(c, normal, bold, 42, 564, 516, 41, "Parking", r.getParking().getNom(), "Date d'arrêt", r.getDateArret().format(DATE));
                ligneTableau(c, normal, bold, 42, 523, 516, 41, "Période des paiements", debut.format(DATE) + " au " + fin.format(DATE),
                        "Date de réception", r.getDateReception().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                ligneTableau(c, normal, bold, 42, 482, 516, 41, "Superviseur", r.getSuperviseur().getPrenom() + " " + r.getSuperviseur().getNom(),
                        "Comptable", r.getComptable().getPrenom() + " " + r.getComptable().getNom());

                int cheques = (int) r.getLignes().stream().filter(l -> l.getModePaiement().equals("CHEQUE")).count();
                enteteTableau(c, bold, 42, 413, 516, 30, "Détail de la remise");
                ligneTableau(c, normal, bold, 42, 383, 516, 32, "Paiements", String.valueOf(r.getLignes().size()),
                        "Espèces / chèques", (r.getLignes().size() - cheques) + " / " + cheques);
                ligneTableau(c, normal, bold, 42, 351, 516, 32, "Espèces déclarées", montant(r.getTotalEspeces()) + " DH",
                        "Espèces reçues", montant(r.getMontantEspecesRecu()) + " DH");
                ligneTableau(c, normal, bold, 42, 319, 516, 32, "Chèques déclarés", montant(r.getTotalCheques()) + " DH",
                        "Chèques reçus", montant(r.getMontantChequesRecu()) + " DH");
                ligneTableau(c, normal, bold, 42, 287, 516, 32, "Nombre de chèques déclarés", String.valueOf(cheques),
                        "Nombre de chèques reçus", String.valueOf(r.getNombreChequesRecus()));
                ligneTableau(c, normal, bold, 42, 255, 516, 32, "TOTAL DÉCLARÉ", montant(r.getTotalEspeces().add(r.getTotalCheques())) + " DH",
                        "TOTAL REÇU", montant(r.getMontantEspecesRecu().add(r.getMontantChequesRecu())) + " DH");

                cadre(c, 42, 55, 302, 143);
                cadre(c, 356, 55, 202, 143);
                texte(c, bold, 11, 54, 177, r.getStatut() == StatutRecette.RECUE ? "Réception conforme" : "Réception avec réserves");
                texte(c, bold, 9, 54, 152, "Observation");
                if (lignesObservation.isEmpty()) texte(c, normal, 9, 54, 135, "Aucune observation.");
                else if (lignesObservation.size() > 5) texte(c, normal, 9, 54, 135, "Observation détaillée en annexe.");
                else for (int i = 0; i < lignesObservation.size(); i++)
                    texte(c, normal, 9, 54, 135 - i * 15, lignesObservation.get(i));
                texte(c, bold, 11, 368, 177, "Signature du comptable");
                c.moveTo(372, 96); c.lineTo(540, 96); c.stroke();
                texte(c, normal, 8, 42, 35, "Copie destinée au superviseur - " + r.getAccuseNumero());
            }
            if (lignesObservation.size() > 5) annexeObservation(doc, bold, normal, r.getAccuseNumero(), lignesObservation);
            doc.save(out); return out.toByteArray();
        }
    }

    private void enteteTableau(PDPageContentStream c, PDFont bold, float x, float haut, float largeur, float hauteur, String titre) throws IOException {
        c.setNonStrokingColor(229f / 255f, 241f / 255f, 246f / 255f);
        c.addRect(x, haut - hauteur, largeur, hauteur); c.fill();
        cadre(c, x, haut - hauteur, largeur, hauteur);
        texte(c, bold, 11, x + 11, haut - 20, titre);
    }

    private void ligneTableau(PDPageContentStream c, PDFont normal, PDFont bold, float x, float haut, float largeur,
                              float hauteur, String libelleGauche, String valeurGauche, String libelleDroite, String valeurDroite) throws IOException {
        cadre(c, x, haut - hauteur, largeur / 2, hauteur);
        cadre(c, x + largeur / 2, haut - hauteur, largeur / 2, hauteur);
        texte(c, normal, 8, x + 10, haut - 12, libelleGauche);
        texte(c, bold, 10, x + 10, haut - 27, ajuster(valeurGauche, bold, 10, largeur / 2 - 20));
        texte(c, normal, 8, x + largeur / 2 + 10, haut - 12, libelleDroite);
        texte(c, bold, 10, x + largeur / 2 + 10, haut - 27, ajuster(valeurDroite, bold, 10, largeur / 2 - 20));
    }

    private void cadre(PDPageContentStream c, float x, float y, float largeur, float hauteur) throws IOException {
        c.setStrokingColor(0.58f, 0.66f, 0.70f);
        c.setLineWidth(0.65f);
        c.addRect(x, y, largeur, hauteur); c.stroke();
    }

    private void texte(PDPageContentStream c, PDFont font, float taille, float x, float y, String valeur) throws IOException {
        c.setNonStrokingColor(0.07f, 0.14f, 0.18f);
        c.beginText(); c.setFont(font, taille); c.newLineAtOffset(x, y);
        c.showText(sansCaracteresNonSupportes(valeur)); c.endText();
    }

    private String ajuster(String valeur, PDFont font, float taille, float largeur) throws IOException {
        String source = sansCaracteresNonSupportes(valeur);
        String resultat = source;
        if (font.getStringWidth(resultat) / 1000f * taille <= largeur) return resultat;
        while (!resultat.isEmpty() && font.getStringWidth(resultat + "...") / 1000f * taille > largeur)
            resultat = resultat.substring(0, resultat.length() - 1);
        return resultat.stripTrailing() + "...";
    }

    private List<String> retourLigne(String valeur, PDFont font, float taille, float largeur) throws IOException {
        List<String> resultat = new ArrayList<>();
        StringBuilder ligne = new StringBuilder();
        for (String mot : sansCaracteresNonSupportes(valeur).split("\\s+")) {
            if (mot.isBlank()) continue;
            String essai = ligne.isEmpty() ? mot : ligne + " " + mot;
            if (!ligne.isEmpty() && font.getStringWidth(essai) / 1000f * taille > largeur) {
                resultat.add(ligne.toString()); ligne.setLength(0);
            }
            if (!ligne.isEmpty()) ligne.append(' ');
            ligne.append(mot);
        }
        if (!ligne.isEmpty()) resultat.add(ligne.toString());
        return resultat;
    }

    private void annexeObservation(PDDocument doc, PDFont bold, PDFont normal, String numero, List<String> lignes) throws IOException {
        for (int depart = 0; depart < lignes.size(); depart += 43) {
            PDPage page = new PDPage(new PDRectangle(600, 848)); doc.addPage(page);
            try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
                texte(c, bold, 14, 42, 795, "Observation - Accusé " + numero);
                cadre(c, 42, 44, 516, 727);
                for (int i = depart; i < Math.min(depart + 43, lignes.size()); i++)
                    texte(c, normal, 10, 54, 748 - (i - depart) * 16, lignes.get(i));
            }
        }
    }

    private String sansCaracteresNonSupportes(String valeur) {
        return (valeur == null ? "" : valeur).replace('\n', ' ').replace('\r', ' ')
                .replaceAll("[^\\u0020-\\u00FF]", "?");
    }
    private String montant(BigDecimal n) { return n.setScale(2).toPlainString(); }
}
