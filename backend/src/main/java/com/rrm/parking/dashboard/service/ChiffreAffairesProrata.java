package com.rrm.parking.dashboard.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

final class ChiffreAffairesProrata {

    private ChiffreAffairesProrata() {
    }

    static BigDecimal calculer(
            BigDecimal montantHt,
            LocalDate dateDebutPeriode,
            LocalDate dateFinPeriode,
            LocalDate dateDebutReconnaissance,
            LocalDate dateFinReconnaissance
    ) {
        if (montantHt == null
                || dateDebutPeriode == null
                || dateFinPeriode == null
                || dateDebutReconnaissance == null
                || dateFinReconnaissance == null) {
            throw new IllegalArgumentException(
                    "Le calcul du chiffre d'affaires exige un montant et des dates"
            );
        }

        if (montantHt.signum() < 0) {
            throw new IllegalArgumentException(
                    "Le montant HT ne peut pas être négatif"
            );
        }

        if (dateFinPeriode.isBefore(dateDebutPeriode)) {
            throw new IllegalArgumentException(
                    "La fin de période ne peut pas précéder son début"
            );
        }

        LocalDate debut = dateDebutPeriode.isAfter(dateDebutReconnaissance)
                ? dateDebutPeriode
                : dateDebutReconnaissance;

        LocalDate fin = dateFinPeriode.isBefore(dateFinReconnaissance)
                ? dateFinPeriode
                : dateFinReconnaissance;

        if (fin.isBefore(debut)) {
            return BigDecimal.ZERO;
        }

        long dureeTotale = ChronoUnit.DAYS.between(
                dateDebutPeriode,
                dateFinPeriode
        ) + 1;

        long joursReconnus = ChronoUnit.DAYS.between(debut, fin) + 1;

        return montantHt
                .multiply(BigDecimal.valueOf(joursReconnus))
                .divide(
                        BigDecimal.valueOf(dureeTotale),
                        MathContext.DECIMAL128
                );
    }
}
