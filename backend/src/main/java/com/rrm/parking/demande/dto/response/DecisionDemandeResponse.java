package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;

public record DecisionDemandeResponse(
        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande,
        Long abonnementId,
        String referenceAbonnement,
        Long carteId,
        String referenceCarte,
        Long demandeImpressionId,
        String referenceDemandeImpression
) {

    public static DecisionDemandeResponse correction(
            Long demandeId,
            String referenceDemande,
            StatutDemande statutDemande
    ) {
        return new DecisionDemandeResponse(
                demandeId,
                referenceDemande,
                statutDemande,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
