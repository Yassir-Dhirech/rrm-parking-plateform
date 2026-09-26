package com.rrm.parking.dashboard.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ReconciliationArrondiTest {

    @Test
    void doitAffecterLeCentimeResiduelALaPlusGrandeLigne() {
        List<BigDecimal> resultat = ReconciliationArrondi.reconciler(
                List.of(
                        new BigDecimal("2499.994"),
                        new BigDecimal("1008.334")
                ),
                new BigDecimal("3508.328")
        );

        assertEquals(
                List.of(
                        new BigDecimal("2500.00"),
                        new BigDecimal("1008.33")
                ),
                resultat
        );

        assertEquals(
                new BigDecimal("3508.33"),
                resultat.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    @Test
    void neDoitPasModifierLesLignesDejaReconciliees() {
        List<BigDecimal> resultat = ReconciliationArrondi.reconciler(
                List.of(
                        new BigDecimal("100.006"),
                        new BigDecimal("50.002")
                ),
                new BigDecimal("150.008")
        );

        assertEquals(
                List.of(
                        new BigDecimal("100.01"),
                        new BigDecimal("50.00")
                ),
                resultat
        );
    }

    @Test
    void doitRefuserUneVentilationIncompatibleAvecLeTotal() {
        assertThrows(
                IllegalStateException.class,
                () -> ReconciliationArrondi.reconciler(
                        List.of(new BigDecimal("100.00")),
                        new BigDecimal("110.00")
                )
        );
    }
}
