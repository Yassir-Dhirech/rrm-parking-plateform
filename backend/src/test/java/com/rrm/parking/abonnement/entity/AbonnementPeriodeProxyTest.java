package com.rrm.parking.abonnement.entity;

import com.rrm.parking.client.entity.ClientParticulier;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class AbonnementPeriodeProxyTest {

    @Test
    void accepteUnePeriodeLieeAuMemeAbonnementViaUnProxy() {
        ClientParticulier client = new ClientParticulier(
                "Client", "Proxy", "EF123456"
        );
        AbonnementRegulier abonnementGere = new AbonnementRegulier(
                "ABO-PROXY", client
        );
        AbonnementRegulier abonnementProxy = new AbonnementRegulier(
                "ABO-PROXY", client
        );
        ReflectionTestUtils.setField(abonnementGere, "id", 42L);
        ReflectionTestUtils.setField(abonnementProxy, "id", 42L);

        PeriodeAbonnement periode = new PeriodeAbonnement(
                1,
                LocalDate.now(),
                LocalDate.now().plusMonths(3).minusDays(1),
                new BigDecimal("1250.00"),
                new BigDecimal("20.00"),
                abonnementProxy
        );

        abonnementGere.ajouterPeriode(periode);

        assertThat(abonnementGere.getPeriodes()).containsExactly(periode);
    }
}
