package com.rrm.parking.dashboard.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AgentDashboardActionsResponse(
        List<Action> actions,
        long alertesRetard
) {
    public record Action(
            String type,
            Long id,
            String reference,
            String nomClient,
            String identifiantClient,
            LocalDateTime depuis,
            long ancienneteHeures,
            boolean enRetard,
            String lien
    ) { }
}
