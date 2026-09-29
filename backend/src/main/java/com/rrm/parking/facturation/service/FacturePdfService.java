package com.rrm.parking.facturation.service;

import com.rrm.parking.facturation.dto.response.FactureLigneResponse;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class FacturePdfService {

    private static final PDFont NORMAL = new PDType1Font(
            Standard14Fonts.FontName.TIMES_ROMAN
    );
    private static final PDFont BOLD = new PDType1Font(
            Standard14Fonts.FontName.TIMES_BOLD
    );
    private static final PDFont ITALIC = new PDType1Font(
            Standard14Fonts.FontName.TIMES_ITALIC
    );
    private static final PDFont BOLD_ITALIC = new PDType1Font(
            Standard14Fonts.FontName.TIMES_BOLD_ITALIC
    );
    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final FacturationService facturationService;

    // Les polices du modèle Word ne sont pas redistribuées dans le dépôt.
    // En Docker, placer les fichiers sous /app/secrets/invoice-fonts.
    private record InvoiceFonts(PDFont bookman, PDFont bookmanItalic,
                                PDFont bookmanBoldItalic, PDFont garamond,
                                PDFont garamondBold, PDFont century,
                                PDFont timesBold, PDFont helvetica,
                                PDFont arialBold, PDFont arabic) { }

    public byte[] generer(Long factureId) {
        FactureResponse facture = facturationService.consulter(factureId);
        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream output = new ByteArrayOutputStream()
        ) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            InvoiceFonts fonts = chargerPolices(document);
            try (PDPageContentStream content = new PDPageContentStream(
                    document,
                    page
            )) {
                dessinerEntete(document, content, facture, fonts);
                dessinerClient(content, facture, fonts);
                dessinerReference(content, facture, fonts);
                dessinerTableau(content, facture, fonts);
                dessinerBasDeFacture(content, facture, fonts);
                dessinerPiedDePage(content, fonts);
            }
            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Impossible de générer la facture PDF",
                    exception
            );
        }
    }

    private void dessinerEntete(
            PDDocument document,
            PDPageContentStream content,
            FactureResponse facture,
            InvoiceFonts fonts
    ) throws IOException {
        content.setNonStrokingColor(150F / 255F, 150F / 255F, 150F / 255F);
        write(content, fonts.garamondBold, 9, 80, 795, "ROYAUME DU MAROC");
        write(content, fonts.garamondBold, 9, 78, 785, "----------------------------------");
        write(content, fonts.garamondBold, 9, 70, 765, "RABAT REGION MOBILITE");
        content.setNonStrokingColor(0, 0, 0);

        try (InputStream stream = getClass().getResourceAsStream(
                "/pdf/parking-rrm-logo.png"
        )) {
            if (stream != null) {
                PDImageXObject logo = PDImageXObject.createFromByteArray(
                        document,
                        stream.readAllBytes(),
                        "parking-rrm-logo"
                );
                content.drawImage(logo, 415, 749, 110, 57);
            }
        }

        LocalDate date = facture.dateEmission() == null
                ? LocalDate.now()
                : facture.dateEmission().toLocalDate();
        writeRight(content, fonts.century, 11.04F, 528, 724,
                "Rabat, le " + date.format(DATE));
    }

    private void dessinerClient(
            PDPageContentStream content,
            FactureResponse facture,
            InvoiceFonts fonts
    ) throws IOException {
        float y = 696;
        for (String ligne : wrap(safe(facture.clientNom()).toUpperCase(Locale.ROOT),
                fonts.bookmanBoldItalic, 12, 285)) {
            writeCentered(content, fonts.bookmanBoldItalic, 12, 388, y, ligne);
            y -= 14;
        }
        if (facture.clientAdresse() != null && !facture.clientAdresse().isBlank()) {
            y = Math.min(y, 668);
            for (String ligne : wrap(facture.clientAdresse().toUpperCase(Locale.ROOT),
                    fonts.bookmanItalic, 12, 285)) {
                writeCentered(content, fonts.bookmanItalic, 12, 388, y, ligne);
                y -= 14;
            }
        }
        String identifiant = facture.clientIdentifiant();
        if (identifiant != null && !identifiant.isBlank()) {
            writeRight(content, fonts.bookmanItalic, 12, 497,
                    Math.min(y - 1, 654),
                    (identifiant.length() == 15 ? "ICE :" : "CIN :")
                            + identifiant);
        }
    }

    private void dessinerReference(
            PDPageContentStream content,
            FactureResponse facture,
            InvoiceFonts fonts
    ) throws IOException {
        write(content, fonts.bookmanItalic, 12, 71, 611,
                "Parking: " + safe(facture.parkingNom())
                        .toUpperCase(Locale.ROOT));
        write(content, fonts.bookman, 12, 71, 583,
                "Facture N° " + safe(facture.numero()));
    }

    private void dessinerTableau(
            PDPageContentStream content,
            FactureResponse facture,
            InvoiceFonts fonts
    ) throws IOException {
        float x0 = 42.5F;
        float x1 = 375.7F;
        float x2 = 460.8F;
        float x3 = 538.7F;
        float top = 567.6F;
        float headerBottom = 546.9F;
        float bodyBottom = 433.6F;

        content.setLineWidth(0.5F);
        rectangle(content, x0, bodyBottom, x3 - x0, top - bodyBottom);
        line(content, x1, bodyBottom, x1, top);
        line(content, x2, bodyBottom, x2, top);
        line(content, x0, headerBottom, x3, headerBottom);
        writeCentered(content, fonts.bookmanItalic, 12, (x0 + x1) / 2, 555,
                "Désignation");
        writeCentered(content, fonts.bookmanItalic, 12, (x1 + x2) / 2, 555, "P.U");
        writeCentered(content, fonts.bookmanItalic, 12, (x2 + x3) / 2, 555, "Montant");

        float y = 534;
        for (FactureLigneResponse ligne : facture.lignes()) {
            if (!ligne.typeLigne().name().equals("ABONNEMENT")) {
                y = 450;
            }
            float prixY = y;
            for (String description : descriptionLigne(ligne, facture)) {
                if (description.isBlank()) {
                    y -= 14.1F;
                    continue;
                }
                PDFont police = contientArabe(description)
                        ? fonts.arabic
                        : fonts.bookmanItalic;
                for (String fragment : wrap(description, police, 12, x1 - x0 - 12)) {
                    if (y < bodyBottom + 9) {
                        break;
                    }
                    write(content, police, 12, x0 + 5.5F, y, fragment);
                    y -= 14.1F;
                }
            }
            writeRight(content, fonts.bookmanItalic, 12, x2 - 5, prixY,
                    money(ligne.prixUnitaireHt()));
            writeRight(content, fonts.bookmanItalic, 12, x3 - 5, prixY,
                    money(ligne.montantHt()));
            y -= 14;
        }

        float row = 21.1F;
        float totalsBottom = bodyBottom - 3 * row;
        rectangle(content, x1, totalsBottom, x3 - x1, 3 * row);
        line(content, x2, totalsBottom, x2, bodyBottom);
        line(content, x1, bodyBottom - row, x3, bodyBottom - row);
        line(content, x1, bodyBottom - 2 * row, x3, bodyBottom - 2 * row);
        writeRight(content, fonts.bookmanItalic, 12, x2 - 5, bodyBottom - 13,
                "Total HT");
        writeRight(content, fonts.bookmanItalic, 12, x3 - 5, bodyBottom - 13,
                money(facture.totalHt()));
        writeRight(content, fonts.bookmanItalic, 12, x2 - 5, bodyBottom - row - 13,
                "TVA 20%");
        writeRight(content, fonts.bookmanItalic, 12, x3 - 5, bodyBottom - row - 13,
                money(facture.totalTva()));
        writeRight(content, fonts.bookmanItalic, 12, x2 - 5, totalsBottom + 8,
                "Montant TTC");
        writeRight(content, fonts.bookmanItalic, 12, x3 - 5, totalsBottom + 8,
                money(facture.totalTtc()));
    }

    private InvoiceFonts chargerPolices(PDDocument document) throws IOException {
        PDFont arabe = chargerPoliceUnicode(document);
        return new InvoiceFonts(
                chargerPolice(document, "BOOKOS.TTF", NORMAL),
                chargerPolice(document, "BOOKOSI.TTF", ITALIC),
                chargerPolice(document, "BOOKOSBI.TTF", BOLD_ITALIC),
                chargerPolice(document, "GARA.TTF", NORMAL),
                chargerPolice(document, "GARABD.TTF", BOLD),
                chargerPolice(document, "CENTURY.TTF", NORMAL),
                chargerPolice(document, "timesbd.ttf", BOLD),
                new PDType1Font(Standard14Fonts.FontName.HELVETICA),
                chargerPolice(document, "arialbd.ttf", BOLD),
                arabe
        );
    }

    private PDFont chargerPolice(PDDocument document, String fichier,
                                PDFont repli) throws IOException {
        String repertoire = System.getenv("RRM_INVOICE_FONT_DIR");
        List<Path> repertoires = new ArrayList<>();
        if (repertoire != null && !repertoire.isBlank()) {
            repertoires.add(Path.of(repertoire));
        }
        repertoires.add(Path.of("/app/secrets/invoice-fonts"));
        repertoires.add(Path.of("C:/Windows/Fonts"));
        for (Path dossier : repertoires) {
            Path chemin = dossier.resolve(fichier);
            if (Files.isRegularFile(chemin)) {
                try (InputStream stream = Files.newInputStream(chemin)) {
                    return PDType0Font.load(document, stream, true);
                }
            }
        }
        return repli;
    }

    private PDFont chargerPoliceUnicode(PDDocument document)
            throws IOException {
        try (InputStream stream = getClass().getResourceAsStream(
                "/pdf/DejaVuSans.ttf"
        )) {
            if (stream == null) {
                throw new IOException(
                        "La police Unicode de facturation est introuvable"
                );
            }
            return PDType0Font.load(document, stream, true);
        }
    }

    private boolean contientArabe(String valeur) {
        if (valeur == null) {
            return false;
        }
        return valeur.codePoints().anyMatch(codePoint ->
                (codePoint >= 0x0600 && codePoint <= 0x06FF)
                        || (codePoint >= 0x0750 && codePoint <= 0x077F)
                        || (codePoint >= 0x08A0 && codePoint <= 0x08FF)
        );
    }

    private List<String> descriptionLigne(
            FactureLigneResponse ligne,
            FactureResponse facture
    ) {
        List<String> descriptions = new ArrayList<>();
        if (ligne.typeLigne().name().equals("ABONNEMENT")) {
            String libelle = facture.forfaitLibelle() == null
                    ? ligne.description()
                    : facture.forfaitLibelle();
            descriptions.add("Abonnement " + safe(libelle));
            if (facture.dateDebutAbonnement() != null) {
                descriptions.add("Du "
                        + facture.dateDebutAbonnement().format(DATE));
            }
            if (facture.dateFinAbonnement() != null) {
                descriptions.add("Au "
                        + facture.dateFinAbonnement().format(DATE));
            }
            if (facture.immatriculation() != null) {
                descriptions.add("");
                descriptions.add("Matricule : " + facture.immatriculation());
            } else {
                descriptions.add("");
                descriptions.add("Matricule :");
            }
        } else {
            descriptions.add("Carte d’abonnement magnétique");
        }
        return descriptions;
    }

    private void dessinerBasDeFacture(
            PDPageContentStream content,
            FactureResponse facture,
            InvoiceFonts fonts
    ) throws IOException {
        write(content, fonts.bookmanItalic, 12, 71, 329,
                "Arrêté la présente facture à la somme de :");
        String montantLettres = montantEnLettres(facture.totalTtc())
                .toUpperCase(Locale.ROOT)
                + " DIRHAMS toutes taxes comprises";
        float y = 315;
        for (String ligne : wrap(montantLettres,
                fonts.bookmanItalic, 12, 460)) {
            write(content, fonts.bookmanItalic, 12, 71, y, ligne);
            y -= 14;
        }
        String paiement = "Mode de paiement : "
                + libellePaiement(facture.modePaiement());
        if ("CHEQUE".equals(facture.modePaiement())
                && facture.numeroCheque() != null
                && !facture.numeroCheque().isBlank()) {
            paiement += " N°: " + facture.numeroCheque();
        }
        write(content, fonts.bookmanBoldItalic, 9, 71, 277, paiement);
        writeCentered(content, fonts.timesBold, 15.96F, 405, 209,
                "Ismail Behnane");
        writeCentered(content, fonts.timesBold, 14.04F, 405, 192,
                "Responsable Business Unit");
        writeCentered(content, fonts.timesBold, 14.04F, 405, 176,
                "Stationnement");
    }

    private void dessinerPiedDePage(PDPageContentStream content,
                                  InvoiceFonts fonts)
            throws IOException {
        content.setStrokingColor(0F, 158F / 255F, 80F / 255F);
        content.setLineWidth(1F);
        line(content, 71, 68.2F, 521, 68.2F);
        content.setStrokingColor(0F, 0F, 0F);
        write(content, fonts.helvetica, 9, 94.7F, 51,
                "1, Rue Ghafsa Place El joulane immeuble Houda 2");
        write(content, fonts.helvetica, 6, 298, 53.5F, "ème");
        write(content, fonts.helvetica, 9, 312.2F, 51,
                "étage .  Tél : 05 37 21 60 00   Fax : 05 37 73 35 87");
        String identifiants = "I.F : 3384576  T.P : 25199098  "
                + "R.C : 75799 RABAT  I.C.E : ";
        float debut = 113;
        write(content, fonts.garamond, 12, debut, 38.3F, identifiants);
        write(content, fonts.arialBold, 9.96F,
                debut + textWidth(fonts.garamond, 12, identifiants), 38.3F,
                "000096480000072");
    }

    private String libellePaiement(String mode) {
        if (mode == null) {
            return "-";
        }
        return switch (mode) {
            case "ESPECE" -> "Espèce";
            case "CHEQUE" -> "Chèque";
            default -> mode;
        };
    }

    private void rectangle(
            PDPageContentStream content,
            float x,
            float y,
            float largeur,
            float hauteur
    ) throws IOException {
        content.addRect(x, y, largeur, hauteur);
        content.stroke();
    }

    private void line(
            PDPageContentStream content,
            float x1,
            float y1,
            float x2,
            float y2
    ) throws IOException {
        content.moveTo(x1, y1);
        content.lineTo(x2, y2);
        content.stroke();
    }

    private void write(
            PDPageContentStream content,
            PDFont font,
            float size,
            float x,
            float y,
            String value
    ) throws IOException {
        content.beginText();
        content.setFont(font, size);
        content.newLineAtOffset(x, y);
        content.showText(safe(value));
        content.endText();
    }

    private void writeRight(
            PDPageContentStream content,
            PDFont font,
            float size,
            float right,
            float y,
            String value
    ) throws IOException {
        String texte = safe(value);
        write(content, font, size,
                right - textWidth(font, size, texte), y, texte);
    }

    private void writeCentered(
            PDPageContentStream content,
            PDFont font,
            float size,
            float center,
            float y,
            String value
    ) throws IOException {
        String texte = safe(value);
        write(content, font, size,
                center - textWidth(font, size, texte) / 2, y, texte);
    }

    private float textWidth(PDFont font, float size, String value)
            throws IOException {
        return font.getStringWidth(safe(value)) / 1000F * size;
    }

    private List<String> wrap(
            String value,
            PDFont font,
            float size,
            float maxWidth
    ) throws IOException {
        List<String> lignes = new ArrayList<>();
        StringBuilder ligne = new StringBuilder();
        for (String mot : safe(value).split("\\s+")) {
            String candidat = ligne.isEmpty() ? mot : ligne + " " + mot;
            if (!ligne.isEmpty()
                    && textWidth(font, size, candidat) > maxWidth) {
                lignes.add(ligne.toString());
                ligne = new StringBuilder(mot);
            } else {
                ligne = new StringBuilder(candidat);
            }
        }
        if (!ligne.isEmpty()) {
            lignes.add(ligne.toString());
        }
        return lignes;
    }

    private String money(BigDecimal value) {
        DecimalFormatSymbols symbols = DecimalFormatSymbols.getInstance(
                Locale.FRANCE
        );
        symbols.setGroupingSeparator(' ');
        symbols.setDecimalSeparator(',');
        return new DecimalFormat("#,##0.00", symbols).format(
                value == null ? BigDecimal.ZERO : value
        );
    }

    private String montantEnLettres(BigDecimal montant) {
        BigDecimal valeur = montant == null ? BigDecimal.ZERO : montant;
        long dirhams = valeur.setScale(0, RoundingMode.DOWN).longValue();
        int centimes = valeur.remainder(BigDecimal.ONE)
                .movePointRight(2)
                .abs()
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
        String resultat = nombreEnLettres(dirhams);
        if (centimes > 0) {
            resultat += " et " + nombreEnLettres(centimes) + " centimes";
        }
        return resultat;
    }

    private String nombreEnLettres(long nombre) {
        if (nombre == 0) {
            return "zéro";
        }
        if (nombre < 0) {
            return "moins " + nombreEnLettres(-nombre);
        }
        if (nombre >= 1_000_000_000L) {
            return groupe(nombre, 1_000_000_000L, "milliard", "milliards");
        }
        if (nombre >= 1_000_000L) {
            return groupe(nombre, 1_000_000L, "million", "millions");
        }
        if (nombre >= 1_000L) {
            long quantite = nombre / 1_000L;
            String prefixe = quantite == 1
                    ? "mille"
                    : nombreEnLettres(quantite) + " mille";
            long reste = nombre % 1_000L;
            return reste == 0 ? prefixe : prefixe + " " + nombreEnLettres(reste);
        }
        if (nombre >= 100L) {
            long quantite = nombre / 100L;
            long reste = nombre % 100L;
            String prefixe = quantite == 1
                    ? "cent"
                    : nombreEnLettres(quantite) + " cent";
            if (reste == 0 && quantite > 1) {
                prefixe += "s";
            }
            return reste == 0 ? prefixe : prefixe + " " + nombreEnLettres(reste);
        }
        return moinsDeCent((int) nombre);
    }

    private String groupe(
            long nombre,
            long diviseur,
            String singulier,
            String pluriel
    ) {
        long quantite = nombre / diviseur;
        long reste = nombre % diviseur;
        String prefixe = nombreEnLettres(quantite) + " "
                + (quantite == 1 ? singulier : pluriel);
        return reste == 0 ? prefixe : prefixe + " " + nombreEnLettres(reste);
    }

    private String moinsDeCent(int nombre) {
        String[] unites = {
                "", "un", "deux", "trois", "quatre", "cinq", "six",
                "sept", "huit", "neuf", "dix", "onze", "douze",
                "treize", "quatorze", "quinze", "seize"
        };
        if (nombre <= 16) {
            return unites[nombre];
        }
        if (nombre < 20) {
            return "dix-" + unites[nombre - 10];
        }
        if (nombre < 70) {
            String[] dizaines = {
                    "", "", "vingt", "trente", "quarante", "cinquante", "soixante"
            };
            int dizaine = nombre / 10;
            int unite = nombre % 10;
            if (unite == 0) {
                return dizaines[dizaine];
            }
            return dizaines[dizaine]
                    + (unite == 1 ? " et un" : "-" + unites[unite]);
        }
        if (nombre < 80) {
            return nombre == 71
                    ? "soixante et onze"
                    : "soixante-" + moinsDeCent(nombre - 60);
        }
        if (nombre == 80) {
            return "quatre-vingts";
        }
        return "quatre-vingt-" + moinsDeCent(nombre - 80);
    }

    private String safe(String value) {
        if (value == null || value.isBlank()) {
            return "-";
        }
        return value
                .replace('\u202F', ' ')
                .replace('\u00A0', ' ')
                .replace('–', '-')
                .replace('—', '-')
                .replace("œ", "oe")
                .replace("Œ", "OE");
    }
}
