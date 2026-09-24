package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResponsableDashboardKpiResponse(
        LocalDate dateDebut,
        LocalDate dateFin,
        BigDecimal chiffreAffairesHt,
        BigDecimal evolutionChiffreAffairesPct,
        boolean chiffreAffairesDisponible,
        Long placesOccupees,
        Long placesReservees,
        BigDecimal tauxOccupationPct,
        boolean occupationDisponible,
        Long abonnementsActifs,
        BigDecimal evolutionAbonnementsActifsPct,
        Long delaiMoyenTraitementMinutes,
        BigDecimal evolutionDelaiMoyenPct,
        boolean delaiDisponible
) {
}
