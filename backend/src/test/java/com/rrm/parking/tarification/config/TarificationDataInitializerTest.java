package com.rrm.parking.tarification.config;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationArguments;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TarificationDataInitializerTest {

    @Test
    void appliqueLeProfilBabElHadAuxParkingsSansProfilExplicite() throws Exception {
        ParkingRepository parkingRepository = mock(ParkingRepository.class);
        ForfaitRepository forfaitRepository = mock(ForfaitRepository.class);
        TarifParkingRepository tarifParkingRepository = mock(TarifParkingRepository.class);
        TarificationDataInitializer initializer = new TarificationDataInitializer(
                parkingRepository,
                forfaitRepository,
                tarifParkingRepository
        );

        ReflectionTestUtils.setField(initializer, "enabled", true);
        ReflectionTestUtils.setField(
                initializer,
                "datePriseEffet",
                LocalDate.of(2026, 9, 16)
        );

        Parking parkingSansProfil = new Parking();
        parkingSansProfil.setId(4L);
        parkingSansProfil.setCode("PLACE_ITALIE");

        when(parkingRepository.findAllByStatutOrderByNomAsc(StatutParking.ACTIF))
                .thenReturn(List.of(parkingSansProfil));
        when(forfaitRepository.findByCodeIgnoreCase(anyString()))
                .thenReturn(Optional.empty());

        AtomicLong sequenceForfait = new AtomicLong(1L);
        when(forfaitRepository.save(any(Forfait.class))).thenAnswer(invocation -> {
            Forfait forfait = invocation.getArgument(0);
            forfait.setId(sequenceForfait.getAndIncrement());
            return forfait;
        });

        when(tarifParkingRepository.trouverTarifsApplicables(any(), any()))
                .thenReturn(List.of());
        when(tarifParkingRepository
                .findByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
                        any(), any(), any(), any()
                ))
                .thenReturn(Optional.empty());

        initializer.run(mock(ApplicationArguments.class));

        var captor = org.mockito.ArgumentCaptor.forClass(TarifParking.class);
        verify(tarifParkingRepository, times(28)).save(captor.capture());

        TarifParking nuitTroisMois = captor.getAllValues().stream()
                .filter(tarif -> tarif.getForfait().getCode().equals("NUIT_5J_20H_08H"))
                .filter(tarif -> tarif.getDureeEnMois() == 3)
                .findFirst()
                .orElseThrow();

        assertThat(nuitTroisMois.getParking()).isSameAs(parkingSansProfil);
        assertThat(nuitTroisMois.getPrixHT())
                .isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(nuitTroisMois.calculerMontantTotalTTC())
                .isEqualByComparingTo(new BigDecimal("900.00"));
    }
}
