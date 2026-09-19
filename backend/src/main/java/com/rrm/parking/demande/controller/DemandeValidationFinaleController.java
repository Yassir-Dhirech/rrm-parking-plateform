package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.DemandeCorrectionRequest;
import com.rrm.parking.demande.dto.response.DecisionDemandeResponse;
import com.rrm.parking.demande.service.DemandeValidationFinaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
public class DemandeValidationFinaleController {

    private final DemandeValidationFinaleService service;

    @PostMapping("/{demandeId}/validation-finale")
    @PreAuthorize("hasAuthority('DEMANDE_VALIDER')")
    public ResponseEntity<DecisionDemandeResponse> valider(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                service.valider(
                        demandeId,
                        extraireUtilisateurId(jwt)
                )
        );
    }

    @PostMapping("/{demandeId}/demande-correction")
    @PreAuthorize("hasAuthority('DEMANDE_VALIDER')")
    public ResponseEntity<DecisionDemandeResponse> demanderCorrection(
            @PathVariable Long demandeId,
            @Valid @RequestBody DemandeCorrectionRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                service.demanderCorrection(
                        demandeId,
                        extraireUtilisateurId(jwt),
                        requete.motif()
                )
        );
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
