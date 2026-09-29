package com.rrm.parking.client.service;

import com.rrm.parking.client.repository.ClientEntrepriseRepository;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BaseClientsSuperviseurServiceTest {
    @Mock AffectationAgentParkingRepository affectations;
    @Mock ClientParticulierRepository particuliers;
    @Mock ClientEntrepriseRepository entreprises;
    @Mock DemandeClientRepository demandes;
    @Mock BaseClientsResponsableService baseGlobale;
    @InjectMocks BaseClientsSuperviseurService service;

    @Test
    void sansParkingAffecteLesListesSontVidesEtLesFichesInaccessibles() {
        when(affectations.findAllByUtilisateurIdAndActiveTrue(4L)).thenReturn(List.of());

        assertThat(service.particuliers(4L, null, null, null, null, 0, 12).content()).isEmpty();
        assertThat(service.entreprises(4L, null, null, null, null, 0, 12).content()).isEmpty();
        assertThatThrownBy(() -> service.particulier(4L, 50L))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.entreprise(4L, 60L))
                .isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(particuliers, entreprises, baseGlobale);
    }

    @Test
    void laRechercheEstLimiteeAuxParkingsActuellementAffectes() {
        LocalDate maintenant = LocalDate.now(ZoneId.of("Africa/Casablanca"));
        AffectationAgentParking active = mock(AffectationAgentParking.class);
        AffectationAgentParking terminee = mock(AffectationAgentParking.class);
        Parking parking = mock(Parking.class);
        when(active.getDateDebut()).thenReturn(maintenant.minusDays(2));
        when(active.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(8L);
        when(terminee.getDateDebut()).thenReturn(maintenant.minusDays(10));
        when(terminee.getDateFin()).thenReturn(maintenant.minusDays(1));
        when(affectations.findAllByUtilisateurIdAndActiveTrue(4L))
                .thenReturn(List.of(active, terminee));
        when(particuliers.rechercherPourSuperviseur(eq("%kamal%"), isNull(), isNull(),
                isNull(), eq(Set.of(8L)), any(PageRequest.class)))
                .thenReturn(Page.empty());

        assertThat(service.particuliers(4L, "Kamal", null, null, null, 0, 12).totalElements())
                .isZero();
        verify(particuliers).rechercherPourSuperviseur(eq("%kamal%"), isNull(), isNull(),
                isNull(), eq(Set.of(8L)), any(PageRequest.class));
    }

    @Test
    void uneFicheHorsPerimetreEstRefuseeAvantSonChargementGlobal() {
        LocalDate maintenant = LocalDate.now(ZoneId.of("Africa/Casablanca"));
        AffectationAgentParking affectation = mock(AffectationAgentParking.class);
        Parking parking = mock(Parking.class);
        when(affectation.getDateDebut()).thenReturn(maintenant.minusDays(2));
        when(affectation.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(8L);
        when(affectations.findAllByUtilisateurIdAndActiveTrue(4L))
                .thenReturn(List.of(affectation));
        when(particuliers.compterClientPourParkings(99L, Set.of(8L))).thenReturn(0L);

        assertThatThrownBy(() -> service.particulier(4L, 99L))
                .isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(baseGlobale);
    }
}
