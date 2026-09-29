package com.rrm.parking.parking.service;

import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ParkingPublicServiceTest {
    @Test
    void neRetablitPasLaGrilleParDefautApresRetraitDuDernierForfait() {
        TarifParkingRepository tarifs = mock(TarifParkingRepository.class);
        ParkingRepository parkings = mock(ParkingRepository.class);
        ParkingPublicService service = new ParkingPublicService(tarifs, parkings,
                mock(AffectationParkingRepository.class),
                mock(DemandeNouveauContratCorporateRepository.class));
        Parking parking = new Parking();
        parking.setId(8L);
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(tarifs.existsByParkingId(8L)).thenReturn(true);

        assertEquals(List.of(), service.listerTarifsApplicables(8L));
        verify(parkings, never()).findByCodeIgnoreCase(anyString());
    }

    @Test
    void neProposePasLesForfaitsCorporateDansLaSouscriptionParticuliere() {
        TarifParkingRepository tarifs = mock(TarifParkingRepository.class);
        ParkingRepository parkings = mock(ParkingRepository.class);
        ParkingPublicService service = new ParkingPublicService(tarifs, parkings,
                mock(AffectationParkingRepository.class),
                mock(DemandeNouveauContratCorporateRepository.class));
        Parking parking = new Parking();
        parking.setId(8L);
        Forfait corporate = new Forfait();
        corporate.setCategorie("CORPORATE");
        TarifParking tarif = new TarifParking();
        tarif.setForfait(corporate);
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(tarifs.trouverTarifsApplicables(org.mockito.ArgumentMatchers.eq(8L),
                org.mockito.ArgumentMatchers.any(java.time.LocalDate.class))).thenReturn(List.of(tarif));

        assertEquals(List.of(), service.listerTarifsApplicables(8L));
    }
}
