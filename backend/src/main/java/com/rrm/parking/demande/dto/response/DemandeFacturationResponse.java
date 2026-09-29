package com.rrm.parking.demande.dto.response;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.model.DecomptePaiementDemande;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DemandeFacturationResponse(
        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande,
        LocalDateTime dateModification,
        String clientNom,
        String cin,
        String email,
        String parkingNom,
        String abonnementReference,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCarteTtc,
        BigDecimal montantTotalTtc,
        Long paiementId,
        String paiementReference,
        Long factureId,
        String factureNumero,
        StatutFacture factureStatut,
        LocalDateTime dateEmission,
        String entrepriseNom,
        String entrepriseIce
) {

    public static DemandeFacturationResponse depuis(
            DemandeClient demande,
            Paiement paiement,
            Facture facture
    ) {
        ClientParticulier client = (ClientParticulier) Hibernate.unproxy(
                demande.getClient()
        );
        DemandeClient demandeReelle = (DemandeClient) Hibernate.unproxy(
                demande
        );
        DecomptePaiementDemande decompte =
                DecomptePaiementDemande.depuis(demandeReelle);

        String abonnementReference;
        String entrepriseNom = null;
        String entrepriseIce = null;
        if (demandeReelle instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            abonnementReference = nouvelle.getAbonnementGenere() == null
                    ? null
                    : nouvelle.getAbonnementGenere().getReference();
            entrepriseNom = nouvelle.getEntrepriseNom();
            entrepriseIce = nouvelle.getEntrepriseIce();
        } else if (demandeReelle
                instanceof DemandeRenouvellementRegulier renouvellement) {
            abonnementReference = renouvellement
                    .getAbonnementConcerne()
                    .getReference();
            entrepriseNom = renouvellement.getAbonnementConcerne().getEntrepriseNom();
            entrepriseIce = renouvellement.getAbonnementConcerne().getEntrepriseIce();
        } else {
            throw new IllegalArgumentException(
                    "Ce type de demande n'est pas facturable"
            );
        }

        return new DemandeFacturationResponse(
                demandeReelle.getId(),
                demandeReelle.getReference(),
                demandeReelle.getStatut(),
                demandeReelle.getDateModification(),
                entrepriseNom == null ? client.getNomComplet() : entrepriseNom,
                client.getCin(),
                client.getEmail(),
                decompte.tarifParking().getParking().getNom(),
                abonnementReference,
                decompte.montantAbonnementTTC(),
                decompte.fraisCarteTTC(),
                decompte.montantTotalTTC(),
                paiement.getId(),
                paiement.getReference(),
                facture == null ? null : facture.getId(),
                facture == null ? null : facture.getNumero(),
                facture == null ? null : facture.getStatut(),
                facture == null ? null : facture.getDateEmission(),
                entrepriseNom,
                entrepriseIce
        );
    }
}
