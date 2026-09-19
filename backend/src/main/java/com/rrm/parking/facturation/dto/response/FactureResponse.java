package com.rrm.parking.facturation.dto.response;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.paiement.entity.Paiement;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FactureResponse(
        Long id,
        String numero,
        StatutFacture statut,
        LocalDateTime dateCreation,
        LocalDateTime dateEmission,
        Long paiementId,
        String paiementReference,
        Long demandeId,
        String referenceDemande,
        String clientNom,
        String clientIdentifiant,
        String email,
        String abonnementReference,
        String parkingNom,
        String forfaitLibelle,
        Integer dureeEnMois,
        LocalDate dateDebutAbonnement,
        LocalDate dateFinAbonnement,
        String immatriculation,
        String modePaiement,
        BigDecimal totalHt,
        BigDecimal totalTva,
        BigDecimal totalTtc,
        List<FactureLigneResponse> lignes
) {

    public static FactureResponse depuis(Facture facture) {
        Paiement paiement = facture.getPaiement();
        DemandeClient demande = (DemandeClient) Hibernate.unproxy(
                paiement.getDemande()
        );
        Client client = (Client) Hibernate.unproxy(demande.getClient());

        String abonnementReference = null;
        String parkingNom = null;
        String forfaitLibelle = null;
        Integer dureeEnMois = null;
        String immatriculation = null;
        if (demande instanceof DemandeNouvelAbonnementRegulier reguliere) {
            if (reguliere.getAbonnementGenere() != null) {
                abonnementReference = reguliere
                        .getAbonnementGenere()
                        .getReference();
            }
            if (reguliere.getTarifParking() != null
                    && reguliere.getTarifParking().getParking() != null) {
                parkingNom = reguliere.getTarifParking()
                        .getParking()
                        .getNom();
            }
            if (reguliere.getTarifParking() != null) {
                dureeEnMois = reguliere.getTarifParking().getDureeEnMois();
                if (reguliere.getTarifParking().getForfait() != null) {
                    forfaitLibelle = reguliere.getTarifParking()
                            .getForfait()
                            .getLibelle();
                }
            }
            if (reguliere.getVehicule() != null) {
                immatriculation = reguliere.getVehicule()
                        .getImmatriculation();
            }
        }

        LocalDate dateDebutAbonnement = null;
        LocalDate dateFinAbonnement = null;
        if (paiement.getPeriodeAbonnement() != null) {
            dateDebutAbonnement = paiement.getPeriodeAbonnement()
                    .getDateDebut();
            dateFinAbonnement = paiement.getPeriodeAbonnement()
                    .getDateFin();
        }

        String clientIdentifiant = null;
        String clientNom = null;
        if (client instanceof ClientParticulier particulier) {
            clientIdentifiant = particulier.getCin();
            clientNom = particulier.getNomComplet();
        } else if (client instanceof ClientEntreprise entreprise) {
            clientIdentifiant = entreprise.getIce();
            clientNom = entreprise.getRaisonSociale();
        }

        return new FactureResponse(
                facture.getId(),
                facture.getNumero(),
                facture.getStatut(),
                facture.getDateCreation(),
                facture.getDateEmission(),
                paiement.getId(),
                paiement.getReference(),
                demande.getId(),
                demande.getReference(),
                clientNom,
                clientIdentifiant,
                client.getEmail(),
                abonnementReference,
                parkingNom,
                forfaitLibelle,
                dureeEnMois,
                dateDebutAbonnement,
                dateFinAbonnement,
                immatriculation,
                paiement.getModePaiement().name(),
                facture.getTotalHt(),
                facture.getTotalTva(),
                facture.getTotalTtc(),
                facture.getLignes().stream()
                        .map(FactureLigneResponse::depuis)
                        .toList()
        );
    }
}
