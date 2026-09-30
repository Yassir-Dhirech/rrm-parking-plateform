package com.rrm.parking.dashboard.service;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import org.mockito.ArgumentCaptor;

class ChiffreAffairesReportingServiceTest {

    @Test
    void exclutLesPeriodesSansPaiementConfirmeDesTotauxEtDeLaRepartition() {
        NamedParameterJdbcTemplate jdbc = mock(NamedParameterJdbcTemplate.class);
        when(jdbc.query(anyString(), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenReturn(List.of());

        var service = new ChiffreAffairesReportingService(jdbc);
        var resultat = service.chargerDashboard(
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 28),
                null, null, null, null);

        ArgumentCaptor<String> requetes = ArgumentCaptor.forClass(String.class);
        verify(jdbc, times(2)).query(requetes.capture(),
                any(MapSqlParameterSource.class), any(RowMapper.class));
        for (String sql : requetes.getAllValues()) {
            assertThat(sql).containsOnlyOnce("'REGULIER' as type_abonnement");
            assertThat(sql).containsOnlyOnce("'CORPORATE' as type_abonnement");
            assertThat(sql).contains("encaisse.statut = 'CONFIRME'");
            assertThat(sql).contains("rejet_regle.statut = 'TERMINE'");
            assertThat(sql).contains("regularisation.statut = 'CONFIRME'");
        }
        assertThat(resultat.repartitionParParking()).isEmpty();
        assertThat(resultat.synthese().caActuelHt().signum()).isZero();
    }
}
