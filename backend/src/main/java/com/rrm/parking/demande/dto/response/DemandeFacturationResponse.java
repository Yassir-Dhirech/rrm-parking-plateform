package com.rrm.parking.demande.dto.response;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
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
            DemandeNouvelAbonnementRegulier demande,
            Paiement paiement,
            Facture facture
    ) {
        ClientParticulier client = (ClientParticulier) Hibernate.unproxy(
                demande.getClient()
        );
        TarifParking tarif = demande.getTarifParking();
        DecompteNouvelAbonnement decompte =
                DecompteNouvelAbonnement.depuis(tarif);

        String abonnementReference = demande.getAbonnementGenere() == null
                ? null
                : demande.getAbonnementGenere().getReference();

        return new DemandeFacturationResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                demande.getDateModification(),
                client.getNomComplet(),
                client.getCin(),
                client.getEmail(),
                tarif.getParking().getNom(),
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
