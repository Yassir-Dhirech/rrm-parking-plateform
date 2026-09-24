package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.ResponsableDashboardKpiResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableSubscriptionsByParkingResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableMonthlyRevenueResponse;
import com.rrm.parking.dashboard.dto.response.ResponsablePendingValidationResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableParkingMixResponse;
import com.rrm.parking.dashboard.service.ResponsableDashboardService;
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
@RequestMapping("/api/responsable/dashboard")
@RequiredArgsConstructor
public class ResponsableDashboardController {

    private final ResponsableDashboardService dashboardService;

    @GetMapping("/kpis")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ResponsableDashboardKpiResponse> kpis(
            @RequestParam(required = false)
            Long parkingId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateDebut,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateFin
    ) {
        return ResponseEntity.ok(
                dashboardService.chargerKpis(
                        parkingId,
                        dateDebut,
                        dateFin
                )
        );
    }
    @GetMapping("/charts/abonnements-actifs-par-parking")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ResponsableSubscriptionsByParkingResponse> abonnementsActifsParParking() {
        return ResponseEntity.ok(
                dashboardService.chargerAbonnementsActifsParParking()
        );
    }

    @GetMapping("/charts/repartition-places-actives")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ResponsableParkingMixResponse> repartitionPlacesActives() {
        return ResponseEntity.ok(
                dashboardService.chargerRepartitionPlacesActives()
        );
    }

    @GetMapping("/charts/chiffre-affaires-mensuel")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ResponsableMonthlyRevenueResponse> chiffreAffairesMensuel(
            @RequestParam(required = false)
            Integer annee
    ) {
        return ResponseEntity.ok(
                dashboardService.chargerChiffreAffairesMensuel(annee)
        );
    }

    @GetMapping("/demandes-en-attente-validation")
    @PreAuthorize("""
            hasAnyAuthority(
                'ROLE_RESPONSABLE_STATIONNEMENT',
                'ROLE_ADMINISTRATEUR_SI'
            )
            """)
    public ResponseEntity<ResponsablePendingValidationResponse> demandesEnAttenteValidation() {
        return ResponseEntity.ok(
                dashboardService.chargerDemandesEnAttenteValidation()
        );
    }

}
