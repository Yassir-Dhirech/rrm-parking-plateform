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

    @Test
    void multiplieLePrixMensuelTtcArrondiSansCreerUnCentimeParasite() {
        TarifParking tarif = new TarifParking();
        tarif.setPrixHT(new BigDecimal("291.67"));
        tarif.setTauxTVA(new BigDecimal("20.00"));
        tarif.setDureeEnMois(3);

        assertThat(tarif.calculerPrixTTC())
                .isEqualByComparingTo(new BigDecimal("350.00"));
        assertThat(tarif.calculerMontantTotalTTC())
                .isEqualByComparingTo(new BigDecimal("1050.00"));
        assertThat(tarif.calculerMontantTotalHT())
                .isEqualByComparingTo(new BigDecimal("875.00"));
    }

    @Test
    void recalculeLeTotalHtDepuisLeTotalTtcSansCentimeParasite() {
        TarifParking tarif = new TarifParking();
        tarif.setPrixHT(new BigDecimal("416.67"));
        tarif.setTauxTVA(new BigDecimal("20.00"));
        tarif.setDureeEnMois(3);

        assertThat(tarif.calculerMontantTotalTTC())
                .isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(tarif.calculerMontantTotalHT())
                .isEqualByComparingTo(new BigDecimal("1250.00"));
    }
}
