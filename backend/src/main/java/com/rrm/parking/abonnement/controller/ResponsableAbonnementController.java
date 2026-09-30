package com.rrm.parking.abonnement.controller;

import com.rrm.parking.abonnement.dto.ResponsableAbonnementResponse;
import com.rrm.parking.abonnement.service.ResponsableAbonnementService;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/responsable/abonnements")
@PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
@RequiredArgsConstructor
public class ResponsableAbonnementController {
    private final ResponsableAbonnementService service;

    @GetMapping
    public Page<ResponsableAbonnementResponse> lister(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int taille,
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutAbonnement statut) {
        return service.lister(page, taille, recherche, statut);
    }

    @GetMapping("/{id}")
    public ResponsableAbonnementResponse consulter(@PathVariable Long id) {
        return service.consulter(id);
    }

    @PostMapping("/{id}/suspension")
    public ResponseEntity<ResponsableAbonnementResponse> suspendre(
            @PathVariable Long id, @Valid @RequestBody SuspensionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.suspendre(id, request.motif(),
                jwt == null ? null : jwt.getSubject()));
    }

    public record SuspensionRequest(@NotBlank @Size(max = 1000) String motif) { }
}
