package com.rrm.parking.demande.dto.response;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeChangementParking;
import com.rrm.parking.demande.entity.DemandeChangementVehicule;
import com.rrm.parking.demande.entity.DemandeClient;
import org.hibernate.Hibernate;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;

import java.time.LocalDateTime;

public record DemandeRechercheResponse(

        Long id,

        String reference,

        String typeDemande,

        StatutDemande statut,

        CanalInitiation canalInitiation,

        LocalDateTime dateSoumission,

        LocalDateTime dateValidationOtp,

        LocalDateTime dateModification,

        Long clientId,

        String typeClient,

        String nomClient,

        String identifiantClient,

        String email,

        String telephone

) {

    public static DemandeRechercheResponse depuis(
            DemandeClient demande
    ) {
        Client client = (Client) Hibernate.unproxy(
                demande.getClient()
        );
        return new DemandeRechercheResponse(
                demande.getId(),
                demande.getReference(),
                determinerTypeDemande(demande),
                demande.getStatut(),
                demande.getCanalInitiation(),
                demande.getDateSoumission(),
                demande.getDateValidationOtp(),
                demande.getDateModification(),
                client.getId(),
                determinerTypeClient(client),
                determinerNomClient(client),
                determinerIdentifiantClient(client),
                client.getEmail(),
                client.getTelephone()
        );
    }

    private static String determinerTypeDemande(
            DemandeClient demande
    ) {
        if (demande
                instanceof DemandeNouvelAbonnementRegulier) {
            return "NOUVEL_ABONNEMENT_REGULIER";
        }

        if (demande
                instanceof DemandeRenouvellementRegulier) {
            return "RENOUVELLEMENT_REGULIER";
        }

        if (demande
                instanceof DemandeChangementParking) {
            return "CHANGEMENT_PARKING";
        }

        if (demande
                instanceof DemandeChangementVehicule) {
            return "CHANGEMENT_VEHICULE";
        }

        if (demande
                instanceof DemandeNouveauContratCorporate) {
            return "NOUVEAU_CONTRAT_CORPORATE";
        }

        return "AUTRE";
    }

    private static String determinerTypeClient(
            Client client
    ) {
        if (client instanceof ClientParticulier) {
            return "PARTICULIER";
        }

        if (client instanceof ClientEntreprise) {
            return "ENTREPRISE";
        }

        return "INCONNU";
    }

    private static String determinerNomClient(
            Client client
    ) {
        if (client
                instanceof ClientParticulier particulier) {
            return particulier.getNomComplet();
        }

        if (client
                instanceof ClientEntreprise entreprise) {
            return entreprise.getRaisonSociale();
        }

        return null;
    }

    private static String determinerIdentifiantClient(
            Client client
    ) {
        if (client
                instanceof ClientParticulier particulier) {
            return particulier.getCin();
        }

        if (client
                instanceof ClientEntreprise entreprise) {
            return entreprise.getIce();
        }

        return null;
    }
}