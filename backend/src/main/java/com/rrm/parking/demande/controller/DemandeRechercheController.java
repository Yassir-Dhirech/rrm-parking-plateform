package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.service.DemandeRechercheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
public class DemandeRechercheController {

    private final DemandeRechercheService
            demandeRechercheService;

    @GetMapping("/recherche")
    @PreAuthorize(
            "hasAuthority('DEMANDE_CONSULTER')"
    )
    public ResponseEntity<List<DemandeRechercheResponse>>
    rechercher(
            @RequestParam(required = false)
            String reference,

            @RequestParam(required = false)
            String cin
    ) {
        return ResponseEntity.ok(
                demandeRechercheService.rechercher(
                        reference,
                        cin
                )
        );
    }

    @GetMapping("/en-attente-paiement")
    @PreAuthorize(
            "hasAuthority('DEMANDE_CONSULTER')"
    )
    public ResponseEntity<List<DemandeRechercheResponse>>
    listerEnAttentePaiement() {

        return ResponseEntity.ok(
                demandeRechercheService
                        .listerDemandesEnAttentePaiement()
        );
    }
}