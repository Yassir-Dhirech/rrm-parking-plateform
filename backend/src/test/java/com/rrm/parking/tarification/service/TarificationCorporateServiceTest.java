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

    @Test
    void calculeLeContratDe20AnsEtLesCartesPour10Places() {
        var decompte = service.calculerDecompte(10);

        assertThat(decompte.dureeEnMois()).isEqualTo(240);
        assertThat(decompte.prixMensuelUnitaireTtc())
                .isEqualByComparingTo("375.00");
        assertThat(decompte.montantAbonnementTtc())
                .isEqualByComparingTo("900000.00");
        assertThat(decompte.fraisCartesTtc())
                .isEqualByComparingTo("500.00");
        assertThat(decompte.montantTotalTtc())
                .isEqualByComparingTo("900500.00");
    }

    @Test
    void calculeLeTarifReduitEtLesCartesPour11Places() {
        var decompte = service.calculerDecompte(11);

        assertThat(decompte.prixMensuelUnitaireTtc())
                .isEqualByComparingTo("325.00");
        assertThat(decompte.montantAbonnementTtc())
                .isEqualByComparingTo("858000.00");
        assertThat(decompte.fraisCartesTtc())
                .isEqualByComparingTo("550.00");
        assertThat(decompte.montantTotalTtc())
                .isEqualByComparingTo("858550.00");
    }
}
