package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ResponsableMonthlyRevenueResponse(
        int annee,
        BigDecimal totalAnnuelHt,
        List<MonthlyRevenue> mois
) {
    public record MonthlyRevenue(
            int mois,
            String libelle,
            BigDecimal chiffreAffairesHt
    ) {
    }
}
