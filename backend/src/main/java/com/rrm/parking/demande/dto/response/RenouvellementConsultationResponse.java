package com.rrm.parking.demande.dto.response;

import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.carte.enums.StatutCarteAcces;

import java.time.LocalDate;

public record RenouvellementConsultationResponse(
        Long abonnementId,
        String referenceAbonnement,
        StatutAbonnement statutAbonnement,
        String numeroCarte,
        StatutCarteAcces statutCarte,
        String clientNom,
        Long parkingActuelId,
        String parkingActuelNom,
        LocalDate dateFinActuelle
) {
}