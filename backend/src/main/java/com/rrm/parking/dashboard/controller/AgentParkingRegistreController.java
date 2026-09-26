package com.rrm.parking.dashboard.controller;

import com.rrm.parking.carte.dto.response.CarteAgentResponse;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.dashboard.dto.response.AbonnementsMensuelsAgentResponse;
import com.rrm.parking.dashboard.service.AgentParkingRegistreService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_AGENT_ADMINISTRATIF')")
public class AgentParkingRegistreController {

    private final AgentParkingRegistreService service;

    @GetMapping("/cartes")
    public List<CarteAgentResponse> cartes(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutCarteAcces statut,
            @RequestParam(required = false) String type
    ) {
        return service.cartes(agentId(jwt), recherche, statut, type);
    }

    @GetMapping("/abonnements-mensuels")
    public AbonnementsMensuelsAgentResponse abonnementsMensuels(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Integer annee
    ) {
        int anneeDemandee = annee == null
                ? LocalDate.now(ZoneId.of("Africa/Casablanca")).getYear()
                : annee;
        return service.abonnementsMensuels(agentId(jwt), anneeDemandee);
    }

    private Long agentId(Jwt jwt) {
        Number id = jwt.getClaim("userId");
        if (id == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur");
        }
        return id.longValue();
    }
}
