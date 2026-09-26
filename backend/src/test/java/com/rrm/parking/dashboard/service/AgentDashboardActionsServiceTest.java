package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.dto.response.CarteAgentResponse;
import com.rrm.parking.carte.dto.response.DemandeOperationnelleResponse;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.service.OperationCarteService;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentDashboardActionsServiceTest {
    @Mock AffectationAgentParkingRepository affectations;
    @Mock DemandeClientRepository demandes;
    @Mock OperationCarteService operations;
    @Mock AgentParkingRegistreService registre;
    private AgentDashboardActionsService service;

    @BeforeEach
    void initialiser() {
        service = new AgentDashboardActionsService(affectations, demandes, operations, registre);
    }

    private void affecter(Long agentId, Long parkingId) {
        Parking parking = new Parking();
        parking.setId(parkingId);
        AffectationAgentParking affectation = new AffectationAgentParking();
        affectation.setParking(parking);
        affectation.setActive(true);
        affectation.setDateDebut(LocalDate.now(ZoneId.of("Africa/Casablanca")).minusDays(1));
        when(affectations.findByUtilisateurIdAndActiveTrue(agentId))
                .thenReturn(Optional.of(affectation));
    }

    @Test
    void lesActionsEtAlertesSuiventLeParkingEtExcluentLesRemisesAbsentesDuServiceCarte() {
        affecter(31L, 8L);
        when(demandes.prochainesNouvellesDemandes(eq(8L),
                eq(StatutDemande.EN_ATTENTE_PAIEMENT), any(Pageable.class)))
                .thenReturn(List.of());
        when(demandes.prochainsRenouvellements(eq(8L),
                eq(StatutDemande.EN_ATTENTE_PAIEMENT), any(Pageable.class)))
                .thenReturn(List.of());
        when(operations.listerImpressions(31L)).thenReturn(List.of(new DemandeOperationnelleResponse(
                92L, "IMP-92", TypeOperationCarte.IMPRESSION,
                StatutDemandeOperationnelle.CREEE,
                LocalDateTime.now(ZoneId.of("Africa/Casablanca")).minusHours(30), null,
                22L, "CARTE-22", null, StatutCarteAcces.A_IMPRIMER, "ABO-22",
                15L, "DEM-15", "Client", "A123", null, null, "Bab Chellah", null, null)));
        when(operations.listerRemises(31L)).thenReturn(List.of());
        when(demandes.countNouvellesEnRetard(eq(8L), eq(StatutDemande.EN_ATTENTE_PAIEMENT), any()))
                .thenReturn(2L);
        var resultat = service.actions(31L);
        assertThat(resultat.alertesRetard()).isEqualTo(3);
        assertThat(resultat.actions()).hasSize(1);
        assertThat(resultat.actions().getFirst().lien())
                .isEqualTo("/agent/impressions-cartes?operationId=92");
        verify(demandes).prochainesNouvellesDemandes(eq(8L),
                eq(StatutDemande.EN_ATTENTE_PAIEMENT), any(Pageable.class));
        verify(operations).listerRemises(31L);
    }

    @Test
    void rechercheDemandesGlobalesEtCartesLimiteesAuParkingParRegistre() {
        affecter(31L, 8L);
        when(demandes.rechercherIdsReguliers("%a123%"))
                .thenReturn(List.of());
        when(registre.cartes(31L, "A123", null, null))
                .thenReturn(List.of(new CarteAgentResponse(
                        22L, "CARTE-22", "A123", StatutCarteAcces.ACTIVE,
                        "ABO-22", "Client", null, "REGULIER", 8L,
                        "Bab Chellah", LocalDateTime.now())));
        var resultat = service.rechercher(31L, "A123");
        assertThat(resultat.resultats()).hasSize(1);
        assertThat(resultat.resultats().getFirst().lien())
                .isEqualTo("/agent/cartes?recherche=A123");
        verify(registre).cartes(31L, "A123", null, null);
    }
}
