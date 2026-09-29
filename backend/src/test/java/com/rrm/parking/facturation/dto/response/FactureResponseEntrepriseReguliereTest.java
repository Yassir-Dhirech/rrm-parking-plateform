package com.rrm.parking.facturation.dto.response;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FactureResponseEntrepriseReguliereTest {

    @Test
    void factureEntrepriseUtiliseRaisonSocialeEtIce() {
        FactureResponse facture = construireFacture(true);
        assertThat(facture.clientNom()).isEqualTo("Société Exemple");
        assertThat(facture.clientIdentifiant()).isEqualTo("001234567890123");
        assertThat(facture.immatriculation()).isEqualTo("12345|A|1");
    }

    @Test
    void facturePersonnelleConserveNomEtCin() {
        FactureResponse facture = construireFacture(false);
        assertThat(facture.clientNom()).isEqualTo("Karim Bennani");
        assertThat(facture.clientIdentifiant()).isEqualTo("AB123456");
    }

    private FactureResponse construireFacture(boolean entreprise) {
        ClientParticulier client = new ClientParticulier("Bennani", "Karim", "AB123456");
        client.setEmail("karim@example.ma");
        DemandeNouvelAbonnementRegulier demande = new DemandeNouvelAbonnementRegulier(
                "DEM-TEST", CanalInitiation.EN_LIGNE, client, null);
        Parking parking = new Parking();
        parking.setNom("Bab Chellah");
        TarifParking tarif = new TarifParking();
        tarif.setParking(parking);
        tarif.setDureeEnMois(3);
        demande.selectionnerTarif(tarif);
        demande.selectionnerVehicule(new Vehicule("12345|A|1", TypeVehicule.VOITURE, client));
        if (entreprise) demande.renseignerEntreprise("Société Exemple", "001234567890123");

        Paiement paiement = mock(Paiement.class);
        when(paiement.getDemande()).thenReturn(demande);
        when(paiement.getModePaiement()).thenReturn(ModePaiement.ESPECE);
        Facture facture = mock(Facture.class);
        when(facture.getPaiement()).thenReturn(paiement);
        when(facture.getLignes()).thenReturn(List.of());
        return FactureResponse.depuis(facture);
    }
}
