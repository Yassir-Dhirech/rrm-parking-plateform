package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.AgentHistoriqueResponse;
import com.rrm.parking.dashboard.service.AgentHistoriqueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent/historique")
@RequiredArgsConstructor
public class AgentHistoriqueController {

    private final AgentHistoriqueService historiqueService;

    @GetMapping
    @PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
    public AgentHistoriqueResponse charger(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Number utilisateurId = jwt.getClaim("userId");
        if (utilisateurId == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur"
            );
        }
        return historiqueService.charger(utilisateurId.longValue());
    }
}
