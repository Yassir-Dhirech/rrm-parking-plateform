package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.contrat.enums.StatutContrat;
import com.rrm.parking.contrat.repository.ContratCorporateRepository;
import com.rrm.parking.demande.dto.response.DecisionCorporateResponse;
import com.rrm.parking.demande.dto.response.ConvocationCorporateResponse;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.DemandeCorporateRefuseeEvent;
import com.rrm.parking.demande.event.DemandeCorporateConvoqueeEvent;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.model.DecompteCorporate;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandeCorporateResponsableServiceTest {

    @Mock
    private DemandeNouveauContratCorporateRepository demandeRepository;
    @Mock
    private ContratCorporateRepository contratRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private CapaciteCorporateService capaciteCorporateService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private DemandeCorporateResponsableService service;
    private Utilisateur responsable;

    @BeforeEach
    void initialiser() {
        service = new DemandeCorporateResponsableService(
                demandeRepository,
                contratRepository,
                utilisateurRepository,
                capaciteCorporateService,
                eventPublisher
        );
        responsable = new Utilisateur();
        responsable.setNom("Responsable");
        responsable.setPrenom("RRM");
    }

    @Test
    void doitValiderEtGenererUnContratNonSigne() {
        DemandeNouveauContratCorporate demande = creerDemandeEnAttente();
        when(demandeRepository.findByIdPourDecision(38L))
                .thenReturn(Optional.of(demande));
        when(utilisateurRepository.findById(7L))
                .thenReturn(Optional.of(responsable));
        when(contratRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DecisionCorporateResponse resultat = service.valider(38L, 7L);

        assertEquals(StatutDemande.VALIDEE, demande.getStatut());
        assertEquals(StatutDemande.VALIDEE, resultat.statutDemande());
        assertNotNull(demande.getContratGenere());
        assertEquals(
                StatutContrat.EN_PREPARATION,
                demande.getContratGenere().getStatut()
        );
        assertEquals(3,
                demande.getContratGenere().getNombrePlacesContractuelles());
        assertEquals("AB123456", demande.getCinRepresentant());
        assertEquals(
                "Tous les jours de 08h00 à 20h00",
                demande.getPlageHoraire()
        );
        assertSame(demande.getClient(),
                demande.getContratGenere().getClientEntreprise());
        verify(capaciteCorporateService)
                .verrouillerEtVerifierPourValidation(38L, 8L, 3);
        verify(demandeRepository).save(demande);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void doitRefuserAvecMotifEtPublierLevenementEmail() {
        DemandeNouveauContratCorporate demande = creerDemandeEnAttente();
        when(demandeRepository.findByIdPourDecision(38L))
                .thenReturn(Optional.of(demande));
        when(utilisateurRepository.findById(7L))
                .thenReturn(Optional.of(responsable));

        DecisionCorporateResponse resultat = service.refuser(
                38L,
                7L,
                "  Capacité contractuelle insuffisante  "
        );

        assertEquals(StatutDemande.REFUSEE, demande.getStatut());
        assertEquals("Capacité contractuelle insuffisante",
                demande.getMotifRefus());
        assertEquals(StatutDemande.REFUSEE, resultat.statutDemande());
        assertNull(demande.getContratGenere());
        verify(contratRepository, never()).save(any());
        verify(capaciteCorporateService, never())
                .verrouillerEtVerifierPourValidation(
                        anyLong(),
                        anyLong(),
                        anyInt()
                );

        ArgumentCaptor<DemandeCorporateRefuseeEvent> evenement =
                ArgumentCaptor.forClass(DemandeCorporateRefuseeEvent.class);
        verify(eventPublisher).publishEvent(evenement.capture());
        assertEquals("DEM-CORP-TEST", evenement.getValue().reference());
        assertEquals("MEDUSE TEST", evenement.getValue().destinataire());
        assertEquals("corporate@example.com", evenement.getValue().email());
        assertEquals("Capacité contractuelle insuffisante",
                evenement.getValue().motif());
    }

    @Test
    void doitConvoquerUneSeuleFoisApresGenerationDuContrat() {
        DemandeNouveauContratCorporate demande = creerDemandeEnAttente();
        demande.validerParResponsable(responsable, "Validation");
        demande.associerContratGenere(
                new ContratCorporate(
                        "CTR-RRM-TEST",
                        demande.getNombrePlaces(),
                        (ClientEntreprise) demande.getClient()
                )
        );
        when(demandeRepository.findByIdPourDecision(38L))
                .thenReturn(Optional.of(demande));
        when(utilisateurRepository.findById(7L))
                .thenReturn(Optional.of(responsable));

        ConvocationCorporateResponse resultat = service.convoquer(38L, 7L);

        assertEquals(
                StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE,
                demande.getStatut()
        );
        assertEquals(demande.getStatut(), resultat.statutDemande());
        assertNotNull(demande.getDateConvocation());
        assertEquals("corporate@example.com", resultat.emailRepresentant());
        verify(demandeRepository).save(demande);

        ArgumentCaptor<DemandeCorporateConvoqueeEvent> evenement =
                ArgumentCaptor.forClass(
                        DemandeCorporateConvoqueeEvent.class
                );
        verify(eventPublisher).publishEvent(evenement.capture());
        assertEquals("DEM-CORP-TEST", evenement.getValue().reference());
        assertEquals("Bab Chellah", evenement.getValue().parkingNom());
        assertEquals(
                new BigDecimal("270150.00"),
                evenement.getValue().montantTotalTtc()
        );

        assertThrows(
                com.rrm.parking.common.exception.ConflitMetierException.class,
                () -> service.convoquer(38L, 7L)
        );
    }

    private DemandeNouveauContratCorporate creerDemandeEnAttente() {
        ClientEntreprise entreprise = new ClientEntreprise(
                "SOCIETE TEST",
                "009876543210123",
                "RC-12345",
                "Rabat",
                "TEST"
        );
        entreprise.setPrenomContactPrincipal("MEDUSE");
        entreprise.setEmail("corporate@example.com");
        entreprise.setTelephone("0612345678");

        Parking parking = new Parking();
        parking.setId(8L);
        parking.setCode("BAB_CHELLAH");
        parking.setNom("Bab Chellah");
        parking.setAdresse("Bab Chellah, Rabat");
        parking.setCapaciteTotale(120);
        parking.setCapaciteReserveeAbonnements(40);

        DecompteCorporate decompte = new DecompteCorporate(
                3,
                240,
                new BigDecimal("375.00"),
                new BigDecimal("270000.00"),
                new BigDecimal("150.00"),
                new BigDecimal("270150.00")
        );
        DemandeNouveauContratCorporate demande =
                new DemandeNouveauContratCorporate(
                        "DEM-CORP-TEST",
                        CanalInitiation.EN_LIGNE,
                        entreprise,
                        null,
                        parking,
                        "TF-12345/2026",
                        "Projet corporate RRM",
                        "Bab Chellah, Rabat",
                        "AB123456",
                        "Tous les jours de 08h00 à 20h00",
                        decompte
                );
        ReflectionTestUtils.setField(demande, "id", 38L);
        demande.soumettre();
        demande.confirmerOtpAvantValidationResponsable();
        return demande;
    }
}
