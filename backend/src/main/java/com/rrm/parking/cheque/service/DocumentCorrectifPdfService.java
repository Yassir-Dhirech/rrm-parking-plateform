package com.rrm.parking.cheque.service;

import com.rrm.parking.cheque.repository.DossierRejetChequeRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class DocumentCorrectifPdfService {
    private final DossierRejetChequeRepository dossiers;

    @Transactional(readOnly = true)
    public byte[] generer(Long dossierId) {
        var dossier = dossiers.findById(dossierId)
                .orElseThrow(() -> new RessourceIntrouvableException("Dossier introuvable"));
        if (dossier.getDocumentCorrectifReference() == null) {
            throw new ConflitMetierException("Le rejet doit être validé avant le document correctif");
        }
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream sortie = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            pdf.addPage(page);
            try (PDPageContentStream contenu = new PDPageContentStream(pdf, page)) {
                var police = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
                String[] lignes = {
                        "RABAT REGION MOBILITE - DOCUMENT CORRECTIF",
                        "Reference : " + dossier.getDocumentCorrectifReference(),
                        "Dossier de rejet bancaire : " + dossier.getId(),
                        "Date de validation : " + dossier.getDateDecision().toLocalDate(),
                        "Facture initiale : " + dossier.getFactureInitialeNumero(),
                        "Abonnement concerne : " + dossier.getAbonnement().getReference(),
                        "Cheque rejete : " + dossier.getPaiementInitial().getNumeroCheque(),
                        "Montant facture HT : " + dossier.getDocumentCorrectifTotalHt() + " MAD",
                        "TVA de la facture : " + dossier.getDocumentCorrectifTotalTva() + " MAD",
                        "Montant facture TTC : " + dossier.getDocumentCorrectifTotalTtc() + " MAD",
                        "Le paiement de cette facture a ete rejete par la banque.",
                        "Ce document lie la facture initiale au dossier de rejet.",
                        "Qualification comptable / fiscale a valider par le service comptable."
                };
                float y = 760;
                for (String ligne : lignes) {
                    contenu.beginText();
                    contenu.setFont(police, 11);
                    contenu.newLineAtOffset(45, y);
                    contenu.showText(ligne);
                    contenu.endText();
                    y -= 34;
                }
            }
            pdf.save(sortie);
            return sortie.toByteArray();
        } catch (IOException erreur) {
            throw new IllegalStateException("Impossible de produire le document correctif", erreur);
        }
    }
}
