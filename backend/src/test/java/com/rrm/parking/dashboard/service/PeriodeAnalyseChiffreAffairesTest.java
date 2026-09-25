package com.rrm.parking.dashboard.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PeriodeAnalyseChiffreAffairesTest {

    private static final LocalDate AUJOURD_HUI =
            LocalDate.of(2026, 9, 25);

    @Test
    void doitUtiliserLeMoisCourantParDefautSansInclureLeFutur() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        null,
                        null,
                        null,
                        null,
                        AUJOURD_HUI
                );

        assertEquals(LocalDate.of(2026, 9, 1), periode.debut());
        assertEquals(AUJOURD_HUI, periode.fin());
    }

    @Test
    void doitTronquerLeMoisSelectionneAujourdhui() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        null,
                        null,
                        2026,
                        9,
                        AUJOURD_HUI
                );

        assertEquals(LocalDate.of(2026, 9, 1), periode.debut());
        assertEquals(AUJOURD_HUI, periode.fin());
    }

    @Test
    void doitConserverUnePlageHistoriqueExplicite() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        LocalDate.of(2026, 3, 1),
                        LocalDate.of(2026, 5, 31),
                        null,
                        null,
                        AUJOURD_HUI
                );

        assertEquals(LocalDate.of(2026, 3, 1), periode.debut());
        assertEquals(LocalDate.of(2026, 5, 31), periode.fin());
    }

    @Test
    void doitComparerUnMoisPartielAuMemeIntervalleDuMoisPrecedent() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        LocalDate.of(2026, 9, 1),
                        LocalDate.of(2026, 9, 25),
                        null,
                        null,
                        AUJOURD_HUI
                );

        assertEquals(
                LocalDate.of(2026, 8, 1),
                periode.precedente().debut()
        );
        assertEquals(
                LocalDate.of(2026, 8, 25),
                periode.precedente().fin()
        );
    }

    @Test
    void doitComparerUneAnneeALaMemePeriodeDeLAnneePrecedente() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        null,
                        null,
                        2026,
                        null,
                        AUJOURD_HUI
                );

        assertEquals(
                LocalDate.of(2025, 1, 1),
                periode.precedente().debut()
        );
        assertEquals(
                LocalDate.of(2025, 9, 25),
                periode.precedente().fin()
        );
    }

    @Test
    void doitComparerUnePlageMultimoisALaDureeImmediatementPrecedente() {
        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        LocalDate.of(2026, 7, 1),
                        LocalDate.of(2026, 9, 25),
                        null,
                        null,
                        AUJOURD_HUI
                );

        assertEquals(
                LocalDate.of(2026, 4, 5),
                periode.precedente().debut()
        );
        assertEquals(
                LocalDate.of(2026, 6, 30),
                periode.precedente().fin()
        );
    }

    @Test
    void doitRefuserLeMelangeDatesEtAnnee() {
        assertThrows(
                IllegalArgumentException.class,
                () -> PeriodeAnalyseChiffreAffaires.resoudre(
                        LocalDate.of(2026, 9, 1),
                        LocalDate.of(2026, 9, 25),
                        2026,
                        null,
                        AUJOURD_HUI
                )
        );
    }
}
