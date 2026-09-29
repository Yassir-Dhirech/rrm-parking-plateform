package com.rrm.parking.avis.service;

import com.rrm.parking.avis.dto.AvisResponse;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service @RequiredArgsConstructor
public class RapportAvisPdfService {
    private final AvisFeedbackService service;
    private static final float MARGE = 48;
    private static final float LARGEUR = 595 - MARGE * 2;

    public byte[] generer() {
        var stats = service.statistiques();
        var avis = service.tous();
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream sortie = new ByteArrayOutputStream();
             InputStream policeFlux = getClass().getResourceAsStream("/pdf/DejaVuSans.ttf");
             InputStream logoFlux = getClass().getResourceAsStream("/pdf/logo-rrm.png")) {
            if (policeFlux == null || logoFlux == null) {
                throw new IllegalStateException("Police ou logo RRM introuvable");
            }
            PDType0Font police = PDType0Font.load(document, policeFlux);
            PDImageXObject logo = PDImageXObject.createFromByteArray(document,
                    logoFlux.readAllBytes(), "logo-rrm");
            try (MiseEnPage page = new MiseEnPage(document, police, logo)) {
                page.ligne("RAPPORT DES AVIS ET FEEDBACKS", 16, true);
                page.ligne("Rabat Région Mobilité  |  Édité le " + LocalDate.now(), 9, false);
                page.espace(14);
                page.ligne("SYNTHÈSE", 12, true);
                page.ligne("Nombre total d'avis : " + stats.total(), 10, false);
                page.ligne(String.format(Locale.FRANCE, "Note moyenne : %.2f / 5", stats.moyenne()), 10, false);
                page.ligne("Avis avec 5 étoiles : " + stats.cinqEtoiles(), 10, false);
                page.espace(6);
                for (AvisResponse.Repartition ligne : stats.repartition()) {
                    page.ligne(String.format(Locale.FRANCE, "%d étoile(s) : %d avis (%.1f %%)",
                            ligne.note(), ligne.nombre(), ligne.pourcentage()), 9, false);
                }
                page.espace(18);
                page.ligne("DÉTAIL DES AVIS", 12, true);
                if (avis.isEmpty()) page.ligne("Aucun avis enregistré à ce jour.", 10, false);
                for (AvisResponse.Detail a : avis) {
                    page.espace(10);
                    page.ligne("#" + a.id() + "  |  " + a.noteSatisfaction() + "/5  |  "
                            + a.typeAvis() + "  |  " + a.dateCreation().format(
                                    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), 10, true);
                    page.ligne("Parking : " + (a.parkingNom() == null ? "Non précisé" : a.parkingNom()), 9, false);
                    page.ligne("Nom : " + (a.nomContact() == null ? "Non renseigné" : a.nomContact()), 9, false);
                    page.ligne("Contact : " + (a.contactInfo() == null ? "Non renseigné" : a.contactInfo()), 9, false);
                    page.ligne("Message : " + a.message(), 9, false);
                }
            }
            document.save(sortie);
            return sortie.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de produire le rapport des avis", e);
        }
    }

    private static class MiseEnPage implements AutoCloseable {
        private final PDDocument document;
        private final PDType0Font police;
        private final PDImageXObject logo;
        private PDPageContentStream contenu;
        private float y;

        MiseEnPage(PDDocument document, PDType0Font police, PDImageXObject logo) throws IOException {
            this.document = document;
            this.police = police;
            this.logo = logo;
            nouvellePage();
        }

        void nouvellePage() throws IOException {
            if (contenu != null) contenu.close();
            PDPage page = new PDPage();
            document.addPage(page);
            contenu = new PDPageContentStream(document, page);
            float ratio = Math.min(120f / logo.getWidth(), 54f / logo.getHeight());
            contenu.drawImage(logo, MARGE, 772, logo.getWidth() * ratio, logo.getHeight() * ratio);
            contenu.setStrokingColor(0f, 58f / 255f, 110f / 255f);
            contenu.moveTo(MARGE, 760);
            contenu.lineTo(595 - MARGE, 760);
            contenu.stroke();
            y = 737;
        }

        void espace(float valeur) throws IOException {
            y -= valeur;
            if (y < 60) nouvellePage();
        }

        void ligne(String texte, int taille, boolean titre) throws IOException {
            List<String> lignes = couper(caracteresPrisEnCharge(
                    texte == null ? "" : texte.replaceAll("[\\r\\n\\t]+", " ")), taille);
            for (String portion : lignes) {
                if (y < 65) nouvellePage();
                if (titre) contenu.setNonStrokingColor(0f, 58f / 255f, 110f / 255f);
                else contenu.setNonStrokingColor(30f / 255f, 41f / 255f, 59f / 255f);
                contenu.beginText();
                contenu.setFont(police, taille);
                contenu.newLineAtOffset(MARGE, y);
                contenu.showText(portion);
                contenu.endText();
                y -= taille + 7;
            }
        }

        private List<String> couper(String texte, int taille) throws IOException {
            List<String> lignes = new ArrayList<>();
            StringBuilder ligne = new StringBuilder();
            for (String mot : texte.split(" ")) {
                String tentative = ligne.isEmpty() ? mot : ligne + " " + mot;
                if (police.getStringWidth(tentative) * taille / 1000 <= LARGEUR) {
                    ligne.setLength(0);
                    ligne.append(tentative);
                } else {
                    if (!ligne.isEmpty()) lignes.add(ligne.toString());
                    ligne.setLength(0);
                    // Coupe aussi les mots très longs (p. ex. URL collée dans le commentaire).
                    for (int i = 0; i < mot.length(); i++) {
                        String suivant = ligne.toString() + mot.charAt(i);
                        if (police.getStringWidth(suivant) * taille / 1000 > LARGEUR && !ligne.isEmpty()) {
                            lignes.add(ligne.toString());
                            ligne.setLength(0);
                        }
                        ligne.append(mot.charAt(i));
                    }
                }
            }
            if (!ligne.isEmpty()) lignes.add(ligne.toString());
            if (lignes.isEmpty()) lignes.add(" ");
            return lignes;
        }

        private String caracteresPrisEnCharge(String texte) throws IOException {
            StringBuilder resultat = new StringBuilder();
            for (int point : texte.codePoints().toArray()) {
                String caractere = new String(Character.toChars(point));
                try {
                    police.getStringWidth(caractere);
                    resultat.append(caractere);
                } catch (IllegalArgumentException exception) {
                    resultat.append('?');
                }
            }
            return resultat.toString();
        }

        @Override public void close() throws IOException { if (contenu != null) contenu.close(); }
    }
}
