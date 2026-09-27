package com.rrm.parking.dashboard.service;

import com.rrm.parking.dashboard.dto.response.AnalyseCaResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyseCaExcelService {
    private final AnalyseCaService analyse;

    public enum Tableaux { PERIODE, MENSUEL, DEUX }

    public byte[] generer(LocalDate dateDebut, LocalDate dateFin, int annee,
                          Tableaux tableaux) {
        if (tableaux == null) throw new IllegalArgumentException("Sélectionnez les tableaux à exporter");
        try (Workbook classeur = new XSSFWorkbook();
             ByteArrayOutputStream sortie = new ByteArrayOutputStream()) {
            CellStyle entete = classeur.createCellStyle();
            entete.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            entete.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            var police = classeur.createFont();
            police.setBold(true);
            entete.setFont(police);

            CellStyle montant = classeur.createCellStyle();
            montant.setDataFormat(classeur.createDataFormat().getFormat("#,##0.00"));

            if (tableaux != Tableaux.MENSUEL) {
                remplirPeriode(classeur, analyse.periode(dateDebut, dateFin), entete, montant);
            }
            if (tableaux != Tableaux.PERIODE) {
                remplirMensuel(classeur, analyse.annee(annee), entete, montant);
            }
            classeur.write(sortie);
            return sortie.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de générer le classeur Excel", e);
        }
    }

    private void remplirPeriode(Workbook classeur, AnalyseCaResponse.Periode donnees,
                                CellStyle entete, CellStyle montant) {
        Sheet feuille = classeur.createSheet("CA par période");
        Row titre = feuille.createRow(0);
        titre.createCell(0).setCellValue("Chiffre d'affaires HT des abonnements");
        Row intervalle = feuille.createRow(1);
        intervalle.createCell(0).setCellValue("Du " + donnees.dateDebut()
                + " au " + donnees.dateFin());
        Row colonnes = feuille.createRow(3);
        texte(colonnes, 0, "Période", entete);
        texte(colonnes, 1, "Total HT (MAD)", entete);
        for (int i = 0; i < donnees.parkings().size(); i++) {
            texte(colonnes, i + 2, donnees.parkings().get(i).nom(), entete);
        }
        Row ligne = feuille.createRow(4);
        ligne.createCell(0).setCellValue(donnees.dateDebut() + " — " + donnees.dateFin());
        nombre(ligne, 1, donnees.totalHt(), montant);
        Map<Long, BigDecimal> valeurs = indexer(donnees.montants());
        for (int i = 0; i < donnees.parkings().size(); i++) {
            nombre(ligne, i + 2, valeurs.get(donnees.parkings().get(i).id()), montant);
        }
        largeurColonnes(feuille, donnees.parkings().size() + 2);
        feuille.createFreezePane(2, 4);
    }

    private void remplirMensuel(Workbook classeur, AnalyseCaResponse.Annee donnees,
                                 CellStyle entete, CellStyle montant) {
        Sheet feuille = classeur.createSheet("CA mensuel " + donnees.annee());
        feuille.createRow(0).createCell(0).setCellValue(
                "Chiffre d'affaires mensuel HT des abonnements — " + donnees.annee());
        Row colonnes = feuille.createRow(2);
        texte(colonnes, 0, "Mois", entete);
        texte(colonnes, 1, "Total HT (MAD)", entete);
        for (int i = 0; i < donnees.parkings().size(); i++) {
            texte(colonnes, i + 2, donnees.parkings().get(i).nom(), entete);
        }
        for (int n = 0; n < donnees.mois().size(); n++) {
            AnalyseCaResponse.Mois mois = donnees.mois().get(n);
            Row ligne = feuille.createRow(n + 3);
            ligne.createCell(0).setCellValue(mois.libelle() + " " + donnees.annee());
            if (mois.aVenir()) continue; // Une période future ne constitue pas un CA réalisé.
            nombre(ligne, 1, mois.totalHt(), montant);
            Map<Long, BigDecimal> valeurs = indexer(mois.montants());
            for (int i = 0; i < donnees.parkings().size(); i++) {
                nombre(ligne, i + 2, valeurs.get(donnees.parkings().get(i).id()), montant);
            }
        }
        largeurColonnes(feuille, donnees.parkings().size() + 2);
        feuille.createFreezePane(2, 3);
    }

    private Map<Long, BigDecimal> indexer(List<AnalyseCaResponse.MontantParking> valeurs) {
        return valeurs.stream().collect(Collectors.toMap(
                AnalyseCaResponse.MontantParking::parkingId,
                AnalyseCaResponse.MontantParking::montantHt));
    }

    private void texte(Row ligne, int colonne, String valeur, CellStyle style) {
        var cellule = ligne.createCell(colonne);
        cellule.setCellValue(valeur);
        cellule.setCellStyle(style);
    }

    private void nombre(Row ligne, int colonne, BigDecimal valeur, CellStyle style) {
        var cellule = ligne.createCell(colonne);
        cellule.setCellValue(valeur.doubleValue());
        cellule.setCellStyle(style);
    }

    private void largeurColonnes(Sheet feuille, int nombre) {
        feuille.setColumnWidth(0, 30 * 256);
        feuille.setColumnWidth(1, 20 * 256);
        for (int i = 2; i < nombre; i++) feuille.setColumnWidth(i, 24 * 256);
    }
}
