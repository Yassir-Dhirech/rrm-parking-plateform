package com.rrm.parking.dashboard.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentParkingRegistreServiceTest {

    @Mock NamedParameterJdbcTemplate jdbc;
    @Mock AffectationAgentParkingRepository affectationRepository;
    @Mock AffectationAgentParking affectation;
    @Mock Parking parking;
    @InjectMocks AgentParkingRegistreService service;

    @Test
    void agentSansParkingNePeutVoirAucuneCarte() {
        when(affectationRepository.findByUtilisateurIdAndActiveTrue(5L))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.cartes(5L, null, null, null))
                .isInstanceOf(ConflitMetierException.class);
        verifyNoInteractions(jdbc);
    }

    @Test
    void serieMensuelleUtiliseLeParkingAffecteEtCompteLesAbonnements() {
        when(affectationRepository.findByUtilisateurIdAndActiveTrue(5L))
                .thenReturn(Optional.of(affectation));
        when(affectation.getDateDebut()).thenReturn(LocalDate.of(2024, 1, 1));
        when(affectation.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(9L);
        when(parking.getNom()).thenReturn("Bab El Had");
        when(jdbc.queryForObject(anyString(),
                any(MapSqlParameterSource.class), eq(Long.class)))
                .thenReturn(2L, 1L);

        var reponse = service.abonnementsMensuels(5L, 2025);

        assertThat(reponse.parkingId()).isEqualTo(9L);
        assertThat(reponse.mois()).hasSize(12);
        assertThat(reponse.mois().getFirst().nombreAbonnements())
                .isEqualTo(3);
        verify(jdbc, times(24)).queryForObject(anyString(),
                any(MapSqlParameterSource.class), eq(Long.class));
    }
}
