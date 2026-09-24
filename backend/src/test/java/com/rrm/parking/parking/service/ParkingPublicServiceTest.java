package com.rrm.parking.parking.service;

import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.parking.dto.response.ParkingPublicResponse;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParkingPublicServiceTest {

    @Mock
    private TarifParkingRepository tarifParkingRepository;

    @Mock
    private ParkingRepository parkingRepository;

    @Mock
    private AffectationParkingRepository affectationParkingRepository;

    @Mock
    private DemandeNouveauContratCorporateRepository demandeCorporateRepository;

    @Mock
    private Parking parkingDisponible;

    @Mock
    private Parking parkingComplet;

    private ParkingPublicService parkingPublicService;

    @BeforeEach
    void initialiser() {
        parkingPublicService = new ParkingPublicService(
                tarifParkingRepository,
                parkingRepository,
                affectationParkingRepository,
                demandeCorporateRepository
        );
    }

    @Test
    void doitConserverUnParkingActifCompletDansLaListe() {
        preparerParking(parkingDisponible, 1L, "Parking disponible", 10);
        preparerParking(parkingComplet, 2L, "Parking complet", 0);

        when(affectationParkingRepository.compterPlacesOccupeesParParking(
                anySet(),
                any()
        )).thenReturn(List.of());
        when(demandeCorporateRepository.compterPlacesReserveesParParking(
                anySet()
        )).thenReturn(List.of());
        when(parkingRepository.findAllByStatutInOrderByNomAsc(anyCollection()))
                .thenReturn(List.of(parkingDisponible, parkingComplet));

        List<ParkingPublicResponse> resultats =
                parkingPublicService
                        .listerParkingsDisponiblesPourAbonnement();

        assertEquals(2, resultats.size());
        assertTrue(resultats.get(0).souscriptionDisponible());
        assertFalse(resultats.get(1).souscriptionDisponible());
    }

    private void preparerParking(
            Parking parking,
            Long id,
            String nom,
            int capaciteReservee
    ) {
        when(parking.getId()).thenReturn(id);
        when(parking.getNom()).thenReturn(nom);
        when(parking.getStatut()).thenReturn(StatutParking.ACTIF);
        when(parking.getCapaciteReserveeAbonnements())
                .thenReturn(capaciteReservee);
        when(parking.getCapaciteTotale()).thenReturn(capaciteReservee);
    }
}
