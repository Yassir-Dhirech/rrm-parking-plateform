package com.rrm.parking.carte.entity;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;

class CarteAccesExpirationTest {

    @Test
    void expireCarteJamaisImprimeeSansNumeroPhysique() {
        Abonnement abonnement = mock(Abonnement.class);
        CarteAcces carte = new CarteAcces(
                "CARTE-EXPIRATION-TEST",
                abonnement
        );

        carte.demanderImpression();
        carte.expirer();

        assertThat(carte.getStatut())
                .isEqualTo(StatutCarteAcces.EXPIREE);
        assertThat(carte.getNumeroCarte()).isNull();
        assertThat(carte.getDateExpiration()).isNotNull();

        assertThatCode(() ->
                ReflectionTestUtils.invokeMethod(
                        carte,
                        "verifierCoherence"
                )
        ).doesNotThrowAnyException();
    }
}