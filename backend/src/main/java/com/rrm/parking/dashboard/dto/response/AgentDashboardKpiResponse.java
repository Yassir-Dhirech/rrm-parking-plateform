package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AgentDashboardKpiResponse(
        Long parkingId,
        String parkingNom,
        LocalDate dateReference,
        long demandesAEncaisser,
        BigDecimal encaissementsJourTtc,
        long nombreEncaissementsJour,
        long cartesAImprimer,
        long cartesARemettre
) {
}
