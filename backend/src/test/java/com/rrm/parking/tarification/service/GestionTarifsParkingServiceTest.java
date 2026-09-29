package com.rrm.parking.tarification.service;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GestionTarifsParkingServiceTest {
    @Mock private ParkingRepository parkings;
    @Mock private TarifParkingRepository tarifs;
    @Mock private ForfaitRepository forfaits;
    private GestionTarifsParkingService service;

    @BeforeEach
    void initialiser() {
        service = new GestionTarifsParkingService(parkings, tarifs, forfaits);
    }

    @Test
    void retireUnForfaitSeulementDuParkingChoisiSansEffacerSonHistorique() {
        Parking parking = parking();
        Forfait forfait = forfait();
        TarifParking premier = tarif(parking, forfait, LocalDate.now(zone()).minusDays(10));
        TarifParking second = tarif(parking, forfait, LocalDate.now(zone()).minusDays(10));
        second.setId(18L);
        second.setDureeEnMois(6);
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(tarifs.trouverForfaitDuParkingPourRetrait(8L, 5L))
                .thenReturn(List.of(premier, second));

        service.retirerForfait(8L, 5L);

        assertEquals(false, premier.estApplicableA(LocalDate.now(zone())));
        assertEquals(false, second.estApplicableA(LocalDate.now(zone())));
        assertEquals(true, forfait.getActif());
        assertEquals(new BigDecimal("500.00"), premier.getPrixHT());
        verify(tarifs).saveAll(List.of(premier, second));
    }

    @Test
    void revisionClotureAncienTarifEtCreeNouvelleVersion() {
        Parking parking = parking();
        Forfait forfait = forfait();
        TarifParking ancien = tarif(parking, forfait, LocalDate.now(zone()).minusDays(10));
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(tarifs.findByIdPourMiseAJour(17L)).thenReturn(Optional.of(ancien));
        when(tarifs.save(any(TarifParking.class))).thenAnswer(invocation -> {
            TarifParking tarif = invocation.getArgument(0);
            if (tarif != ancien) tarif.setId(18L);
            return tarif;
        });

        var nouveau = service.reviser(8L, 17L, new BigDecimal("720.00"));

        assertEquals(LocalDate.now(zone()).minusDays(1), ancien.getDateFinValidite());
        assertEquals(18L, nouveau.tarifParkingId());
        assertEquals(new BigDecimal("600.00"), nouveau.prixMensuelHT());
        assertEquals(new BigDecimal("720.00"), nouveau.prixMensuelTTC());
        assertEquals(LocalDate.now(zone()), nouveau.dateDebutValidite());
    }

    @Test
    void refuseDeReviserUnTarifEntreEnVigueurAujourdhui() {
        Parking parking = parking();
        TarifParking ancien = tarif(parking, forfait(), LocalDate.now(zone()));
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(tarifs.findByIdPourMiseAJour(17L)).thenReturn(Optional.of(ancien));

        ResponseStatusException erreur = assertThrows(ResponseStatusException.class,
                () -> service.reviser(8L, 17L, new BigDecimal("720.00")));

        assertEquals(HttpStatus.CONFLICT, erreur.getStatusCode());
        verify(tarifs, never()).save(any());
    }

    @Test
    void creeUnForfaitEtSonTarifPourLeSeulParkingDemande() {
        Parking parking = parking();
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(forfaits.save(any(Forfait.class))).thenAnswer(invocation -> {
            Forfait forfait = invocation.getArgument(0);
            forfait.setId(30L);
            return forfait;
        });
        when(tarifs.save(any(TarifParking.class))).thenAnswer(invocation -> {
            TarifParking tarif = invocation.getArgument(0);
            tarif.setId(31L);
            return tarif;
        });

        var resultat = service.ajouterForfait(8L, "  Nuit spéciale  ",
                "Accès de nuit", false, 3, new BigDecimal("600.00"),
                new BigDecimal("20.00"));

        assertEquals(8L, resultat.parkingId());
        assertEquals("Nuit spéciale", resultat.forfaitLibelle());
        assertEquals(3, resultat.dureeEnMois());
        assertEquals(new BigDecimal("500.00"), resultat.prixMensuelHT());
        assertEquals(new BigDecimal("1800.00"), resultat.montantTotalTTC());
    }

    private ZoneId zone() { return ZoneId.of("Africa/Casablanca"); }

    private Parking parking() {
        Parking parking = new Parking();
        parking.setId(8L);
        parking.setCode("BAB_CHELLAH");
        return parking;
    }

    private Forfait forfait() {
        Forfait forfait = new Forfait();
        forfait.setId(5L);
        forfait.setCode("JOUR_7J");
        forfait.setLibelle("Jour 7j/7");
        forfait.setActif(true);
        forfait.setPlaceReservee(false);
        return forfait;
    }

    private TarifParking tarif(Parking parking, Forfait forfait, LocalDate debut) {
        TarifParking tarif = new TarifParking();
        tarif.setId(17L);
        tarif.setParking(parking);
        tarif.setForfait(forfait);
        tarif.setDureeEnMois(3);
        tarif.setPrixHT(new BigDecimal("500.00"));
        tarif.setTauxTVA(new BigDecimal("20.00"));
        tarif.setDateDebutValidite(debut);
        return tarif;
    }
}
