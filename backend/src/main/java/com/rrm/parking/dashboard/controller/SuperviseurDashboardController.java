package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.SuperviseurDashboardResponse;
import com.rrm.parking.dashboard.service.SuperviseurDashboardService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/superviseur/dashboard")
@RequiredArgsConstructor
public class SuperviseurDashboardController {
    private final SuperviseurDashboardService service;

    @GetMapping
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public SuperviseurDashboardResponse charger(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        Number userId = jwt.getClaim("userId");
        if (userId == null) throw new IllegalStateException("Le jeton ne contient pas l'identifiant utilisateur");
        return service.charger(userId.longValue(), debut, fin);
    }
}
