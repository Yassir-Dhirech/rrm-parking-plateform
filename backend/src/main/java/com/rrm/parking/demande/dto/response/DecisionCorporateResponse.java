package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;

public record DecisionCorporateResponse(
        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande,
        Long contratId,
        String referenceContrat,
        String statutContrat,
        String message
) {
}
