package com.rrm.parking.avis.service;

import com.rrm.parking.avis.repository.AvisFeedbackRepository;
import com.rrm.parking.parking.repository.ParkingRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AvisFeedbackServiceTest {
    private final AvisFeedbackRepository repository = mock(AvisFeedbackRepository.class);
    private final AvisFeedbackService service = new AvisFeedbackService(repository,
            mock(ParkingRepository.class));

    @Test
    void calculeLesStatistiquesSurToutesLesNotesEtLesCasAbsents() {
        when(repository.repartirParNote()).thenReturn(List.of(
                new Object[]{1, 1L}, new Object[]{3, 2L}, new Object[]{5, 3L}));

        var stats = service.statistiques();

        assertThat(stats.total()).isEqualTo(6);
        assertThat(stats.moyenne()).isCloseTo(22.0 / 6, org.assertj.core.data.Offset.offset(0.0001));
        assertThat(stats.cinqEtoiles()).isEqualTo(3);
        assertThat(stats.repartition()).hasSize(5);
        assertThat(stats.repartition().get(1).nombre()).isZero();
        assertThat(stats.repartition().get(4).pourcentage()).isEqualTo(50.0);
    }

    @Test
    void renvoieZeroSansAvis() {
        when(repository.repartirParNote()).thenReturn(List.of());
        var stats = service.statistiques();
        assertThat(stats.total()).isZero();
        assertThat(stats.moyenne()).isZero();
        assertThat(stats.repartition()).allMatch(ligne -> ligne.pourcentage() == 0);
    }
}
