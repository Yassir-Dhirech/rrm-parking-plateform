package com.rrm.parking.paiement.controller;

import com.rrm.parking.paiement.dto.request.EnregistrerPaiementRequest;
import com.rrm.parking.paiement.dto.response.PaiementEnregistreResponse;
import com.rrm.parking.paiement.service.PaiementEnregistrementService;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementEnregistrementService
            paiementEnregistrementService;

    @PostMapping("/{demandeId}/paiement")
    @PreAuthorize(
            "hasAuthority('PAIEMENT_ENREGISTRER')"
    )
    public ResponseEntity<PaiementEnregistreResponse>
    enregistrerPaiement(
            @PathVariable Long demandeId,

            @Valid
            @RequestBody
            EnregistrerPaiementRequest requete,

            @AuthenticationPrincipal
            Jwt jwt
    ) {
        PaiementEnregistreResponse reponse =
                paiementEnregistrementService.enregistrer(
                        demandeId,
                        requete,
                        obtenirUtilisateurId(jwt)
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(reponse);
    }
    private Long obtenirUtilisateurId(Jwt jwt) {
        Number utilisateurId = jwt.getClaim("userId");

        if (utilisateurId == null) {
            throw new IllegalStateException(
                    "Le JWT ne contient pas l'identifiant utilisateur"
            );
        }

        return utilisateurId.longValue();
    }
}