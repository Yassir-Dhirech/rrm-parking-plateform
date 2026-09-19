package com.rrm.parking.carte.controller;

import com.rrm.parking.carte.dto.request.ImpressionCarteRequest;
import com.rrm.parking.carte.dto.response.DemandeOperationnelleResponse;
import com.rrm.parking.carte.service.OperationCarteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations-cartes")
@RequiredArgsConstructor
public class OperationCarteController {

    private final OperationCarteService service;

    @GetMapping("/impressions")
    @PreAuthorize("hasAuthority('CARTE_IMPRIMER')")
    public List<DemandeOperationnelleResponse> listerImpressions() {
        return service.listerImpressions();
    }

    @PostMapping("/{id}/impression-terminee")
    @PreAuthorize("hasAuthority('CARTE_IMPRIMER')")
    public ResponseEntity<DemandeOperationnelleResponse> terminerImpression(
            @PathVariable Long id,
            @Valid @RequestBody ImpressionCarteRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(service.terminerImpression(
                id, extraireUtilisateurId(jwt), requete.numeroCarte()));
    }

    @GetMapping("/activations")
    @PreAuthorize("hasAuthority('CARTE_ACTIVER')")
    public List<DemandeOperationnelleResponse> listerActivations() {
        return service.listerActivations();
    }

    @PostMapping("/{id}/activation-terminee")
    @PreAuthorize("hasAuthority('CARTE_ACTIVER')")
    public ResponseEntity<DemandeOperationnelleResponse> terminerActivation(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(service.terminerActivation(
                id, extraireUtilisateurId(jwt)));
    }

    @GetMapping("/remises")
    @PreAuthorize("hasAuthority('CARTE_REMETTRE')")
    public List<DemandeOperationnelleResponse> listerRemises() {
        return service.listerRemises();
    }

    @PostMapping("/{id}/remise-terminee")
    @PreAuthorize("hasAuthority('CARTE_REMETTRE')")
    public ResponseEntity<DemandeOperationnelleResponse> terminerRemise(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(service.terminerRemise(
                id, extraireUtilisateurId(jwt)));
    }

    private Long extraireUtilisateurId(Jwt jwt) {
        Number userId = jwt.getClaim("userId");
        if (userId == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur");
        }
        return userId.longValue();
    }
}
