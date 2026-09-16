package com.rrm.parking.paiement.controller;

import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.paiement.dto.response.EnregistrementPaiementResponse;
import com.rrm.parking.paiement.service.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
public class PaiementController {

    private final PaiementService paiementService;

    @PostMapping("/{demandeId}/paiements")
    @PreAuthorize(
            "hasAuthority('PAIEMENT_ENREGISTRER')"
    )
    public ResponseEntity<EnregistrementPaiementResponse>
    enregistrer(
            @PathVariable Long demandeId,
            @Valid @RequestBody
            EnregistrementPaiementRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Number userId = jwt.getClaim("userId");

        if (userId == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur"
            );
        }

        EnregistrementPaiementResponse response =
                paiementService.enregistrer(
                        demandeId,
                        requete,
                        userId.longValue()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
