package com.rrm.parking.tarification.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TarificationCorporateServiceTest {

    private final TarificationCorporateService service =
            new TarificationCorporateService();

    @Test
    void applique375DhParPlaceJusquA10PlacesIncluses() {
        assertThat(service.calculerPrixMensuelUnitaireTTC(10))
                .isEqualByComparingTo(new BigDecimal("375.00"));
        assertThat(service.calculerMontantMensuelTTC(10))
                .isEqualByComparingTo(new BigDecimal("3750.00"));
    }

    @Test
    void applique325DhParPlaceAPartirDe11Places() {
        assertThat(service.calculerPrixMensuelUnitaireTTC(11))
                .isEqualByComparingTo(new BigDecimal("325.00"));
        assertThat(service.calculerMontantMensuelTTC(11))
                .isEqualByComparingTo(new BigDecimal("3575.00"));
    }

    @Test
    void refuseUnNombreDePlacesNonPositif() {
        assertThatThrownBy(() -> service.calculerMontantMensuelTTC(0))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
