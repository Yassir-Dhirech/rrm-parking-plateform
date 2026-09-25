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

    public byte[] generer(Long factureId) {
        FactureResponse facture = facturationService.consulter(factureId);
        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream output = new ByteArrayOutputStream()
        ) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDFont unicodeFont = chargerPoliceUnicode(document);
            try (PDPageContentStream content = new PDPageContentStream(
                    document,
                    page
            )) {
                dessinerEntete(document, content, facture);
                dessinerClient(content, facture);
                dessinerReference(content, facture);
                dessinerTableau(content, facture, unicodeFont);
                dessinerBasDeFacture(content, facture);
                dessinerPiedDePage(content);
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
            FactureResponse facture
    ) throws IOException {
        write(content, BOLD, 11, 78, 795, "ROYAUME DU MAROC");
        write(content, NORMAL, 9, 82, 782, "----------------------------------");
        write(content, BOLD, 11, 68, 760, "RABAT REGION MOBILITE");

        try (InputStream stream = getClass().getResourceAsStream(
                "/pdf/parking-rrm-logo.png"
        )) {
            if (stream != null) {
                PDImageXObject logo = PDImageXObject.createFromByteArray(
                        document,
                        stream.readAllBytes(),
                        "parking-rrm-logo"
                );
                content.drawImage(logo, 415, 740, 120, 72);
            }
        }

        LocalDate date = facture.dateEmission() == null
                ? LocalDate.now()
                : facture.dateEmission().toLocalDate();
        writeRight(content, NORMAL, 12, 545, 720,
                "Rabat, le " + date.format(DATE));
    }

    private void dessinerClient(
            PDPageContentStream content,
            FactureResponse facture
    ) throws IOException {
        writeCentered(content, BOLD_ITALIC, 13, 330, 675,
                safe(facture.clientNom()).toUpperCase(Locale.ROOT));
        writeCentered(content, ITALIC, 11, 330, 657,
                "CIN / ICE : " + safe(facture.clientIdentifiant()));
        writeCentered(content, ITALIC, 10, 330, 640,
                safe(facture.email()));
    }

    private void dessinerReference(
            PDPageContentStream content,
            FactureResponse facture
    ) throws IOException {
        write(content, ITALIC, 13, 70, 605,
                "Parking : " + safe(facture.parkingNom())
                        .toUpperCase(Locale.ROOT));
        write(content, NORMAL, 13, 70, 578,
                "Facture N° " + safe(facture.numero()));
    }

    private void dessinerTableau(
            PDPageContentStream content,
            FactureResponse facture,
            PDFont unicodeFont
    ) throws IOException {
        float x0 = 42;
        float x1 = 410;
        float x2 = 505;
        float x3 = 575;
        float top = 552;
        float headerBottom = 530;
        float bodyBottom = 390;

        rectangle(content, x0, bodyBottom, x3 - x0, top - bodyBottom);
        line(content, x1, bodyBottom, x1, top);
        line(content, x2, bodyBottom, x2, top);
        line(content, x0, headerBottom, x3, headerBottom);
        writeCentered(content, ITALIC, 12, (x0 + x1) / 2, 536,
                "Désignation");
        writeCentered(content, ITALIC, 12, (x1 + x2) / 2, 536, "P.U");
        writeCentered(content, ITALIC, 12, (x2 + x3) / 2, 536, "Montant");

        float y = 510;
        for (FactureLigneResponse ligne : facture.lignes()) {
            float prixY = y;
            for (String description : descriptionLigne(ligne, facture)) {
                PDFont police = contientArabe(description)
                        ? unicodeFont
                        : ITALIC;
                for (String fragment : wrap(description, police, 11, 350)) {
                    write(content, police, 11, x0 + 7, y, fragment);
                    y -= 15;
                }
            }
            writeRight(content, ITALIC, 11, x2 - 8, prixY,
                    money(ligne.prixUnitaireHt()));
            writeRight(content, ITALIC, 11, x3 - 8, prixY,
                    money(ligne.montantHt()));
            y -= 12;
        }

        float row = 23;
        float totalsBottom = bodyBottom - 3 * row;
        rectangle(content, x1, totalsBottom, x3 - x1, 3 * row);
        line(content, x2, totalsBottom, x2, bodyBottom);
        line(content, x1, bodyBottom - row, x3, bodyBottom - row);
        line(content, x1, bodyBottom - 2 * row, x3, bodyBottom - 2 * row);
        writeRight(content, ITALIC, 11, x2 - 6, bodyBottom - 16,
                "Total HT");
        writeRight(content, ITALIC, 11, x3 - 8, bodyBottom - 16,
                money(facture.totalHt()));
        writeRight(content, ITALIC, 11, x2 - 6, bodyBottom - row - 16,
                "TVA 20%");
        writeRight(content, ITALIC, 11, x3 - 8, bodyBottom - row - 16,
                money(facture.totalTva()));
        writeRight(content, ITALIC, 11, x2 - 6, totalsBottom + 7,
                "Montant TTC");
        writeRight(content, ITALIC, 11, x3 - 8, totalsBottom + 7,
                money(facture.totalTtc()));
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
            descriptions.add("Abonnement " + safe(libelle)
                    + (facture.dureeEnMois() == null
                    ? ""
                    : " " + facture.dureeEnMois() + " mois"));
            if (facture.dateDebutAbonnement() != null) {
                descriptions.add("Du "
                        + facture.dateDebutAbonnement().format(DATE));
            }
            if (facture.dateFinAbonnement() != null) {
                descriptions.add("Au "
                        + facture.dateFinAbonnement().format(DATE));
            }
            if (facture.immatriculation() != null) {
                descriptions.add("Matricule : " + facture.immatriculation());
            }
        } else {
            descriptions.add("Carte d'abonnement magnétique");
        }
        return descriptions;
    }

    private void dessinerBasDeFacture(
            PDPageContentStream content,
            FactureResponse facture
    ) throws IOException {
        write(content, ITALIC, 11, 70, 278,
                "Arrêté la présente facture à la somme de :");
        String montantLettres = montantEnLettres(facture.totalTtc())
                + " dirhams toutes taxes comprises";
        float y = 260;
        for (String ligne : wrap(montantLettres, ITALIC, 11, 460)) {
            write(content, ITALIC, 11, 70, y, ligne);
            y -= 14;
        }
        write(content, BOLD_ITALIC, 10, 70, 210,
                "Mode de paiement : "
                        + libellePaiement(facture.modePaiement()));
        writeCentered(content, BOLD, 12, 425, 167, "Nadir YACOUBI");
        writeCentered(content, BOLD, 10, 425, 151,
                "Directeur du Développement Stratégique");
        writeCentered(content, BOLD, 10, 425, 136,
                "Et des Nouvelles Solutions de Mobilité");
    }

    private void dessinerPiedDePage(PDPageContentStream content)
            throws IOException {
        content.setStrokingColor(0F, 140F / 255F, 75F / 255F);
        line(content, 70, 72, 525, 72);
        content.setStrokingColor(0F, 0F, 0F);
        writeCentered(content, NORMAL, 8, 297.5F, 55,
                "1, Rue Ghafsa Place El Joulane immeuble Houda 2ème étage - "
                        + "Tél : 05 37 21 60 00  Fax : 05 37 73 35 87");
        writeCentered(content, NORMAL, 9, 297.5F, 39,
                "I.F : 3384576  T.P : 25199098  R.C : 75799 RABAT  "
                        + "I.C.E : 000096480000072");
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
                .replace('’', '\'')
                .replace('–', '-')
                .replace('—', '-')
                .replace("œ", "oe")
                .replace("Œ", "OE");
    }
}
