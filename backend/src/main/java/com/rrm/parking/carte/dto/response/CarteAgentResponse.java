package com.rrm.parking.carte.dto.response;

import com.rrm.parking.carte.enums.StatutCarteAcces;

import java.time.LocalDateTime;

public record CarteAgentResponse(
        Long id,
        String reference,
        String numeroCarte,
        StatutCarteAcces statut,
        String referenceAbonnement,
        String clientNom,
        String immatriculation,
        String typeAbonnement,
        Long parkingId,
        String parkingNom,
        LocalDateTime dateCreation
) {
}
