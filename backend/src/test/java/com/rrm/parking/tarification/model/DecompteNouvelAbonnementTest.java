package com.rrm.parking.tarification.model;

import com.rrm.parking.tarification.entity.TarifParking;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DecompteNouvelAbonnementTest {

    @Test
    void ajouteLes50DhDeCarteAuMontantDeLAbonnement() {
        TarifParking tarif = new TarifParking();
        tarif.setPrixHT(new BigDecimal("250.00"));
        tarif.setTauxTVA(new BigDecimal("20.00"));
        tarif.setDureeEnMois(3);

        DecompteNouvelAbonnement decompte =
                DecompteNouvelAbonnement.depuis(tarif);

        assertThat(decompte.montantAbonnementTTC())
                .isEqualByComparingTo(new BigDecimal("900.00"));
        assertThat(decompte.fraisCarteTTC())
                .isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(decompte.montantTotalTTC())
                .isEqualByComparingTo(new BigDecimal("950.00"));
    }
}
