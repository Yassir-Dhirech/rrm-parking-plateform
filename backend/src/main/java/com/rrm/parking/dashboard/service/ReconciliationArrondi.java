package com.rrm.parking.dashboard.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

final class ReconciliationArrondi {

    private static final BigDecimal TOLERANCE_VENTILATION =
            new BigDecimal("0.000001");

    private ReconciliationArrondi() {
    }

    static List<BigDecimal> reconciler(
            List<BigDecimal> valeursBrutes,
            BigDecimal totalBrut
    ) {
        if (valeursBrutes == null || totalBrut == null) {
            throw new IllegalArgumentException(
                    "Les montants à réconcilier sont obligatoires"
            );
        }

        if (valeursBrutes.isEmpty()) {
            if (totalBrut.signum() == 0) {
                return List.of();
            }

            throw new IllegalStateException(
                    "Le chiffre d'affaires ne peut pas être ventilé par parking"
            );
        }

        BigDecimal sommeBrute = valeursBrutes.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBrut.subtract(sommeBrute)
                .abs()
                .compareTo(TOLERANCE_VENTILATION) > 0) {
            throw new IllegalStateException(
                    "La ventilation par parking ne correspond pas au total général"
            );
        }

        List<BigDecimal> valeursAffichees = valeursBrutes.stream()
                .map(ReconciliationArrondi::arrondir)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);

        BigDecimal sommeAffichee = valeursAffichees.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal residu = arrondir(totalBrut).subtract(sommeAffichee);

        int indexPlusGrandeValeur = 0;
        for (int index = 1; index < valeursBrutes.size(); index++) {
            if (valeursBrutes.get(index).compareTo(
                    valeursBrutes.get(indexPlusGrandeValeur)
            ) > 0) {
                indexPlusGrandeValeur = index;
            }
        }

        valeursAffichees.set(
                indexPlusGrandeValeur,
                valeursAffichees.get(indexPlusGrandeValeur).add(residu)
        );

        return List.copyOf(valeursAffichees);
    }

    private static BigDecimal arrondir(BigDecimal valeur) {
        return valeur.setScale(2, RoundingMode.HALF_UP);
    }
}
