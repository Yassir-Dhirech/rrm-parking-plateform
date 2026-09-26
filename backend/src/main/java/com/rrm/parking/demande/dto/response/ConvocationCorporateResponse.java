package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;

import java.time.LocalDateTime;

public record ConvocationCorporateResponse(
        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande,
        LocalDateTime dateConvocation,
        String emailRepresentant,
        String message
) {
}
