package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.demande.dto.request.DemandeAbonnementRegulierRequest;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.service.otp.OtpGenere;
import com.rrm.parking.document.repository.PieceJointeRepository;
import com.rrm.parking.document.service.FichierStocke;
import com.rrm.parking.document.service.StockageDocumentService;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandeAbonnementRegulierServiceTest {

    @Mock private ClientParticulierRepository clientRepository;
    @Mock private VehiculeRepository vehiculeRepository;
    @Mock private TarifParkingRepository tarifParkingRepository;
    @Mock private DemandeClientRepository demandeRepository;
    @Mock private PieceJointeRepository pieceJointeRepository;
    @Mock private StockageDocumentService stockageDocumentService;
    @Mock private OtpEmissionService otpEmissionService;
    @Mock private UtilisateurRepository utilisateurRepository;

    private DemandeAbonnementRegulierService service;

    @BeforeEach
    void initialiser() {
        service = new DemandeAbonnementRegulierService(
                clientRepository,
                vehiculeRepository,
                tarifParkingRepository,
                demandeRepository,
                pieceJointeRepository,
                stockageDocumentService,
                otpEmissionService,
                utilisateurRepository
        );
    }

    @Test
    void doitTracerUneSouscriptionAssisteeParAgent() {
        Long agentId = 42L;
        Utilisateur agent = new Utilisateur();
        agent.setId(agentId);

        TarifParking tarif = mock(TarifParking.class);
        ClientParticulier client = new ClientParticulier(
                "BENNANI",
                "Karim",
                "AB123456"
        );

        when(utilisateurRepository.findById(agentId))
                .thenReturn(Optional.of(agent));
        when(tarifParkingRepository.findById(15L))
                .thenReturn(Optional.of(tarif));
        when(tarif.estApplicableA(any()))
                .thenReturn(true);
        when(clientRepository.findByCinIgnoreCase("AB123456"))
                .thenReturn(Optional.of(client));
        when(clientRepository.save(any(ClientParticulier.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(vehiculeRepository.findByImmatriculationIgnoreCase("12345|A|1"))
                .thenReturn(Optional.empty());
        when(vehiculeRepository.save(any(Vehicule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(demandeRepository.existsByReference(anyString()))
                .thenReturn(false);
        when(demandeRepository.saveAndFlush(any(DemandeClient.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(stockageDocumentService.stocker(any(), anyString()))
                .thenReturn(new FichierStocke(
                        "document.pdf",
                        "demandes/test/document.pdf",
                        "application/pdf",
                        128L,
                        "a".repeat(64)
                ));
        when(pieceJointeRepository.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(otpEmissionService.emettre(
                any(DemandeClient.class),
                any(CanalOtp.class),
                anyString()
        )).thenReturn(new OtpGenere(
                CanalOtp.EMAIL,
                LocalDateTime.now().plusMinutes(10),
                3,
                "ka**************om"
        ));

        MultipartFile document = mock(MultipartFile.class);
        DemandeAbonnementRegulierRequest requete =
                new DemandeAbonnementRegulierRequest(
                        "BENNANI",
                        "Karim",
                        "AB123456",
                        "0661234567",
                        "karim.bennani@example.ma",
                        "12345",
                        "A",
                        "1",
                        "Dacia",
                        "Logan",
                        "Blanc",
                        TypeVehicule.VOITURE,
                        15L,
                        ModePaiement.ESPECE,
                        CanalOtp.EMAIL,
                        true
                );

        service.creerAssisteeParAgent(
                requete,
                document,
                document,
                document,
                document,
                agentId
        );

        ArgumentCaptor<DemandeClient> captor =
                ArgumentCaptor.forClass(DemandeClient.class);
        org.mockito.Mockito.verify(demandeRepository)
                .saveAndFlush(captor.capture());

        DemandeNouvelAbonnementRegulier demande =
                (DemandeNouvelAbonnementRegulier) captor.getValue();

        assertEquals(
                CanalInitiation.ASSISTE_PAR_AGENT,
                demande.getCanalInitiation()
        );
        assertSame(agent, demande.getInitieePar());
        assertSame(client, demande.getClient());
    }
}
