package com.rrm.parking.parking.controller;

import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.entity.ParkingPv;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.service.CreationParkingService;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.parking.repository.ParkingPvRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.tarification.service.GestionTarifsParkingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mock.web.MockMultipartFile;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminParkingControllerTest {

    @Mock private ParkingRepository parkings;
    @Mock private AuditLogRepository audit;
    @Mock private TarifParkingRepository tarifs;
    @Mock private GestionTarifsParkingService gestionTarifs;
    @Mock private CreationParkingService creationParking;
    @Mock private AffectationAgentParkingRepository affectations;
    @Mock private ParkingPvRepository pvRepository;
    @Mock private UtilisateurRepository utilisateurs;

    private AdminParkingController controller;

    @BeforeEach
    void initialiser() {
        controller = new AdminParkingController(parkings, audit, tarifs, gestionTarifs, creationParking, affectations, pvRepository, utilisateurs);
    }

    @Test
    void neRemplacePasLesTarifsAbsentsParUneGrilleFictive() {
        when(parkings.existsById(8L)).thenReturn(true);
        when(tarifs.trouverTarifsApplicables(eq(8L), any(LocalDate.class)))
                .thenReturn(List.of());

        assertEquals(List.of(), controller.tarifsApplicables(8L));
        verify(tarifs).trouverTarifsApplicables(eq(8L), any(LocalDate.class));
    }

    @Test
    void refuseUnParkingInexistant() {
        ResponseStatusException erreur = assertThrows(ResponseStatusException.class,
                () -> controller.tarifsApplicables(999L));
        assertEquals(HttpStatus.NOT_FOUND, erreur.getStatusCode());
    }

    @Test
    void modificationEnregistreReellementLesQuotasEtCaracteristiques() {
        Parking parking = parking();
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(parkings.save(any(Parking.class))).thenAnswer(i -> i.getArgument(0));
        when(affectations.findAllByParkingIdAndActiveTrue(8L)).thenReturn(List.of());
        when(pvRepository.findFirstByParkingIdOrderByDateDepotDescIdDesc(8L)).thenReturn(Optional.empty());
        var requete = new AdminParkingController.MajParkingRequest(
                "Parking modifié", "Nouvelle adresse", 101, null, 34.1, -6.8,
                "Décision officielle", "Agdal", 40, 60, 25, 75,
                "Surface", 3, "06:00 - 23:00", List.of("RFID"), null, null);

        controller.modifier(8L, requete, null);

        assertEquals(61, parking.getCapaciteReserveeAbonnements());
        assertEquals(15, parking.getQuotaCorporate());
        assertEquals("Agdal", parking.getZone());
        assertEquals("RFID", parking.getEquipements());
    }

    @Test
    void verrouillageConserveLeMotifEtDeverrouillageLeRetire() {
        Parking parking = parking();
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        controller.toggleVerrouillage(8L, Map.of("lock", true, "reason", "Travaux"), null);
        assertEquals(StatutParking.SUSPENDU, parking.getStatut());
        assertEquals("Travaux", parking.getMotifMaintenance());

        controller.toggleVerrouillage(8L, Map.of("lock", false), null);
        assertEquals(StatutParking.ACTIF, parking.getStatut());
        assertEquals(null, parking.getMotifMaintenance());
    }

    @Test
    void desactivationArchiveSansEffacerLeParking() {
        Parking parking = parking();
        when(parkings.findById(8L)).thenReturn(Optional.of(parking));
        when(affectations.findAllByParkingIdAndActiveTrue(8L)).thenReturn(List.of());
        controller.desactiver(8L, Map.of("reason", "Fermeture"), null);
        assertEquals(StatutParking.ARCHIVE, parking.getStatut());
        assertEquals("Fermeture", parking.getMotifDesactivation());
        assertTrue(parking.getDateArchivage() != null);
    }

    @Test
    void depotDuPvEnregistreLeFichierReel() throws Exception {
        when(parkings.findById(8L)).thenReturn(Optional.of(parking()));
        MockMultipartFile fichier = new MockMultipartFile("file", "pv.pdf",
                "application/pdf", "%PDF-document".getBytes());

        controller.deposerPv(8L, fichier);

        ArgumentCaptor<ParkingPv> depot = ArgumentCaptor.forClass(ParkingPv.class);
        verify(pvRepository).save(depot.capture());
        assertEquals("pv.pdf", depot.getValue().getNomFichier());
        assertEquals("%PDF-document", new String(depot.getValue().getContenu()));
    }

    private Parking parking() {
        Parking parking = new Parking();
        parking.setId(8L);
        parking.setNom("Parking test");
        parking.setCode("TEST");
        parking.setAdresse("Rabat");
        parking.setCapaciteTotale(100);
        parking.setCapaciteReserveeAbonnements(50);
        return parking;
    }
}
