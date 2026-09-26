package com.rrm.parking.parking.config;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParkingDataInitializerTest {

    @Mock
    private ParkingRepository parkingRepository;

    private ParkingDataInitializer initializer;

    @BeforeEach
    void initialiser() {
        initializer = new ParkingDataInitializer(parkingRepository);
    }

    @Test
    void neDoitRienFaireLorsqueLaSynchronisationEstDesactivee() throws Exception {
        ReflectionTestUtils.setField(initializer, "enabled", false);

        initializer.run(null);

        verify(parkingRepository, never()).findByCodeIgnoreCase(anyString());
    }

    @Test
    void doitMettreAJourLesExistantsEtCreerLesParkingsAbsents() throws Exception {
        Parking babElHad = new Parking();
        babElHad.setId(9L);
        babElHad.setCode("BAB_EL_HAD");
        babElHad.setNom("Ancien nom");
        babElHad.setAdresse("Ancienne adresse");
        babElHad.modifierCapacites(250, 80);

        when(parkingRepository.findByCodeIgnoreCase(anyString()))
                .thenAnswer(invocation -> "BAB_EL_HAD".equals(invocation.getArgument(0))
                        ? Optional.of(babElHad)
                        : Optional.empty());
        ReflectionTestUtils.setField(initializer, "enabled", true);

        initializer.run(null);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Parking>> captor = ArgumentCaptor.forClass(List.class);
        verify(parkingRepository).saveAll(captor.capture());
        List<Parking> parkings = captor.getValue();

        assertEquals(15, parkings.size());
        Parking parkingMisAJour = trouver(parkings, "BAB_EL_HAD");
        assertSame(babElHad, parkingMisAJour);
        assertEquals("Bab El Had", parkingMisAJour.getNom());
        assertEquals(471, parkingMisAJour.getCapaciteTotale());
        assertEquals(212, parkingMisAJour.getCapaciteReserveeAbonnements());
        assertEquals(new BigDecimal("34.0224939"), parkingMisAJour.getLatitude());

        Parking temaraPlage = trouver(parkings, "TEMARA_PLAGE");
        assertEquals(258, temaraPlage.getCapaciteTotale());
        assertEquals(103, temaraPlage.getCapaciteReserveeAbonnements());

        assertEquals(
                4267,
                parkings.stream().mapToInt(Parking::getCapaciteTotale).sum()
        );
        assertEquals(
                2211,
                parkings.stream().mapToInt(Parking::getCapaciteReserveeAbonnements).sum()
        );
    }

    private Parking trouver(List<Parking> parkings, String code) {
        return parkings.stream()
                .filter(parking -> code.equals(parking.getCode()))
                .findFirst()
                .orElseThrow();
    }
}
