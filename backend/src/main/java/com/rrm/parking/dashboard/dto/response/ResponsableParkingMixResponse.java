package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResponsableParkingMixResponse(
        LocalDate dateReference,
        long placesRegulieres,
        long placesCorporate,
        long totalPlacesActives,
        BigDecimal partRegulierPct,
        BigDecimal partCorporatePct
) {
}
