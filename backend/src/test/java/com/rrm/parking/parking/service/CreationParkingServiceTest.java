package com.rrm.parking.parking.service;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.security.entity.Role;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreationParkingServiceTest {
    @Mock ParkingRepository parkings;
    @Mock UtilisateurRepository utilisateurs;
    @Mock AffectationAgentParkingRepository affectations;
    @Mock ForfaitRepository forfaits;
    @Mock TarifParkingRepository tarifs;
    CreationParkingService service;

    @BeforeEach
    void preparer() {
        service = new CreationParkingService(parkings, utilisateurs, affectations, forfaits, tarifs);
    }

    @Test
    void creeParkingAffectationEtChaqueTarifAvecQuotasExactes() {
        Utilisateur agent = utilisateur(4L, CodeRole.AGENT_ADMINISTRATIF);
        Utilisateur superviseur = utilisateur(5L, CodeRole.SUPERVISEUR);
        when(utilisateurs.findById(4L)).thenReturn(Optional.of(agent));
        when(utilisateurs.findById(5L)).thenReturn(Optional.of(superviseur));
        when(parkings.save(any(Parking.class))).thenAnswer(i -> {
            Parking parking = i.getArgument(0);
            parking.setId(19L);
            return parking;
        });
        when(forfaits.save(any(Forfait.class))).thenAnswer(i -> i.getArgument(0));

        Parking resultat = service.creer(demande(List.of(
                plan("PARTICULIER"), plan("CORPORATE"))));

        assertEquals("NOUVEAU", resultat.getCode());
        assertEquals(51, resultat.getCapaciteReserveeAbonnements());
        assertEquals(31, resultat.getQuotaCorporate());
        assertEquals("RFID,LPR", resultat.getEquipements());
        ArgumentCaptor<AffectationAgentParking> affectation = ArgumentCaptor.forClass(AffectationAgentParking.class);
        verify(affectations, times(2)).save(affectation.capture());
        assertSame(resultat, affectation.getAllValues().get(0).getParking());
        assertSame(agent, affectation.getAllValues().get(0).getUtilisateur());
        assertSame(superviseur, affectation.getAllValues().get(1).getUtilisateur());
        ArgumentCaptor<TarifParking> tarifsCrees = ArgumentCaptor.forClass(TarifParking.class);
        verify(tarifs, times(2)).save(tarifsCrees.capture());
        assertEquals("PARTICULIER", tarifsCrees.getAllValues().get(0).getForfait().getCategorie());
        assertEquals("CORPORATE", tarifsCrees.getAllValues().get(1).getForfait().getCategorie());
        assertEquals(new BigDecimal("500.00"), tarifsCrees.getAllValues().get(0).calculerPrixTTC());
    }

    @Test
    void rejetteUnPlanInvalideAvantInsertion() {
        when(utilisateurs.findById(4L)).thenReturn(Optional.of(utilisateur(4L, CodeRole.AGENT_ADMINISTRATIF)));
        when(utilisateurs.findById(5L)).thenReturn(Optional.of(utilisateur(5L, CodeRole.SUPERVISEUR)));
        ResponseStatusException erreur = assertThrows(ResponseStatusException.class,
                () -> service.creer(demande(List.of(new CreationParkingService.PlanInitial(
                        "Offre", "INCONNUE", "24h / 7j", 1, new BigDecimal("500"))))));
        assertEquals(HttpStatus.BAD_REQUEST, erreur.getStatusCode());
        verify(parkings, never()).save(any());
    }

    @Test
    void refuseUnAgentDejaAffecte() {
        when(utilisateurs.findById(4L)).thenReturn(Optional.of(utilisateur(4L, CodeRole.AGENT_ADMINISTRATIF)));
        when(utilisateurs.findById(5L)).thenReturn(Optional.of(utilisateur(5L, CodeRole.SUPERVISEUR)));
        when(affectations.existsByUtilisateurIdAndActiveTrue(4L)).thenReturn(true);
        ResponseStatusException erreur = assertThrows(ResponseStatusException.class,
                () -> service.creer(demande(List.of(plan("PARTICULIER")))));
        assertEquals(HttpStatus.CONFLICT, erreur.getStatusCode());
        verify(parkings, never()).save(any());
    }

    private Utilisateur utilisateur(Long id, CodeRole code) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        Role role = new Role();
        role.setCode(code);
        utilisateur.ajouterRole(role);
        return utilisateur;
    }

    private CreationParkingService.PlanInitial plan(String categorie) {
        return new CreationParkingService.PlanInitial("Offre " + categorie,
                categorie, "24h / 7j", 1, new BigDecimal("500.00"));
    }

    private CreationParkingService.Demande demande(List<CreationParkingService.PlanInitial> plans) {
        return new CreationParkingService.Demande("nouveau", "Nouveau parking", "Rabat", "Agdal",
                101, 50, 50, 60, 40, 34.02088, -6.84165,
                "Souterrain", 2, "24h / 24", List.of("RFID", "LPR"), 4L, 5L, plans);
    }
}
