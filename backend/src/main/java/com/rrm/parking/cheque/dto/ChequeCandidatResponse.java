package com.rrm.parking.cheque.dto;

import com.rrm.parking.paiement.enums.StatutCheque;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ChequeCandidatResponse(
        Long paiementId,
        String referencePaiement,
        String numeroCheque,
        String banqueCheque,
        LocalDate dateEmissionCheque,
        StatutCheque statutCheque,
        BigDecimal montantTtc,
        Long abonnementId,
        String referenceAbonnement,
        String statutAbonnement,
        String clientNom
) {}
