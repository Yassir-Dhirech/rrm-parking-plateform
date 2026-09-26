package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CapaciteCorporateServiceTest {

    @Mock ParkingRepository parkingRepository;
    @Mock AffectationParkingRepository affectationParkingRepository;
    @Mock DemandeNouveauContratCorporateRepository corporateRepository;
    @Mock Parking parking;
    @InjectMocks CapaciteCorporateService service;

    @Test
    void seulesLesDemandesValideesReserventDesPlaces() {
        assertThat(ReservationPlacesCorporate.STATUTS_RESERVANT)
                .contains(StatutDemande.VALIDEE, StatutDemande.FINALISEE)
                .doesNotContain(StatutDemande.SOUMISE,
                        StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE,
                        StatutDemande.REFUSEE);

        preparerParking(10);
        when(affectationParkingRepository.compterPlacesOccupees(
                eq(9L), any(), any())).thenReturn(2L);
        when(corporateRepository.compterPlacesReservees(
                eq(9L), eq(ReservationPlacesCorporate.STATUTS_RESERVANT),
                any())).thenReturn(3L);

        assertThat(service.verrouillerEtVerifier(9L, 5)).isSameAs(parking);
        assertThatThrownBy(() -> service.verrouillerEtVerifier(9L, 6))
                .isInstanceOf(ConflitMetierException.class)
                .hasMessageContaining("5 place(s) disponible(s)");
        verify(corporateRepository, times(2)).compterPlacesReservees(
                9L, ReservationPlacesCorporate.STATUTS_RESERVANT,
                LocalDate.now(ZoneId.of("Africa/Casablanca")));
    }

    @Test
    void validationNeComptePasDeuxFoisLaDemandeEnCours() {
        preparerParking(10);
        when(affectationParkingRepository.compterPlacesOccupees(
                eq(9L), any(), any())).thenReturn(2L);
        when(corporateRepository.compterPlacesReserveesHorsDemande(
                eq(9L), eq(ReservationPlacesCorporate.STATUTS_RESERVANT),
                eq(42L), any())).thenReturn(3L);

        assertThat(service.verrouillerEtVerifierPourValidation(42L, 9L, 5))
                .isSameAs(parking);
        verify(corporateRepository).compterPlacesReserveesHorsDemande(
                9L, ReservationPlacesCorporate.STATUTS_RESERVANT, 42L,
                LocalDate.now(ZoneId.of("Africa/Casablanca")));
    }

    private void preparerParking(int capacite) {
        when(parkingRepository.findByIdPourMiseAJour(9L))
                .thenReturn(Optional.of(parking));
        when(parking.getStatut()).thenReturn(StatutParking.ACTIF);
        when(parking.getCapaciteReserveeAbonnements()).thenReturn(capacite);
    }
}
