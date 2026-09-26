package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.AgentDashboardKpiResponse;
import com.rrm.parking.dashboard.dto.response.AgentDashboardActionsResponse;
import com.rrm.parking.dashboard.dto.response.AgentDashboardRechercheResponse;
import com.rrm.parking.dashboard.service.AgentDashboardService;
import com.rrm.parking.dashboard.service.AgentDashboardActionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent/dashboard")
@RequiredArgsConstructor
public class AgentDashboardController {

    private final AgentDashboardService dashboardService;
    private final AgentDashboardActionsService actionsService;

    @GetMapping("/kpis")
    @PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
    public ResponseEntity<AgentDashboardKpiResponse> kpis(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                dashboardService.chargerKpis(extraireUtilisateurId(jwt))
        );
    }

    @GetMapping("/actions")
    @PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
    public AgentDashboardActionsResponse actions(@AuthenticationPrincipal Jwt jwt) {
        return actionsService.actions(extraireUtilisateurId(jwt));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
    public AgentDashboardRechercheResponse rechercher(@AuthenticationPrincipal Jwt jwt,
            @RequestParam String terme) {
        return actionsService.rechercher(extraireUtilisateurId(jwt), terme);
    }

    private Long extraireUtilisateurId(Jwt jwt) {
        Number userId = jwt.getClaim("userId");
        if (userId == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur"
            );
        }
        return userId.longValue();
    }
}
