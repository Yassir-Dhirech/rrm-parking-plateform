package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.dashboard.dto.response.AgentDashboardKpiResponse;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentDashboardServiceTest {

    @Mock
    private AffectationAgentParkingRepository affectationRepository;
    @Mock
    private DemandeClientRepository demandeRepository;
    @Mock
    private PaiementRepository paiementRepository;
    @Mock
    private DemandeOperationnelleRepository operationRepository;

    private AgentDashboardService service;

    @BeforeEach
    void initialiser() {
        service = new AgentDashboardService(
                affectationRepository,
                demandeRepository,
                paiementRepository,
                operationRepository
        );
    }

    @Test
    void doitCalculerLesQuatreKpisDepuisLeParkingDeLAgent() {
        Long utilisateurId = 31L;
        Long parkingId = 8L;
        Parking parking = new Parking();
        parking.setId(parkingId);
        parking.setNom("Bab Chellah");

        AffectationAgentParking affectation = new AffectationAgentParking();
        affectation.setParking(parking);
        affectation.setActive(true);

        when(affectationRepository
                .findByUtilisateurIdAndActiveTrue(utilisateurId))
                .thenReturn(Optional.of(affectation));
        when(demandeRepository
                .countNouvellesDemandesRegulieresParParkingEtStatut(
                        parkingId,
                        StatutDemande.EN_ATTENTE_PAIEMENT
                )).thenReturn(3L);
        when(demandeRepository
                .countRenouvellementsParParkingEtStatut(
                        parkingId,
                        StatutDemande.EN_ATTENTE_PAIEMENT
                )).thenReturn(2L);
        when(paiementRepository.sumMontantConfirmeParUtilisateurEntre(
                eq(utilisateurId),
                eq(StatutPaiement.CONFIRME),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(new BigDecimal("1875.00"));
        when(paiementRepository.countConfirmesParUtilisateurEntre(
                eq(utilisateurId),
                eq(StatutPaiement.CONFIRME),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(4L);
        when(operationRepository.countOuvertesParTypeEtParking(
                eq(TypeOperationCarte.IMPRESSION),
                any(List.class),
                eq(parkingId),
                any(LocalDate.class)
        )).thenReturn(6L);
        when(operationRepository.countOuvertesParTypeEtParking(
                eq(TypeOperationCarte.REMISE),
                any(List.class),
                eq(parkingId),
                any(LocalDate.class)
        )).thenReturn(1L);

        AgentDashboardKpiResponse resultat = service.chargerKpis(utilisateurId);

        assertThat(resultat.parkingId()).isEqualTo(parkingId);
        assertThat(resultat.parkingNom()).isEqualTo("Bab Chellah");
        assertThat(resultat.demandesAEncaisser()).isEqualTo(5L);
        assertThat(resultat.encaissementsJourTtc())
                .isEqualByComparingTo("1875.00");
        assertThat(resultat.nombreEncaissementsJour()).isEqualTo(4L);
        assertThat(resultat.cartesAImprimer()).isEqualTo(6L);
        assertThat(resultat.cartesARemettre()).isEqualTo(1L);
    }
}
