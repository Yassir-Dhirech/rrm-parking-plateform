package com.rrm.parking.facturation.dto.response;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutCheque;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
import com.rrm.parking.utilisateur.entity.Utilisateur;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RecuConsultationResponse(
        Long recuId,
        String numeroRecu,
        LocalDateTime dateGeneration,

        BigDecimal montantRecu,
        BigDecimal montantAbonnementTTC,
        BigDecimal fraisCarteTTC,
        ModePaiement modePaiement,

        Long paiementId,
        String referencePaiement,
        StatutPaiement statutPaiement,

        String numeroCheque,
        String banqueCheque,
        LocalDate dateEmissionCheque,
        StatutCheque statutCheque,

        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande,

        String parkingNom,
        Integer dureeEnMois,

        Long agentId,
        String agentNomComplet,

        Long clientId,
        String nomClient,
        String clientNom,
        String clientPrenom,
        String cin,
        String email,
        String telephone
) {

    public static RecuConsultationResponse depuis(
            Recu recu,
            ClientParticulier client,
            DemandeNouvelAbonnementRegulier demandeReguliere
    ) {
        Paiement paiement = recu.getPaiement();
        DemandeClient demande = paiement.getDemande();
        Utilisateur agent = paiement.getTraitePar();

        TarifParking tarif =
                demandeReguliere.getTarifParking();
        DecompteNouvelAbonnement decompte =
                DecompteNouvelAbonnement.depuis(tarif);

        Long agentId = agent == null
                ? null
                : agent.getId();

        String agentNomComplet = agent == null
                ? "Non renseigné"
                : agent.getPrenom()
                + " "
                + agent.getNom();

        return new RecuConsultationResponse(
                recu.getId(),
                recu.getNumero(),
                recu.getDateGeneration(),

                recu.getMontantRecu(),
                decompte.montantAbonnementTTC(),
                decompte.fraisCarteTTC(),
                recu.getModePaiement(),

                paiement.getId(),
                paiement.getReference(),
                paiement.getStatut(),

                paiement.getNumeroCheque(),
                paiement.getBanqueCheque(),
                paiement.getDateEmissionCheque(),
                paiement.getStatutCheque(),

                demande.getId(),
                demande.getReference(),
                demande.getStatut(),

                tarif.getParking().getNom(),
                tarif.getDureeEnMois(),

                agentId,
                agentNomComplet,

                client.getId(),
                client.getNomComplet(),
                client.getNom(),
                client.getPrenom(),
                client.getCin(),
                client.getEmail(),
                client.getTelephone()
        );
    }
}
