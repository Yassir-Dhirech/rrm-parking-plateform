package com.rrm.parking.carte.corporate;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EcheanceCarteCorporateServiceTest {
    @Mock CarteAccesRepository cartes;
    @Mock EcheanceCarteCorporateRepository echeances;
    @Mock DemandeOperationnelleRepository operations;
    @Mock DemandeNouveauContratCorporateRepository demandes;
    @Mock UtilisateurRepository utilisateurs;
    EcheanceCarteCorporateService service;

    @BeforeEach
    void preparer() {
        service = new EcheanceCarteCorporateService(cartes, echeances, operations, demandes, utilisateurs);
    }

    private CarteAcces carte(LocalDateTime activation) {
        CarteAcces carte = mock(CarteAcces.class);
        AbonnementEntreprise abonnement = mock(AbonnementEntreprise.class);
        when(carte.getDateActivation()).thenReturn(activation);
        when(carte.getStatut()).thenReturn(StatutCarteAcces.ACTIVE);
        when(carte.getAbonnement()).thenReturn(abonnement);
        when(abonnement.getStatut()).thenReturn(StatutAbonnement.ACTIF);
        return carte;
    }

    @Test
    void creeLeRappelJMoinsDeux() {
        CarteAcces carte = carte(LocalDateTime.of(2026, 9, 30, 10, 0));
        when(carte.getId()).thenReturn(12L);
        when(cartes.findByStatut(StatutCarteAcces.ACTIVE)).thenReturn(List.of(carte));
        when(echeances.findByCarteIdAndActivationReference(12L, carte.getDateActivation()))
                .thenReturn(Optional.empty());
        when(echeances.save(any(EcheanceCarteCorporate.class))).thenAnswer(i -> i.getArgument(0));

        service.enregistrerRappels(LocalDate.of(2028, 9, 28));

        verify(echeances).save(argThat(d -> d.getDateRappelAnticipe() != null
                && d.getDateEcheance().equals(LocalDate.of(2028, 9, 30))));
    }

    @Test
    void refuseUneDeuxiemeDemandePourLeMemeCycle() {
        CarteAcces carte = carte(LocalDateTime.of(2023, 9, 30, 10, 0));
        when(carte.getAbonnement().getId()).thenReturn(40L);
        EcheanceCarteCorporate cycle = new EcheanceCarteCorporate(carte);
        cycle.demander(mock(DemandeOperationnelle.class), mock(Utilisateur.class));
        when(cartes.findByIdForUpdate(12L)).thenReturn(Optional.of(carte));
        when(demandes.findByAbonnementGenereId(40L))
                .thenReturn(Optional.of(mock(DemandeNouveauContratCorporate.class)));
        when(echeances.findByCarteIdAndActivationReference(12L, carte.getDateActivation()))
                .thenReturn(Optional.of(cycle));

        assertThrows(ConflitMetierException.class, () -> service.genererDemande(12L, 5L));
        verifyNoInteractions(operations, utilisateurs);
    }
}
