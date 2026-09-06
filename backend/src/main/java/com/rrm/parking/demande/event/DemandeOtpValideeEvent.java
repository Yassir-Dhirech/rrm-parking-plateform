package com.rrm.parking.demande.event;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DemandeOtpValideeEvent(

        String email,
        String nomComplet,
        String reference,
        String parkingNom,
        String parkingAdresse,
        String forfaitLibelle,
        Integer dureeEnMois,
        BigDecimal montantTotalTtc,
        String modePaiement,
        LocalDate dateLimitePaiement
) {
}