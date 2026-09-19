package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.CorrectionDemandeDemandeeEvent;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandeValidationFinaleServiceTest {

    @Mock private DemandeClientRepository demandeRepository;
    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private PaiementRepository paiementRepository;
    @Mock private AbonnementRepository abonnementRepository;
    @Mock private AbonnementRegulierRepository abonnementRegulierRepository;
    @Mock private CarteAccesRepository carteAccesRepository;
    @Mock private DemandeOperationnelleRepository operationRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    private DemandeValidationFinaleService service;
    private Utilisateur decideur;

    @BeforeEach
    void initialiser() {
        service = new DemandeValidationFinaleService(
                demandeRepository,
                utilisateurRepository,
                paiementRepository,
                abonnementRepository,
                abonnementRegulierRepository,
                carteAccesRepository,
                operationRepository,
                eventPublisher
        );

        decideur = new Utilisateur();
        decideur.setNom("Superviseur");
        decideur.setPrenom("Test");
    }

    @Test
    void doitCreerAbonnementActifCarteEtDemandeImpression() {
        DemandeNouvelAbonnementRegulier demande = creerDemandePayee();
        Paiement paiement = Paiement.creerPaiementEspece(
                "PAY-TEST",
                demande,
                new BigDecimal("350.00")
        );
        paiement.confirmer(decideur);

        when(demandeRepository.findByIdPourMiseAJour(10L))
                .thenReturn(Optional.of(demande));
        when(utilisateurRepository.findById(5L))
                .thenReturn(Optional.of(decideur));
        when(paiementRepository.findByDemandeIdAndStatut(
                10L,
                StatutPaiement.CONFIRME
        )).thenReturn(Optional.of(paiement));
        when(abonnementRegulierRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(carteAccesRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(operationRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.valider(10L, 5L);

        ArgumentCaptor<AbonnementRegulier> abonnementCaptor =
                ArgumentCaptor.forClass(AbonnementRegulier.class);
        ArgumentCaptor<CarteAcces> carteCaptor =
                ArgumentCaptor.forClass(CarteAcces.class);
        ArgumentCaptor<DemandeOperationnelle> operationCaptor =
                ArgumentCaptor.forClass(DemandeOperationnelle.class);

        verify(abonnementRegulierRepository)
                .save(abonnementCaptor.capture());
        verify(carteAccesRepository).save(carteCaptor.capture());
        verify(operationRepository).save(operationCaptor.capture());

        AbonnementRegulier abonnement = abonnementCaptor.getValue();
        CarteAcces carte = carteCaptor.getValue();
        DemandeOperationnelle operation = operationCaptor.getValue();

        assertEquals(StatutDemande.VALIDEE, demande.getStatut());
        assertEquals(StatutAbonnement.ACTIF, abonnement.getStatut());
        assertEquals(
                StatutPeriodeAbonnement.ACTIVE,
                abonnement.getPeriodes().getFirst().getStatut()
        );
        assertEquals(StatutCarteAcces.A_IMPRIMER, carte.getStatut());
        assertEquals(TypeOperationCarte.IMPRESSION, operation.getTypeOperation());
        assertNotNull(demande.getAbonnementGenere());
        assertNotNull(paiement.getPeriodeAbonnement());
    }

    @Test
    void doitDemanderCorrectionSansAnnulerLePaiement() {
        DemandeNouvelAbonnementRegulier demande = creerDemandePayee();
        ClientParticulier client =
                (ClientParticulier) demande.getClient();

        when(demandeRepository.findByIdPourMiseAJour(10L))
                .thenReturn(Optional.of(demande));
        when(utilisateurRepository.findById(5L))
                .thenReturn(Optional.of(decideur));

        service.demanderCorrection(
                10L,
                5L,
                "Document illisible"
        );

        assertEquals(
                StatutDemande.EN_ATTENTE_CORRECTION,
                demande.getStatut()
        );
        assertEquals("Document illisible", demande.getMotifRefus());
        verify(abonnementRegulierRepository, never()).save(any());
        verify(eventPublisher).publishEvent(
                new CorrectionDemandeDemandeeEvent(
                        demande.getReference(),
                        client.getEmail(),
                        client.getNomComplet(),
                        "Document illisible"
                )
        );
    }

    private DemandeNouvelAbonnementRegulier creerDemandePayee() {
        ClientParticulier client = new ClientParticulier(
                "Client",
                "Test",
                "AB123456"
        );
        client.setEmail("client@example.com");

        Parking parking = new Parking();
        parking.setNom("Bab Chellah");

        TarifParking tarif = new TarifParking();
        tarif.setParking(parking);
        tarif.setDureeEnMois(3);
        tarif.setPrixHT(new BigDecimal("100.00"));
        tarif.setTauxTVA(new BigDecimal("20.00"));

        DemandeNouvelAbonnementRegulier demande =
                new DemandeNouvelAbonnementRegulier(
                        "DEM-TEST",
                        CanalInitiation.EN_LIGNE,
                        client,
                        null
                );
        demande.selectionnerTarif(tarif);
        demande.soumettre();
        demande.confirmerOtp();
        demande.marquerPayee(decideur);
        return demande;
    }
}
