package com.rrm.parking.tarification.model;

import com.rrm.parking.tarification.entity.TarifParking;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record DecompteNouvelAbonnement(
        BigDecimal montantAbonnementTTC,
        BigDecimal fraisCarteTTC,
        BigDecimal montantTotalTTC
) {

    public static final BigDecimal FRAIS_CARTE_NEUVE_TTC =
            new BigDecimal("50.00");

    public static DecompteNouvelAbonnement depuis(TarifParking tarif) {
        if (tarif == null) {
            throw new IllegalArgumentException("Le tarif parking est obligatoire");
        }

        BigDecimal montantAbonnement = tarif
                .calculerMontantTotalTTC()
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal fraisCarte = FRAIS_CARTE_NEUVE_TTC
                .setScale(2, RoundingMode.HALF_UP);

        return new DecompteNouvelAbonnement(
                montantAbonnement,
                fraisCarte,
                montantAbonnement
                        .add(fraisCarte)
                        .setScale(2, RoundingMode.HALF_UP)
        );
    }
}
