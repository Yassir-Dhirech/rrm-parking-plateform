package com.rrm.parking.facturation.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacturationServiceTest {

    @Mock private DemandeClientRepository demandeRepository;
    @Mock private PaiementRepository paiementRepository;
    @Mock private FactureRepository factureRepository;

    private FacturationService service;

    @BeforeEach
    void initialiser() {
        service = new FacturationService(
                demandeRepository,
                paiementRepository,
                factureRepository
        );
    }

    @Test
    void genereUneFactureAvecAbonnementEtCarteA50DhTtc() {
        Utilisateur decideur = new Utilisateur();
        decideur.setNom("Responsable");
        decideur.setPrenom("Test");

        ClientParticulier client = new ClientParticulier(
                "Client",
                "Test",
                "AB123456"
        );
        client.setEmail("client@example.com");

        Parking parking = new Parking();
        parking.setNom("Bab Chellah");

        Forfait forfait = new Forfait();
        forfait.setLibelle("Jour 7j/7 08h-20h");

        TarifParking tarif = new TarifParking();
        tarif.setParking(parking);
        tarif.setForfait(forfait);
        tarif.setDureeEnMois(3);
        tarif.setPrixHT(new BigDecimal("291.67"));
        tarif.setTauxTVA(new BigDecimal("20.00"));

        DemandeNouvelAbonnementRegulier demande =
                new DemandeNouvelAbonnementRegulier(
                        "DEM-FACTURATION-TEST",
                        CanalInitiation.EN_LIGNE,
                        client,
                        null
                );
        demande.selectionnerTarif(tarif);
        demande.soumettre();
        demande.confirmerOtp();

        Paiement paiement = Paiement.creerPaiementEspece(
                "PAY-FACTURATION-TEST",
                demande,
                new BigDecimal("1100.00")
        );
        paiement.confirmer(decideur);
        demande.marquerPayee(decideur);
        demande.valider(decideur, "Dossier conforme");

        AbonnementRegulier abonnement = new AbonnementRegulier(
                "ABO-FACTURATION-TEST",
                client
        );
        demande.associerAbonnementGenere(abonnement);

        when(demandeRepository.findById(10L))
                .thenReturn(Optional.of(demande));
        when(paiementRepository.findByDemandeIdAndStatut(
                10L,
                StatutPaiement.CONFIRME
        )).thenReturn(Optional.of(paiement));
        when(factureRepository.findByPaiementId(any()))
                .thenReturn(Optional.empty());
        when(factureRepository.existsByNumero(any()))
                .thenReturn(false);
        when(factureRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FactureResponse facture = service.genererPourDemande(10L);

        assertEquals(StatutFacture.EMISE, facture.statut());
        assertEquals(new BigDecimal("1100.00"), facture.totalTtc());
        assertEquals(2, facture.lignes().size());
        assertEquals(
                new BigDecimal("1050.00"),
                facture.lignes().getFirst().montantTtc()
        );
        assertEquals(
                new BigDecimal("50.00"),
                facture.lignes().get(1).montantTtc()
        );
        assertEquals(
                StatutDemande.VALIDEE,
                demande.getStatut()
        );
    }
}
