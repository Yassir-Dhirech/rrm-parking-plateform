package com.rrm.parking.paiement.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.paiement.dto.response.EnregistrementPaiementResponse;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutCheque;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private DemandeNouvelAbonnementRegulier demande;

    @Mock
    private TarifParking tarifParking;

    @Mock
    private Utilisateur agent;

    private PaiementService paiementService;

    @BeforeEach
    void initialiser() {
        paiementService = new PaiementService(
                paiementRepository,
                demandeClientRepository,
                utilisateurRepository
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

        Paiement paiement = captor.getValue();

        assertEquals(ModePaiement.ESPECE, paiement.getModePaiement());
        assertEquals(StatutPaiement.CONFIRME, paiement.getStatut());
        assertEquals(new BigDecimal("1200.00"), paiement.getMontant());
        assertEquals(StatutDemande.PAYEE, response.statutDemande());
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
        when(demande.getId()).thenReturn(10L);
        when(demande.getReference()).thenReturn("DEM-20260915-TEST");
    }
}
