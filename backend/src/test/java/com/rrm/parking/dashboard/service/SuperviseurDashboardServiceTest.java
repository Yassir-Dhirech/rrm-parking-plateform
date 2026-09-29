package com.rrm.parking.dashboard.service;

import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.recette.entity.Recette;
import com.rrm.parking.recette.entity.StatutRecette;
import com.rrm.parking.recette.repository.RecetteRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuperviseurDashboardServiceTest {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    @Mock AffectationAgentParkingRepository affectations;
    @Mock AffectationParkingRepository affectationsAbonnement;
    @Mock DemandeClientRepository demandes;
    @Mock DemandeNouveauContratCorporateRepository corporate;
    @Mock DemandeOperationnelleRepository operations;
    @Mock RecetteRepository recettes;

    private SuperviseurDashboardService service;

    @BeforeEach
    void initialiser() {
        service = new SuperviseurDashboardService(affectations, affectationsAbonnement,
                demandes, corporate, operations, recettes);
    }

    @Test
    void neExposeAucunParkingNiArreteSansAffectation() {
        var debut = LocalDate.now(ZONE_RRM).minusDays(6);
        var fin = LocalDate.now(ZONE_RRM);
        Parking autreParking = new Parking();
        autreParking.setId(99L);
        Recette recette = mock(Recette.class);
        when(recette.getParking()).thenReturn(autreParking);
        when(affectations.findAllByUtilisateurIdAndActiveTrue(4L)).thenReturn(List.of());
        when(recettes.findBySuperviseurIdAndDateArretBetweenOrderByDateArretDesc(4L, debut, fin))
                .thenReturn(List.of(recette));

        var resultat = service.charger(4L, debut, fin);

        assertThat(resultat.parkingsAffectes()).isZero();
        assertThat(resultat.arretesEffectues()).isZero();
        assertThat(resultat.parkings()).isEmpty();
        assertThat(resultat.arretes()).isEmpty();
    }

    @Test
    void neComptePasLesBrouillonsCommeArretesEffectues() {
        var debut = LocalDate.now(ZONE_RRM).minusDays(6);
        var fin = LocalDate.now(ZONE_RRM);
        Parking parking = new Parking();
        parking.setId(8L);
        parking.setNom("Bab Chellah");
        parking.setCode("BAB_CHELLAH");
        parking.setCapaciteReserveeAbonnements(100);
        AffectationAgentParking affectation = new AffectationAgentParking();
        affectation.setParking(parking);
        affectation.setActive(true);
        affectation.setDateDebut(debut.minusDays(10));
        Recette brouillon = mock(Recette.class);
        when(brouillon.getParking()).thenReturn(parking);
        when(brouillon.getStatut()).thenReturn(StatutRecette.BROUILLON);
        when(affectations.findAllByUtilisateurIdAndActiveTrue(4L)).thenReturn(List.of(affectation));
        when(recettes.findBySuperviseurIdAndDateArretBetweenOrderByDateArretDesc(4L, debut, fin))
                .thenReturn(List.of(brouillon));
        when(operations.findOuvertesParParking(any(), any(), eq(8L), any())).thenReturn(List.of());

        var resultat = service.charger(4L, debut, fin);

        assertThat(resultat.parkingsAffectes()).isEqualTo(1);
        assertThat(resultat.arretesEffectues()).isZero();
        assertThat(resultat.parkings()).extracting(p -> p.nom()).containsExactly("Bab Chellah");
    }

    @Test
    void refuseUnePeriodeInversee() {
        assertThatThrownBy(() -> service.charger(4L, LocalDate.now(ZONE_RRM), LocalDate.now(ZONE_RRM).minusDays(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
