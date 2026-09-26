package com.rrm.parking.carte.service;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.vehicule.entity.Vehicule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OperationCarteServiceAgentParkingTest {

    @Mock DemandeOperationnelleRepository operationRepository;
    @Mock DemandeClientRepository demandeRepository;
    @Mock CarteAccesRepository carteRepository;
    @Mock FactureRepository factureRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock AffectationAgentParkingRepository affectationAgentRepository;
    @Mock ApplicationEventPublisher eventPublisher;
    @InjectMocks OperationCarteService service;

    private void agentAffecteABabElHad() {
        AffectationAgentParking affectation = mock(AffectationAgentParking.class);
        Parking parking = mock(Parking.class);
        when(parking.getId()).thenReturn(9L);
        when(affectation.getParking()).thenReturn(parking);
        when(affectation.getDateDebut()).thenReturn(LocalDate.now().minusDays(2));
        when(affectationAgentRepository.findByUtilisateurIdAndActiveTrue(5L))
                .thenReturn(Optional.of(affectation));
    }

    private DemandeOperationnelle operationReguliere(
            TypeOperationCarte type, Long parkingId
    ) {
        DemandeOperationnelle operation = mock(DemandeOperationnelle.class);
        CarteAcces carte = mock(CarteAcces.class);
        AbonnementRegulier abonnement = mock(AbonnementRegulier.class);
        AffectationParking affectation = mock(AffectationParking.class);
        Parking parking = mock(Parking.class);
        when(operation.getCarteAcces()).thenReturn(carte);
        when(carte.getAbonnement()).thenReturn(abonnement);
        when(operation.getTypeOperation()).thenReturn(type);
        when(abonnement.obtenirAffectationActive(
                org.mockito.ArgumentMatchers.any(LocalDate.class)))
                .thenReturn(Optional.of(affectation));
        when(affectation.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(parkingId);
        return operation;
    }

    @Test
    void remisePourAutreParkingResteInvisibleEtImpossibleAConfirmer() {
        agentAffecteABabElHad();
        DemandeOperationnelle autre = operationReguliere(
                TypeOperationCarte.REMISE, 8L);
        when(operationRepository.findByTypeOperationAndStatutInOrderByDateCreationAsc(
                eq(TypeOperationCarte.REMISE), anyList()))
                .thenReturn(List.of(autre));
        when(operationRepository.findById(42L)).thenReturn(Optional.of(autre));

        assertThat(service.listerRemises(5L)).isEmpty();
        assertThatThrownBy(() -> service.terminerRemise(42L, 5L))
                .isInstanceOf(ConflitMetierException.class)
                .hasMessageContaining("parking affecté");
        verifyNoInteractions(utilisateurRepository);
    }

    @Test
    void impressionDUnAutreParkingResteInvisible() {
        agentAffecteABabElHad();
        DemandeOperationnelle autre = operationReguliere(
                TypeOperationCarte.IMPRESSION, 8L);
        when(operationRepository.findByTypeOperationAndStatutInOrderByDateCreationAsc(
                eq(TypeOperationCarte.IMPRESSION), anyList()))
                .thenReturn(List.of(autre));
        assertThat(service.listerImpressions(5L)).isEmpty();
    }

    @Test
    void impressionDUnAutreParkingNePeutPasEtreDeclareeTerminee() {
        agentAffecteABabElHad();
        DemandeOperationnelle autre = operationReguliere(
                TypeOperationCarte.IMPRESSION, 8L);
        when(operationRepository.findById(44L)).thenReturn(Optional.of(autre));

        assertThatThrownBy(() -> service.terminerImpression(44L, 5L, "CARTE-44"))
                .isInstanceOf(ConflitMetierException.class);
        verifyNoInteractions(utilisateurRepository);
    }

    @Test
    void impressionDuParkingAffecteEstVisible() {
        agentAffecteABabElHad();
        DemandeOperationnelle impression = operationReguliere(
                TypeOperationCarte.IMPRESSION, 9L);
        DemandeNouvelAbonnementRegulier demande =
                mock(DemandeNouvelAbonnementRegulier.class);
        ClientParticulier client = mock(ClientParticulier.class);
        Vehicule vehicule = mock(Vehicule.class);
        TarifParking tarif = mock(TarifParking.class);
        Parking parking = mock(Parking.class);
        when(impression.getDemandeClientSource()).thenReturn(demande);
        when(demande.getClient()).thenReturn(client);
        when(demande.getId()).thenReturn(37L);
        when(demande.getReference()).thenReturn("DEM-BAB-37");
        when(demande.getTarifParking()).thenReturn(tarif);
        when(tarif.getParking()).thenReturn(parking);
        when(parking.getNom()).thenReturn("Bab El Had");
        when(demande.getVehicule()).thenReturn(vehicule);
        when(impression.getCarteAcces().getAbonnement().getId()).thenReturn(17L);
        when(demandeRepository.findByAbonnementGenereId(17L))
                .thenReturn(Optional.of(demande));
        when(factureRepository.findByPaiementDemandeId(37L))
                .thenReturn(Optional.empty());
        when(operationRepository.findByTypeOperationAndStatutInOrderByDateCreationAsc(
                eq(TypeOperationCarte.IMPRESSION), anyList()))
                .thenReturn(List.of(impression));

        assertThat(service.listerImpressions(5L))
                .singleElement()
                .satisfies(reponse -> {
                    assertThat(reponse.referenceDemandeClient()).isEqualTo("DEM-BAB-37");
                    assertThat(reponse.parkingNom()).isEqualTo("Bab El Had");
                });
    }

    @Test
    void remiseCorporateResteAuSiegeMemeDansLeParkingDeLAgent() {
        agentAffecteABabElHad();
        DemandeOperationnelle corporate = mock(DemandeOperationnelle.class);
        CarteAcces carte = mock(CarteAcces.class);
        when(corporate.getCarteAcces()).thenReturn(carte);
        when(corporate.getTypeOperation()).thenReturn(TypeOperationCarte.REMISE);
        when(carte.getAbonnement()).thenReturn(mock(AbonnementEntreprise.class));
        when(operationRepository.findByTypeOperationAndStatutInOrderByDateCreationAsc(
                eq(TypeOperationCarte.REMISE), anyList()))
                .thenReturn(List.of(corporate));
        when(operationRepository.findById(43L)).thenReturn(Optional.of(corporate));

        assertThat(service.listerRemises(5L)).isEmpty();
        assertThatThrownBy(() -> service.terminerRemise(43L, 5L))
                .isInstanceOf(ConflitMetierException.class);
        verifyNoInteractions(utilisateurRepository);
    }

    @Test
    void aucuneAffectationActiveInterditLaListeEtLActions() {
        when(affectationAgentRepository.findByUtilisateurIdAndActiveTrue(5L))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.listerImpressions(5L))
                .isInstanceOf(ConflitMetierException.class)
                .hasMessageContaining("affectation active");
    }
}
