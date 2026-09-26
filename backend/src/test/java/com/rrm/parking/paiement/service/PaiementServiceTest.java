package com.rrm.parking.paiement.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.facturation.repository.RecuRepository;
import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.paiement.dto.response.EnregistrementPaiementResponse;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutCheque;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.event.PaiementConfirmeEvent;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.TarifParking;
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
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaiementServiceTest {

    @Mock
    private PaiementRepository paiementRepository;

    @Mock
    private DemandeClientRepository demandeClientRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private AffectationAgentParkingRepository affectationAgentParkingRepository;

    @Mock
    private RecuRepository recuRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private Recu recuEnregistre;

    @Mock
    private DemandeNouvelAbonnementRegulier demande;

    @Mock
    private DemandeRenouvellementRegulier demandeRenouvellement;

    @Mock
    private TarifParking tarifParking;

    @Mock
    private Utilisateur agent;

    @Mock
    private AffectationAgentParking affectationAgent;

    @Mock
    private Parking parking;

    private PaiementService paiementService;

    @BeforeEach
    void initialiser() {
        paiementService = new PaiementService(
                paiementRepository,
                demandeClientRepository,
                utilisateurRepository,
                affectationAgentParkingRepository,
                recuRepository,
                eventPublisher
        );
    }

    @Test
    void doitEnregistrerEtConfirmerUnPaiementEspece() {
        preparerDemande(ModePaiement.ESPECE);

        EnregistrementPaiementResponse response =
                paiementService.enregistrer(
                        10L,
                        new EnregistrementPaiementRequest(
                                null,
                                null,
                                null
                        ),
                        5L
                );

        ArgumentCaptor<Paiement> captor =
                ArgumentCaptor.forClass(Paiement.class);

        verify(paiementRepository).save(captor.capture());
        verify(demande).marquerPayee(agent);

        ArgumentCaptor<Recu> recuCaptor =
                ArgumentCaptor.forClass(Recu.class);
        verify(recuRepository).save(recuCaptor.capture());
        verify(eventPublisher).publishEvent(
                new PaiementConfirmeEvent(99L)
        );

        Paiement paiement = captor.getValue();

        assertEquals(ModePaiement.ESPECE, paiement.getModePaiement());
        assertEquals(StatutPaiement.CONFIRME, paiement.getStatut());
        assertEquals(new BigDecimal("1250.00"), paiement.getMontant());
        assertEquals(new BigDecimal("1250.00"), response.montant());
        assertEquals(StatutDemande.PAYEE, response.statutDemande());
        assertEquals(paiement, recuCaptor.getValue().getPaiement());
        assertEquals(99L, response.recuId());
        assertEquals("REC-20260916-TEST", response.numeroRecu());
    }

    @Test
    void doitConsidererLeChequeEncaisseDesSaReception() {
        preparerDemande(ModePaiement.CHEQUE);

        paiementService.enregistrer(
                10L,
                new EnregistrementPaiementRequest(
                        "CHQ-2026-001",
                        "Banque de test",
                        LocalDate.of(2026, 9, 15)
                ),
                5L
        );

        ArgumentCaptor<Paiement> captor =
                ArgumentCaptor.forClass(Paiement.class);

        verify(paiementRepository).save(captor.capture());

        Paiement paiement = captor.getValue();

        assertEquals(ModePaiement.CHEQUE, paiement.getModePaiement());
        assertEquals(StatutPaiement.CONFIRME, paiement.getStatut());
        assertEquals(StatutCheque.ENCAISSE, paiement.getStatutCheque());
    }

    @Test
    void doitEnregistrerUnRenouvellementSansFraisDeCarte() {
        when(demandeClientRepository.findByIdPourMiseAJour(20L))
                .thenReturn(Optional.of(demandeRenouvellement));
        when(demandeRenouvellement.getStatut())
                .thenReturn(
                        StatutDemande.EN_ATTENTE_PAIEMENT,
                        StatutDemande.PAYEE
                );
        when(demandeRenouvellement.getModePaiementSouhaite())
                .thenReturn(ModePaiement.ESPECE);
        when(demandeRenouvellement.getTarifParking())
                .thenReturn(tarifParking);
        when(tarifParking.calculerMontantTotalTTC())
                .thenReturn(new BigDecimal("1500.00"));
        preparerAffectationValide(5L);
        when(paiementRepository.existsByDemandeIdAndStatut(
                20L,
                StatutPaiement.CONFIRME
        )).thenReturn(false);
        when(utilisateurRepository.findById(5L))
                .thenReturn(Optional.of(agent));
        when(paiementRepository.existsByReference(anyString()))
                .thenReturn(false);
        when(paiementRepository.save(any(Paiement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(recuRepository.existsByNumero(anyString()))
                .thenReturn(false);
        when(recuRepository.save(any(Recu.class)))
                .thenReturn(recuEnregistre);
        when(recuEnregistre.getId()).thenReturn(99L);
        when(recuEnregistre.getNumero())
                .thenReturn("REC-20260921-TEST");
        when(demandeRenouvellement.getId()).thenReturn(20L);
        when(demandeRenouvellement.getReference())
                .thenReturn("DEM-REN-20260921-TEST");

        EnregistrementPaiementResponse response =
                paiementService.enregistrer(
                        20L,
                        new EnregistrementPaiementRequest(null, null, null),
                        5L
                );

        ArgumentCaptor<Paiement> captor =
                ArgumentCaptor.forClass(Paiement.class);
        verify(paiementRepository).save(captor.capture());
        verify(demandeRenouvellement).marquerPayee(agent);

        assertEquals(new BigDecimal("1500.00"), captor.getValue().getMontant());
        assertEquals(new BigDecimal("1500.00"), response.montant());
        assertEquals(StatutDemande.PAYEE, response.statutDemande());
    }

    @Test
    void doitRefuserUnSecondPaiementConfirme() {
        when(demandeClientRepository.findByIdPourMiseAJour(10L))
                .thenReturn(Optional.of(demande));
        when(demande.getStatut())
                .thenReturn(StatutDemande.EN_ATTENTE_PAIEMENT);
        when(paiementRepository.existsByDemandeIdAndStatut(
                10L,
                StatutPaiement.CONFIRME
        )).thenReturn(true);

        assertThrows(
                ConflitMetierException.class,
                () -> paiementService.enregistrer(
                        10L,
                        new EnregistrementPaiementRequest(
                                null,
                                null,
                                null
                        ),
                        5L
                )
        );

        verify(paiementRepository, never()).save(any());
        verify(utilisateurRepository, never()).findById(any());
    }

    @Test
    void doitRefuserLePaiementDuneDemandeDunAutreParking() {
        Parking autreParking = org.mockito.Mockito.mock(Parking.class);

        when(demandeClientRepository.findByIdPourMiseAJour(10L))
                .thenReturn(Optional.of(demande));
        when(demande.getStatut())
                .thenReturn(StatutDemande.EN_ATTENTE_PAIEMENT);
        when(paiementRepository.existsByDemandeIdAndStatut(
                10L,
                StatutPaiement.CONFIRME
        )).thenReturn(false);
        when(demande.getModePaiementSouhaite())
                .thenReturn(ModePaiement.ESPECE);
        when(demande.getTarifParking()).thenReturn(tarifParking);
        when(tarifParking.calculerMontantTotalTTC())
                .thenReturn(new BigDecimal("1200.00"));
        when(tarifParking.getParking()).thenReturn(autreParking);
        when(autreParking.getId()).thenReturn(9L);
        when(autreParking.getNom()).thenReturn("Bab El Had");
        when(affectationAgentParkingRepository
                .findByUtilisateurIdAndActiveTrue(5L))
                .thenReturn(Optional.of(affectationAgent));
        when(affectationAgent.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(8L);
        when(parking.getNom()).thenReturn("Bab Chellah");

        ConflitMetierException erreur = assertThrows(
                ConflitMetierException.class,
                () -> paiementService.enregistrer(
                        10L,
                        new EnregistrementPaiementRequest(null, null, null),
                        5L
                )
        );

        assertEquals(
                "Cette demande appartient au parking Bab El Had. "
                        + "Vous ne pouvez encaisser que les demandes du parking Bab Chellah",
                erreur.getMessage()
        );
        verify(paiementRepository, never()).save(any());
        verify(utilisateurRepository, never()).findById(any());
    }

    private void preparerDemande(ModePaiement modePaiement) {
        when(demandeClientRepository.findByIdPourMiseAJour(10L))
                .thenReturn(Optional.of(demande));
        when(demande.getStatut())
                .thenReturn(
                        StatutDemande.EN_ATTENTE_PAIEMENT,
                        StatutDemande.PAYEE
                );
        when(demande.getModePaiementSouhaite())
                .thenReturn(modePaiement);
        when(demande.getTarifParking())
                .thenReturn(tarifParking);
        when(tarifParking.calculerMontantTotalTTC())
                .thenReturn(new BigDecimal("1200.00"));
        preparerAffectationValide(5L);
        when(paiementRepository.existsByDemandeIdAndStatut(
                10L,
                StatutPaiement.CONFIRME
        )).thenReturn(false);
        when(utilisateurRepository.findById(5L))
                .thenReturn(Optional.of(agent));
        when(paiementRepository.existsByReference(anyString()))
                .thenReturn(false);
        when(paiementRepository.save(any(Paiement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(recuRepository.existsByNumero(anyString()))
                .thenReturn(false);
        when(recuRepository.save(any(Recu.class)))
                .thenReturn(recuEnregistre);
        when(recuEnregistre.getId()).thenReturn(99L);
        when(recuEnregistre.getNumero())
                .thenReturn("REC-20260916-TEST");
        when(demande.getId()).thenReturn(10L);
        when(demande.getReference()).thenReturn("DEM-20260915-TEST");
    }

    private void preparerAffectationValide(Long agentId) {
        when(affectationAgentParkingRepository
                .findByUtilisateurIdAndActiveTrue(agentId))
                .thenReturn(Optional.of(affectationAgent));
        when(affectationAgent.getParking()).thenReturn(parking);
        when(tarifParking.getParking()).thenReturn(parking);
        when(parking.getId()).thenReturn(8L);
    }
}
