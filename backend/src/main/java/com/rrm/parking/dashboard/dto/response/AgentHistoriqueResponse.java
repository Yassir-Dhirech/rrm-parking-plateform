package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AgentHistoriqueResponse(
        List<DemandeCreee> demandesCreees,
        List<PaiementValide> paiementsValides,
        List<OperationCarte> impressionsDeclarees,
        List<OperationCarte> remisesDeclarees,
        List<ModificationDemande> modificationsDemandes
) {
    public record DemandeCreee(
            Long id,
            String reference,
            String typeDemande,
            String statut,
            String nomClient,
            String parkingNom,
            LocalDateTime dateCreation
    ) {
    }

    public record PaiementValide(
            Long id,
            String reference,
            String referenceDemande,
            String nomClient,
            String parkingNom,
            String modePaiement,
            BigDecimal montantTtc,
            LocalDateTime dateValidation
    ) {
    }

    public record OperationCarte(
            Long id,
            String reference,
            String referenceDemande,
            String nomClient,
            String parkingNom,
            String referenceCarte,
            String numeroCarte,
            LocalDateTime dateDeclaration
    ) {
    }

    public record ModificationDemande(
            Long id,
            Long demandeId,
            String referenceDemande,
            String parkingNom,
            String resume,
            String detailsAvantApres,
            LocalDateTime dateModification
    ) {
    }
}
