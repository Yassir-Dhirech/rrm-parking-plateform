package com.rrm.parking.demande.event;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RenouvellementOtpValideEvent(
        String email,
        String nomComplet,
        String reference,
        String referenceAbonnement,
        String parkingNom,
        String forfaitLibelle,
        Integer dureeEnMois,
        BigDecimal montantTotalTtc,
        String modePaiement,
        LocalDate dateLimitePaiement
) {
}