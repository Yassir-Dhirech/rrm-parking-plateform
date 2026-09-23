package com.rrm.parking.paiement.model;

import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.tarification.entity.TarifParking;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DecomptePaiementDemandeTest {

    @Test
    void doitAjouterLesFraisDeCartePourUnNouvelAbonnement() {
        DemandeNouvelAbonnementRegulier demande =
                mock(DemandeNouvelAbonnementRegulier.class);
        TarifParking tarif = mock(TarifParking.class);

        when(demande.getModePaiementSouhaite())
                .thenReturn(ModePaiement.ESPECE);
        when(demande.getTarifParking()).thenReturn(tarif);
        when(tarif.calculerMontantTotalTTC())
                .thenReturn(new BigDecimal("1500.00"));

        DecomptePaiementDemande decompte =
                DecomptePaiementDemande.depuis(demande);

        assertEquals(new BigDecimal("1500.00"), decompte.montantAbonnementTTC());
        assertEquals(new BigDecimal("50.00"), decompte.fraisCarteTTC());
        assertEquals(new BigDecimal("1550.00"), decompte.montantTotalTTC());
    }

    @Test
    void neDoitPasAjouterDeFraisDeCartePourUnRenouvellement() {
        DemandeRenouvellementRegulier demande =
                mock(DemandeRenouvellementRegulier.class);
        TarifParking tarif = mock(TarifParking.class);

        when(demande.getModePaiementSouhaite())
                .thenReturn(ModePaiement.ESPECE);
        when(demande.getTarifParking()).thenReturn(tarif);
        when(tarif.calculerMontantTotalTTC())
                .thenReturn(new BigDecimal("1500.00"));

        DecomptePaiementDemande decompte =
                DecomptePaiementDemande.depuis(demande);

        assertEquals(new BigDecimal("1500.00"), decompte.montantAbonnementTTC());
        assertEquals(new BigDecimal("0.00"), decompte.fraisCarteTTC());
        assertEquals(new BigDecimal("1500.00"), decompte.montantTotalTTC());
    }
}
