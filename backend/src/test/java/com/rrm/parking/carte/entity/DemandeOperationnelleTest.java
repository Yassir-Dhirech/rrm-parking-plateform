package com.rrm.parking.carte.entity;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class DemandeOperationnelleTest {

    @Test
    void enchaineImpressionPuisActivationEtTest() {
        CarteAcces carte = new CarteAcces(
                "CARTE-TEST-001",
                mock(Abonnement.class)
        );
        Utilisateur agent = new Utilisateur();
        Utilisateur superviseur = new Utilisateur();

        DemandeOperationnelle impression = new DemandeOperationnelle(
                "IMP-TEST-001", carte, TypeOperationCarte.IMPRESSION,
                "Première impression", agent
        );
        assertThat(carte.getStatut()).isEqualTo(StatutCarteAcces.A_IMPRIMER);

        impression.prendreEnCharge(agent);
        impression.terminerImpression(agent, "RFID-000001");
        assertThat(impression.getStatut())
                .isEqualTo(StatutDemandeOperationnelle.TERMINEE);
        assertThat(carte.getStatut()).isEqualTo(StatutCarteAcces.IMPRIMEE);

        DemandeOperationnelle activation = new DemandeOperationnelle(
                "ACT-TEST-001", carte, TypeOperationCarte.ACTIVATION,
                "Activation et test", agent
        );
        activation.definirDemandeDeclencheuse(impression);
        assertThat(carte.getStatut()).isEqualTo(StatutCarteAcces.A_ACTIVER);

        activation.prendreEnCharge(superviseur);
        activation.terminerActivation(superviseur);
        assertThat(activation.getStatut())
                .isEqualTo(StatutDemandeOperationnelle.TERMINEE);
        assertThat(carte.getStatut()).isEqualTo(StatutCarteAcces.ACTIVE);
        assertThat(carte.getDateActivation()).isNotNull();
    }
}
