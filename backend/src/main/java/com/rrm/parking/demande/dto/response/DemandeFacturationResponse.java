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
        LocalDateTime dateEmission
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
        if (demandeReelle instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            abonnementReference = nouvelle.getAbonnementGenere() == null
                    ? null
                    : nouvelle.getAbonnementGenere().getReference();
        } else if (demandeReelle
                instanceof DemandeRenouvellementRegulier renouvellement) {
            abonnementReference = renouvellement
                    .getAbonnementConcerne()
                    .getReference();
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
                client.getNomComplet(),
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
                facture == null ? null : facture.getDateEmission()
        );
    }
}
