package com.rrm.parking.dashboard.dto.response;

import java.util.List;

public record AbonnementsMensuelsAgentResponse(
        Long parkingId,
        String parkingNom,
        int annee,
        List<Mois> mois
) {
    public record Mois(int numero, long nombreAbonnements) {
    }
}
