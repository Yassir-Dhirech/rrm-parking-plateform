package com.rrm.parking.contrat.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.dto.response.DemandeCorporateDetailResponse;
import com.rrm.parking.demande.service.DemandeCorporateResponsableService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContratCorporatePdfService {

    private static final String MODELE = "/pdf/contrat-corporate-template.pdf";
    private static final String POLICE = "/pdf/DejaVuSans.ttf";

    private final DemandeCorporateResponsableService responsableService;

    public byte[] generer(Long demandeId) {
        DemandeCorporateDetailResponse demande = responsableService.consulter(demandeId);
        if (demande.contratId() == null) {
            throw new ConflitMetierException("Le contrat n'a pas encore été généré");
        }
        if (demande.cinRepresentant() == null
                || demande.cinRepresentant().isBlank()
                || demande.plageHoraire() == null
                || demande.plageHoraire().isBlank()) {
            throw new ConflitMetierException(
                    "Le CIN du représentant et la plage horaire doivent être renseignés"
            );
        }

        try (InputStream modele = ressource(MODELE);
             PDDocument document = Loader.loadPDF(modele.readAllBytes());
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            if (document.getNumberOfPages() != 12) {
                throw new IOException("Le modèle du contrat corporate doit contenir 12 pages");
            }

            PDFont police = chargerPolice(document);
            remplirPageUne(document, police, demande);
            remplirPageDeux(document, police, demande);
            remplirPageTrois(document, police, demande);
            remplirPageDouze(document, police, demande);

            document.save(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Impossible de générer le contrat corporate PDF",
                    exception
            );
        }
    }

    private void remplirPageUne(
            PDDocument document,
            PDFont police,
            DemandeCorporateDetailResponse demande
    ) throws IOException {
        PDPage page = document.getPage(0);
        try (PDPageContentStream contenu = flux(document, page)) {
            masquer(contenu, page, 241, 423, 282, 101);
            float top = 431;
            top = paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "NOM de La Société ou Personne physique « "
                            + demande.raisonSociale() + " »");
            top = paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "AU (ci-après désignée l'\"Abonné\" ou le \"Client\")");
            top = paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "Représenté par M. " + nomRepresentant(demande));
            top = paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "Projet : " + demande.libelleProjet());
            top = paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "Adresse du projet : " + demande.adresseProjet());
            paragraphe(contenu, page, police, 8.2f, 10.2f, 243, top, 271,
                    "Titre foncier Numéro : " + demande.titreFoncier());

            masquer(contenu, page, 241, 711, 282, 20);
            texte(contenu, page, police, 8.2f, 243, 721,
                    demande.nombrePlaces() + " places de stationnement");
        }
    }

    private void remplirPageDeux(
            PDDocument document,
            PDFont police,
            DemandeCorporateDetailResponse demande
    ) throws IOException {
        PDPage page = document.getPage(1);
        try (PDPageContentStream contenu = flux(document, page)) {
            masquer(contenu, page, 241, 76, 282, 50);
            float top = 84;
            top = paragraphe(contenu, page, police, 8.2f, 10.5f, 243, top, 271,
                    montant(demande.prixMensuelUnitaireTtc())
                            + " TTC/ par mois et par place");
            paragraphe(contenu, page, police, 8.2f, 10.5f, 243, top, 271,
                    demande.nombrePlaces() + " places au parking "
                            + demande.parkingNom() + " (" + demande.plageHoraire() + ")");

            masquer(contenu, page, 240, 250, 283, 53);
            paragraphe(contenu, page, police, 8.2f, 11f, 243, 260, 271,
                    "Le règlement du montant total de l'abonnement sur 20 ans soit "
                            + montant(demande.montantTotalTtc())
                            + " TTC (le \"Montant Total\"), sera effectué par chèque au nom "
                            + "de l'exploitant à la date d'effet du contrat entre les parties.");

            masquer(contenu, page, 239, 425, 284, 102);
            paragraphe(contenu, page, police, 8.2f, 11f, 242, 435, 272,
                    "Aux termes du présent Contrat, les places de stationnement affectées "
                            + "à l'Abonné sont situées au sein du Parking " + demande.parkingNom()
                            + ". Dans le cas où Rabat Région Mobilité réalise un parking plus "
                            + "proche de l'adresse du projet, elle s'engage, à la demande expresse "
                            + "du Client, à réserver en priorité à l'Abonné des places de "
                            + "stationnement au sein dudit parking, en lieu et place du Parking "
                            + demande.parkingNom() + ".");
        }
    }

    private void remplirPageTrois(
            PDDocument document,
            PDFont police,
            DemandeCorporateDetailResponse demande
    ) throws IOException {
        PDPage page = document.getPage(2);
        try (PDPageContentStream contenu = flux(document, page)) {
            masquer(contenu, page, 70, 128, 455, 69);
            paragraphe(contenu, page, police, 8.6f, 12f, 71, 138, 452,
                    "Les présentes Conditions Générales d'abonnement régissent les services "
                            + "proposés par la société Rabat Région Mobilité, société anonyme, au "
                            + "capital social de 1 376 430 000 Dirhams, dont le siège social est à "
                            + "Rabat, rue Ghafsa Place El Joulane Hassan, immatriculée au registre "
                            + "du commerce de Rabat sous le n°75799, pour le stationnement au sein "
                            + "du parking " + demande.parkingNom() + ", sis à Rabat, en sa qualité "
                            + "d'exploitant désigné pour la gestion dudit Parking.");
        }
    }

    private void remplirPageDouze(
            PDDocument document,
            PDFont police,
            DemandeCorporateDetailResponse demande
    ) throws IOException {
        PDPage page = document.getPage(11);
        try (PDPageContentStream contenu = flux(document, page)) {
            masquer(contenu, page, 165, 557, 126, 33, new Color(217, 217, 217));
            texte(contenu, page, police, 8.2f, 166, 568, nomRepresentant(demande));
            texte(contenu, page, police, 8.2f, 166, 582, demande.cinRepresentant());
        }
    }

    private PDPageContentStream flux(PDDocument document, PDPage page) throws IOException {
        return new PDPageContentStream(
                document,
                page,
                PDPageContentStream.AppendMode.APPEND,
                true,
                true
        );
    }

    private InputStream ressource(String chemin) throws IOException {
        InputStream stream = getClass().getResourceAsStream(chemin);
        if (stream == null) {
            throw new IOException("Ressource PDF introuvable : " + chemin);
        }
        return stream;
    }

    private PDFont chargerPolice(PDDocument document) throws IOException {
        try (InputStream stream = ressource(POLICE)) {
            return PDType0Font.load(document, stream);
        }
    }

    private void masquer(
            PDPageContentStream contenu,
            PDPage page,
            float x,
            float top,
            float largeur,
            float hauteur
    ) throws IOException {
        masquer(contenu, page, x, top, largeur, hauteur, Color.WHITE);
    }

    private void masquer(
            PDPageContentStream contenu,
            PDPage page,
            float x,
            float top,
            float largeur,
            float hauteur,
            Color couleur
    ) throws IOException {
        contenu.setNonStrokingColor(couleur);
        contenu.addRect(x, y(page, top + hauteur), largeur, hauteur);
        contenu.fill();
        contenu.setNonStrokingColor(Color.BLACK);
    }

    private float paragraphe(
            PDPageContentStream contenu,
            PDPage page,
            PDFont police,
            float taille,
            float interligne,
            float x,
            float top,
            float largeur,
            String valeur
    ) throws IOException {
        for (String ligne : lignes(police, taille, largeur, valeur)) {
            texte(contenu, page, police, taille, x, top, ligne);
            top += interligne;
        }
        return top;
    }

    private List<String> lignes(
            PDFont police,
            float taille,
            float largeur,
            String valeur
    ) throws IOException {
        String texte = valeur == null ? "" : valeur.trim().replaceAll("\\s+", " ");
        List<String> resultat = new ArrayList<>();
        StringBuilder ligne = new StringBuilder();
        for (String mot : texte.split(" ")) {
            String candidat = ligne.isEmpty() ? mot : ligne + " " + mot;
            float largeurCandidat = police.getStringWidth(candidat) / 1000f * taille;
            if (!ligne.isEmpty() && largeurCandidat > largeur) {
                resultat.add(ligne.toString());
                ligne.setLength(0);
                ligne.append(mot);
            } else {
                if (!ligne.isEmpty()) {
                    ligne.append(' ');
                }
                ligne.append(mot);
            }
        }
        if (!ligne.isEmpty()) {
            resultat.add(ligne.toString());
        }
        return resultat;
    }

    private void texte(
            PDPageContentStream contenu,
            PDPage page,
            PDFont police,
            float taille,
            float x,
            float top,
            String valeur
    ) throws IOException {
        contenu.beginText();
        contenu.setFont(police, taille);
        contenu.newLineAtOffset(x, y(page, top));
        contenu.showText(valeur == null ? "" : valeur);
        contenu.endText();
    }

    private float y(PDPage page, float top) {
        return page.getMediaBox().getHeight() - top;
    }

    private String nomRepresentant(DemandeCorporateDetailResponse demande) {
        return (demande.prenomRepresentant() + " " + demande.nomRepresentant()).trim();
    }

    private String montant(BigDecimal valeur) {
        NumberFormat format = NumberFormat.getNumberInstance(Locale.FRANCE);
        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);
        return format.format(valeur.setScale(2, RoundingMode.HALF_UP))
                .replace('\u202f', ' ')
                .replace('\u00a0', ' ')
                + " Dhs";
    }
}
