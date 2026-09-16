package com.rrm.parking.tarification.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class TarifParkingTest {

    @Test
    void calculeLeTotalTtcSansAjouterDeuxFoisLaTva() {
        TarifParking tarif = new TarifParking();
        tarif.setPrixHT(new BigDecimal("250.00"));
        tarif.setTauxTVA(new BigDecimal("20.00"));
        tarif.setDureeEnMois(3);

        assertThat(tarif.calculerPrixTTC())
                .isEqualByComparingTo(new BigDecimal("300.00"));
        assertThat(tarif.calculerMontantTotalTTC())
                .isEqualByComparingTo(new BigDecimal("900.00"));
    }
}
