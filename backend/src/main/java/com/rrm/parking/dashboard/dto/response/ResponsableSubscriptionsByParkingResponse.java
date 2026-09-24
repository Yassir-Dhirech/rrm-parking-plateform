package com.rrm.parking.dashboard.dto.response;

import java.time.LocalDate;
import java.util.List;

public record ResponsableSubscriptionsByParkingResponse(
        LocalDate dateReference,
        long totalAbonnements,
        List<ParkingSubscriptionCount> parkings
) {
    public record ParkingSubscriptionCount(
            long parkingId,
            String parkingNom,
            long nombreAbonnements
    ) {
    }
}
