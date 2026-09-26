package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.ChiffreAffairesDashboardResponse;
import com.rrm.parking.dashboard.enums.TypeAbonnementReporting;
import com.rrm.parking.dashboard.service.ChiffreAffairesReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reporting/chiffre-affaires")
@RequiredArgsConstructor
public class ChiffreAffairesReportingController {

    private final ChiffreAffairesReportingService reportingService;

    @GetMapping("/dashboard")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_COMPTABLE',
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ChiffreAffairesDashboardResponse> dashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateDebut,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateFin,

            @RequestParam(required = false)
            Integer annee,

            @RequestParam(required = false)
            Integer mois,

            @RequestParam(required = false)
            Long parkingId,

            @RequestParam(defaultValue = "TOUS")
            TypeAbonnementReporting typeAbonnement
    ) {
        return ResponseEntity.ok(
                reportingService.chargerDashboard(
                        dateDebut,
                        dateFin,
                        annee,
                        mois,
                        parkingId,
                        typeAbonnement
                )
        );
    }
}
