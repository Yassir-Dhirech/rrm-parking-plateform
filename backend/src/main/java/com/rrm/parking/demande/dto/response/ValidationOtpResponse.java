package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;

import java.time.LocalDateTime;

public record ValidationOtpResponse(

        String reference,

        boolean otpValide,

        StatutDemande statutDemande,

        int tentativesRestantes,

        LocalDateTime dateValidation,

        String message
) {
}