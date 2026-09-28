package com.rrm.parking.client.service;

import com.rrm.parking.abonnement.repository.AbonnementEntrepriseRepository;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.enums.StatutClient;
import com.rrm.parking.client.repository.ClientEntrepriseRepository;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.contrat.repository.ContratCorporateRepository;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BaseClientsResponsableServiceTest {
    private final ClientParticulierRepository particuliers = mock(ClientParticulierRepository.class);
    private final ClientEntrepriseRepository entreprises = mock(ClientEntrepriseRepository.class);
    private final BaseClientsResponsableService service = new BaseClientsResponsableService(
            particuliers, entreprises, mock(VehiculeRepository.class),
            mock(AbonnementRegulierRepository.class), mock(AbonnementEntrepriseRepository.class),
            mock(ContratCorporateRepository.class), mock(DemandeClientRepository.class));

    @Test
    void filtreEtPagineLesParticuliersDepuisLeDepot() {
        ClientParticulier client = mock(ClientParticulier.class);
        when(client.getId()).thenReturn(42L);
        when(client.getNomComplet()).thenReturn("Nadia Alaoui");
        when(client.getCin()).thenReturn("AB123");
        when(client.getStatut()).thenReturn(StatutClient.ACTIF);
        when(client.getDateCreation()).thenReturn(LocalDateTime.of(2026, 9, 1, 10, 0));
        when(particuliers.rechercherPourBaseClients(
                eq("%nadia%"), eq(StatutClient.ACTIF),
                eq(LocalDateTime.of(2026, 9, 1, 0, 0)),
                eq(LocalDateTime.of(2026, 10, 1, 0, 0)), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(client)));

        var resultat = service.particuliers(" Nadia ", StatutClient.ACTIF,
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), 0, 12);

        assertThat(resultat.content()).hasSize(1);
        assertThat(resultat.content().getFirst().nomComplet()).isEqualTo("Nadia Alaoui");
        assertThat(resultat.totalElements()).isEqualTo(1);
        verify(particuliers).rechercherPourBaseClients(eq("%nadia%"),
                eq(StatutClient.ACTIF), any(), any(), any(Pageable.class));
    }

    @Test
    void refuseUnePlageDeDatesInversee() {
        assertThatThrownBy(() -> service.particuliers(null, null,
                LocalDate.of(2026, 10, 1), LocalDate.of(2026, 9, 1), 0, 12))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(erreur -> assertThat(((ResponseStatusException) erreur).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void neFabriquePasDeFichePourUnClientAbsent() {
        when(particuliers.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.particulier(404L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(erreur -> assertThat(((ResponseStatusException) erreur).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }
}
