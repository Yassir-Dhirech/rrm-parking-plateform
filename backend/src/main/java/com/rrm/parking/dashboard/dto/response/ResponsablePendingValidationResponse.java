package com.rrm.parking.dashboard.dto.response;

import java.util.List;

public record ResponsablePendingValidationResponse(
        long total,
        List<PendingRequestItem> demandes
) {
    public record PendingRequestItem(
            long id,
            String reference,
            String client,
            String statut
    ) {
    }
}
