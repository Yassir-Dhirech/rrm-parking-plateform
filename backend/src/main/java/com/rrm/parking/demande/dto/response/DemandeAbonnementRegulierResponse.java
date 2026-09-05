package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.enums.StatutDemande;

import java.time.LocalDateTime;

public record DemandeAbonnementRegulierResponse(

        String reference,

        StatutDemande statut,

        LocalDateTime dateSoumission,

        LocalDateTime dateExpirationOtp,

        int tentativesRestantes,

        CanalOtp canalOtp,

        String destinationMasquee
) {
}