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
    @PreAuthorize("hasAuthority('CARTE_IMPRIMER') or hasRole('SUPERVISEUR')")
    public List<DemandeOperationnelleResponse> listerImpressions(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long utilisateurId = extraireUtilisateurId(jwt);
        return estSuperviseur(jwt)
                ? service.listerImpressionsSuperviseur(utilisateurId)
                : service.listerImpressions(utilisateurId);
    }

    @PostMapping("/{id}/impression-terminee")
    @PreAuthorize("hasAuthority('CARTE_IMPRIMER') or hasRole('SUPERVISEUR')")
    public ResponseEntity<DemandeOperationnelleResponse> terminerImpression(
            @PathVariable Long id,
            @Valid @RequestBody ImpressionCarteRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long utilisateurId = extraireUtilisateurId(jwt);
        return ResponseEntity.ok(estSuperviseur(jwt)
                ? service.terminerImpressionSuperviseur(id, utilisateurId, requete.numeroCarte())
                : service.terminerImpression(id, utilisateurId, requete.numeroCarte()));
    }

    @GetMapping("/activations")
    @PreAuthorize("hasAuthority('CARTE_ACTIVER')")
    public List<DemandeOperationnelleResponse> listerActivations(@AuthenticationPrincipal Jwt jwt) {
        return service.listerActivations(extraireUtilisateurId(jwt));
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
    public List<DemandeOperationnelleResponse> listerRemises(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.listerRemises(extraireUtilisateurId(jwt));
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

    private boolean estSuperviseur(Jwt jwt) {
        List<String> authorities = jwt.getClaimAsStringList("authorities");
        return authorities != null && authorities.contains("ROLE_SUPERVISEUR");
    }
}
