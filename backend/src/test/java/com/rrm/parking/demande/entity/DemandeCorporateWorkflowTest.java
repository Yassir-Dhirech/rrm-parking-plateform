package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.model.DecompteCorporate;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DemandeCorporateWorkflowTest {

    @Test
    void doitRespecterToutesLesEtapesJusquaLaFinalisation() {
        Utilisateur responsable = utilisateur("Responsable");
        Utilisateur superviseur = utilisateur("Superviseur");
        ClientEntreprise entreprise = entreprise();
        DemandeNouveauContratCorporate demande = demande(entreprise);

        demande.soumettre();
        demande.confirmerOtpAvantValidationResponsable();
        demande.validerParResponsable(responsable, "Validation corporate");

        ContratCorporate contrat = new ContratCorporate(
                "CTR-CORP-TEST", 3, entreprise
        );
        demande.associerContratGenere(contrat);
        demande.convoquerClient(responsable);

        Paiement paiement = Paiement.creerPaiementCheque(
                "PAY-CORP-TEST",
                demande,
                demande.getMontantTotalTtc(),
                "CHQ-001",
                "Banque test",
                LocalDate.now()
        );
        paiement.confirmer(responsable);
        demande.enregistrerPaiementEtRemiseContrat(paiement, responsable);
        assertEquals(
                StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE,
                demande.getStatut()
        );

        demande.declarerRetourContratLegalise(responsable);
        assertEquals(StatutDemande.EN_ATTENTE_FACTURATION, demande.getStatut());

        LocalDate debut = LocalDate.now();
        contrat.activerApresSignatureExterne(
                debut,
                debut.plusMonths(240).minusDays(1)
        );
        AbonnementEntreprise abonnement = new AbonnementEntreprise(
                "ABO-CORP-TEST", contrat
        );
        abonnement.activer();
        Facture facture = new Facture("FACT-CORP-TEST", paiement);
        facture.ajouterLigne(new LigneFacture(
                TypeLigneFacture.ABONNEMENT,
                "Abonnement corporate et cartes",
                1,
                new BigDecimal("225125.00"),
                new BigDecimal("20.00")
        ));
        facture.emettre();

        demande.enregistrerFacturation(facture, abonnement, responsable);
        assertEquals(StatutDemande.EN_PREPARATION_CARTES, demande.getStatut());

        LocalDateTime activation = LocalDateTime.now();
        demande.marquerCartesActivees(activation, superviseur);
        assertEquals(StatutDemande.PRETE_A_FINALISER, demande.getStatut());
        assertEquals(activation, demande.getDateActivationCartes());

        demande.finaliser(responsable);
        assertEquals(StatutDemande.FINALISEE, demande.getStatut());
        assertNotNull(demande.getDateFinalisation());
    }

    private DemandeNouveauContratCorporate demande(
            ClientEntreprise entreprise
    ) {
        Parking parking = new Parking();
        parking.setCode("BAB_CHELLAH");
        parking.setNom("Bab Chellah");
        parking.setAdresse("Rabat");
        parking.setCapaciteTotale(120);
        parking.setCapaciteReserveeAbonnements(40);
        return new DemandeNouveauContratCorporate(
                "DEM-CORP-TEST",
                CanalInitiation.EN_LIGNE,
                entreprise,
                null,
                parking,
                "TF-12345",
                "Projet test",
                "Adresse test",
                "AB123456",
                "08h00-20h00",
                new DecompteCorporate(
                        3,
                        240,
                        new BigDecimal("375.00"),
                        new BigDecimal("270000.00"),
                        new BigDecimal("150.00"),
                        new BigDecimal("270150.00")
                )
        );
    }

    private ClientEntreprise entreprise() {
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
        return entreprise;
    }

    private Utilisateur utilisateur(String nom) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(nom);
        utilisateur.setPrenom("RRM");
        return utilisateur;
    }
}
