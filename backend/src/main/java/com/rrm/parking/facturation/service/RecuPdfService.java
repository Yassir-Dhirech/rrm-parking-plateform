package com.rrm.parking.facturation.service;

import com.rrm.parking.facturation.dto.response.RecuConsultationResponse;
import com.rrm.parking.paiement.enums.ModePaiement;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RecuPdfService {

    private static final PDType1Font POLICE_NORMALE =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );

    private static final PDType1Font POLICE_GRASSE =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );

    private static final DateTimeFormatter FORMAT_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RecuConsultationService
            recuConsultationService;

    public byte[] generer(Long recuId) {
        RecuConsultationResponse recu =
                recuConsultationService.consulter(recuId);

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream sortie =
                        new ByteArrayOutputStream()
        ) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (
                    PDPageContentStream contenu =
                            new PDPageContentStream(
                                    document,
                                    page
                            )
            ) {
                dessinerEntete(
                        document,
                        contenu,
                        recu
                );

                dessinerInformations(
                        contenu,
                        recu
                );

                dessinerMontant(
                        contenu,
                        recu
                );

                dessinerPiedDePage(contenu);
            }

            document.save(sortie);
            return sortie.toByteArray();

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Impossible de générer le reçu PDF",
                    exception
            );
        }
    }

    private void ecrireCentre(
            PDPageContentStream contenu,
            PDType1Font police,
            float taille,
            float y,
            String texte
    ) throws IOException {
        float largeurTexte =
                police.getStringWidth(texte)
                        / 1000f
                        * taille;

        float x = (
                PDRectangle.A4.getWidth()
                        - largeurTexte
        ) / 2f;

        ecrire(
                contenu,
                police,
                taille,
                x,
                y,
                texte
        );
    }

    private void dessinerEntete(
            PDDocument document,
            PDPageContentStream contenu,
            RecuConsultationResponse recu
    ) throws IOException {
        dessinerLogo(document, contenu);

        definirCouleurRemplissage(
                contenu,
                15,
                23,
                42
        );

        ecrire(
                contenu,
                POLICE_NORMALE,
                10,
                405,
                798,
                "Rabat, le "
                        + recu.dateGeneration()
                        .toLocalDate()
                        .format(FORMAT_DATE)
        );

        ecrire(
                contenu,
                POLICE_NORMALE,
                9,
                405,
                778,
                "N° " + recu.numeroRecu()
        );

        definirCouleurRemplissage(
                contenu,
                7,
                89,
                133
        );

        ecrireCentre(
                contenu,
                POLICE_GRASSE,
                20,
                720,
                "REÇU DE PAIEMENT"
        );

        definirCouleurTrait(
                contenu,
                7,
                89,
                133
        );

        contenu.setLineWidth(1.4f);
        contenu.moveTo(50, 700);
        contenu.lineTo(545, 700);
        contenu.stroke();
    }

    private void dessinerLogo(
            PDDocument document,
            PDPageContentStream contenu
    ) throws IOException {
        try (
                InputStream fluxLogo =
                        getClass().getResourceAsStream(
                                "/pdf/logo-rrm.png"
                        )
        ) {
            if (fluxLogo == null) {
                throw new IllegalStateException(
                        "Le logo RRM est introuvable"
                );
            }

            PDImageXObject logo =
                    PDImageXObject.createFromByteArray(
                            document,
                            fluxLogo.readAllBytes(),
                            "logo-rrm"
                    );

            float largeurMaximale = 120;
            float hauteurMaximale = 65;

            float ratioLargeur =
                    largeurMaximale / logo.getWidth();

            float ratioHauteur =
                    hauteurMaximale / logo.getHeight();

            float ratio = Math.min(
                    ratioLargeur,
                    ratioHauteur
            );

            float largeur = logo.getWidth() * ratio;
            float hauteur = logo.getHeight() * ratio;

            float x = 42
                    + (120 - largeur) / 2;

            float y = 753
                    + (65 - hauteur) / 2;

            contenu.drawImage(
                    logo,
                    x,
                    y,
                    largeur,
                    hauteur
            );
        }
    }

    private void dessinerInformations(
            PDPageContentStream contenu,
            RecuConsultationResponse recu
    ) throws IOException {
        definirCouleurRemplissage(
                contenu,
                15,
                23,
                42
        );

        ecrire(
                contenu,
                POLICE_GRASSE,
                15,
                50,
                665,
                "Références"
        );

        ligne(
                contenu,
                "Numéro du reçu",
                recu.numeroRecu(),
                635
        );

        ligne(
                contenu,
                "Référence de la demande",
                recu.referenceDemande(),
                610
        );

        ligne(
                contenu,
                "Référence du paiement",
                recu.referencePaiement(),
                585
        );

        dessinerSeparateur(contenu, 560);

        ecrire(
                contenu,
                POLICE_GRASSE,
                15,
                50,
                530,
                "Bénéficiaire"
        );

        ligne(
                contenu,
                "Nom et prénom",
                recu.clientPrenom()
                        + " "
                        + recu.clientNom(),
                500
        );

        ligne(
                contenu,
                "CIN",
                recu.cin(),
                475
        );

        dessinerSeparateur(contenu, 450);

        ecrire(
                contenu,
                POLICE_GRASSE,
                15,
                50,
                420,
                "Détails de l'encaissement"
        );

        ligne(
                contenu,
                "Parking",
                recu.parkingNom(),
                390
        );

        ligne(
                contenu,
                "Paiement enregistré par",
                recu.agentNomComplet(),
                365
        );

        ligne(
                contenu,
                "Mode de paiement",
                formaterModePaiement(
                        recu.modePaiement()
                ),
                340
        );

        ligne(
                contenu,
                "Durée",
                recu.dureeEnMois() + " mois",
                315
        );

        ligne(
                contenu,
                "Date de début",
                recu.dateDebut().format(FORMAT_DATE),
                290
        );

        ligne(
                contenu,
                "Date de fin",
                recu.dateFin().format(FORMAT_DATE),
                265
        );

        if (recu.modePaiement()
                == ModePaiement.CHEQUE) {

            ligne(
                    contenu,
                    "Numéro du chèque",
                    recu.numeroCheque(),
                    240
            );

            ligne(
                    contenu,
                    "Banque",
                    recu.banqueCheque(),
                    215
            );
        }
    }

    private void dessinerMontant(
            PDPageContentStream contenu,
            RecuConsultationResponse recu
    ) throws IOException {
        definirCouleurRemplissage(
                contenu,
                248,
                250,
                252
        );

        contenu.addRect(50, 115, 495, 75);
        contenu.fill();

        definirCouleurTrait(
                contenu,
                100,
                116,
                139
        );

        contenu.setLineWidth(0.8f);
        contenu.addRect(50, 115, 495, 75);
        contenu.stroke();

        definirCouleurRemplissage(
                contenu,
                15,
                23,
                42
        );

        ecrire(
                contenu,
                POLICE_GRASSE,
                13,
                70,
                158,
                "MONTANT REÇU"
        );

        definirCouleurRemplissage(
                contenu,
                7,
                89,
                133
        );

        ecrire(
                contenu,
                POLICE_GRASSE,
                21,
                350,
                148,
                formaterMontant(recu)
        );
    }

    private void dessinerPiedDePage(
            PDPageContentStream contenu
    ) throws IOException {
        definirCouleurTrait(
                contenu,
                203,
                213,
                225
        );

        contenu.setLineWidth(0.5f);
        contenu.moveTo(50, 88);
        contenu.lineTo(545, 88);
        contenu.stroke();

        definirCouleurRemplissage(
                contenu,
                71,
                85,
                105
        );

        ecrire(
                contenu,
                POLICE_NORMALE,
                9,
                50,
                68,
                "Le présent reçu atteste l'encaissement du montant indiqué."
        );

        ecrire(
                contenu,
                POLICE_NORMALE,
                9,
                50,
                52,
                "L'activation de l'abonnement reste soumise à la validation définitive."
        );

        ecrire(
                contenu,
                POLICE_NORMALE,
                8,
                373,
                28,
                "Document généré par la plateforme RRM"
        );
    }

    private void ligne(
            PDPageContentStream contenu,
            String libelle,
            String valeur,
            float y
    ) throws IOException {
        définirTextePrincipal(contenu);

        ecrire(
                contenu,
                POLICE_NORMALE,
                11,
                50,
                y,
                libelle
        );

        ecrire(
                contenu,
                POLICE_GRASSE,
                11,
                255,
                y,
                valeur == null || valeur.isBlank()
                        ? "-"
                        : valeur
        );
    }

    private void dessinerSeparateur(
            PDPageContentStream contenu,
            float y
    ) throws IOException {
        definirCouleurTrait(
                contenu,
                226,
                232,
                240
        );

        contenu.moveTo(50, y);
        contenu.lineTo(545, y);
        contenu.stroke();
    }

    private void définirTextePrincipal(
            PDPageContentStream contenu
    ) throws IOException {
        definirCouleurRemplissage(
                contenu,
                15,
                23,
                42
        );
    }

    private void definirCouleurRemplissage(
            PDPageContentStream contenu,
            int rouge,
            int vert,
            int bleu
    ) throws IOException {
        contenu.setNonStrokingColor(
                rouge / 255f,
                vert / 255f,
                bleu / 255f
        );
    }

    private void definirCouleurTrait(
            PDPageContentStream contenu,
            int rouge,
            int vert,
            int bleu
    ) throws IOException {
        contenu.setStrokingColor(
                rouge / 255f,
                vert / 255f,
                bleu / 255f
        );
    }

    private String formaterModePaiement(
            ModePaiement modePaiement
    ) {
        return switch (modePaiement) {
            case ESPECE -> "Espèces";
            case CHEQUE -> "Chèque";
        };
    }

    private String formaterMontant(
            RecuConsultationResponse recu
    ) {
        DecimalFormatSymbols symboles =
                new DecimalFormatSymbols(
                        Locale.FRANCE
                );

        symboles.setGroupingSeparator(' ');
        symboles.setDecimalSeparator(',');

        DecimalFormat format =
                new DecimalFormat(
                        "#,##0.00",
                        symboles
                );

        return format.format(recu.montantRecu())
                + " DH";
    }

    private void ecrire(
            PDPageContentStream contenu,
            PDType1Font police,
            float taille,
            float x,
            float y,
            String texte
    ) throws IOException {
        contenu.beginText();
        contenu.setFont(police, taille);
        contenu.newLineAtOffset(x, y);
        contenu.showText(texte);
        contenu.endText();
    }
}