package com.rrm.parking.dashboard.service;

import com.rrm.parking.dashboard.dto.response.AnalyseCaResponse;
import com.rrm.parking.dashboard.dto.response.ChiffreAffairesDashboardResponse;
import com.rrm.parking.dashboard.enums.TypeAbonnementReporting;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyseCaService {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final ChiffreAffairesReportingService reporting;
    private final ParkingRepository parkings;

    public AnalyseCaResponse.Periode periode(LocalDate dateDebut, LocalDate dateFin) {
        if (dateDebut == null || dateFin == null) {
            throw new IllegalArgumentException("Les deux dates sont obligatoires");
        }
        // Cette requête applique les mêmes validations, exclusions de chèques rejetés,
        // prorata journalier et arrondis que le tableau de bord comptable.
        var resultat = reporting.chargerDashboard(dateDebut, dateFin, null, null, null,
                TypeAbonnementReporting.TOUS);
        var liste = parkings();
        return new AnalyseCaResponse.Periode(resultat.filtres().dateDebut(),
                resultat.filtres().dateFin(), resultat.synthese().caActuelHt(),
                liste, montants(liste, resultat));
    }

    public AnalyseCaResponse.Annee annee(int annee) {
        if (annee < 2000 || annee > 2100) {
            throw new IllegalArgumentException("L'année doit être comprise entre 2000 et 2100");
        }
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        var liste = parkings();
        List<AnalyseCaResponse.Mois> mois = new ArrayList<>(12);
        for (int numero = 1; numero <= 12; numero++) {
            YearMonth selection = YearMonth.of(annee, numero);
            String libelle = selection.getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH);
            if (selection.atDay(1).isAfter(aujourdHui)) {
                mois.add(new AnalyseCaResponse.Mois(numero, libelle, true, ZERO,
                        montantsVides(liste)));
                continue;
            }
            var resultat = reporting.chargerDashboard(null, null, annee, numero, null,
                    TypeAbonnementReporting.TOUS);
            mois.add(new AnalyseCaResponse.Mois(numero, libelle, false,
                    resultat.synthese().caActuelHt(), montants(liste, resultat)));
        }
        return new AnalyseCaResponse.Annee(annee, liste, List.copyOf(mois));
    }

    private List<AnalyseCaResponse.Parking> parkings() {
        // Inclut les parkings sans CA et les parkings archivés qui ont une histoire comptable.
        return parkings.findAll(Sort.by("nom", "id")).stream()
                .map(p -> new AnalyseCaResponse.Parking(p.getId(), p.getNom()))
                .toList();
    }

    private List<AnalyseCaResponse.MontantParking> montants(
            List<AnalyseCaResponse.Parking> liste,
            ChiffreAffairesDashboardResponse resultat) {
        Map<Long, BigDecimal> valeurs = resultat.repartitionParParking().stream()
                .collect(Collectors.toMap(
                        ChiffreAffairesDashboardResponse.ChiffreAffairesParking::parkingId,
                        ChiffreAffairesDashboardResponse.ChiffreAffairesParking::chiffreAffairesHt));
        return liste.stream()
                .map(p -> new AnalyseCaResponse.MontantParking(p.id(),
                        valeurs.getOrDefault(p.id(), ZERO)))
                .toList();
    }

    private List<AnalyseCaResponse.MontantParking> montantsVides(
            List<AnalyseCaResponse.Parking> liste) {
        return liste.stream()
                .map(p -> new AnalyseCaResponse.MontantParking(p.id(), ZERO))
                .toList();
    }
}
