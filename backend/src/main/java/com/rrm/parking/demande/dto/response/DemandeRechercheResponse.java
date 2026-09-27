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

        String parkingNom,

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
        DemandeClient demandeReelle =
                (DemandeClient) Hibernate.unproxy(demande);
        Client client = demandeReelle.getClient() != null
                ? (Client) Hibernate.unproxy(demandeReelle.getClient())
                : null;
        return new DemandeRechercheResponse(
                demandeReelle.getId(),
                demandeReelle.getReference(),
                determinerTypeDemande(demandeReelle),
                determinerParking(demandeReelle),
                demandeReelle.getStatut(),
                demandeReelle.getCanalInitiation(),
                demandeReelle.getDateSoumission(),
                demandeReelle.getDateValidationOtp(),
                demandeReelle.getDateModification(),
                client != null ? client.getId() : null,
                client != null ? determinerTypeClient(client) : "INCONNU",
                client != null ? determinerNomClient(client) : null,
                client != null ? determinerIdentifiantClient(client) : null,
                client != null ? client.getEmail() : null,
                client != null ? client.getTelephone() : null
        );
    }

    private static String determinerParking(DemandeClient demande) {
        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            if (nouvelle.getTarifParking() != null && nouvelle.getTarifParking().getParking() != null) {
                return nouvelle.getTarifParking().getParking().getNom();
            }
            return null;
        }

        if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            if (renouvellement.getTarifParking() != null && renouvellement.getTarifParking().getParking() != null) {
                return renouvellement.getTarifParking().getParking().getNom();
            }
            return null;
        }

        if (demande instanceof DemandeNouveauContratCorporate corporate) {
            if (corporate.getParking() != null) {
                return corporate.getParking().getNom();
            }
            return null;
        }

        return null;
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
