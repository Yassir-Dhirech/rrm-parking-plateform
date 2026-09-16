package com.rrm.parking.facturation.controller;

import com.rrm.parking.facturation.dto.response.RecuEmailResponse;
import com.rrm.parking.facturation.service.RecuEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recus")
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class RecuEmailController {

    private final RecuEmailService recuEmailService;

    @PostMapping("/{recuId}/envoyer-email")
    @PreAuthorize("""
            hasAnyAuthority(
                'PAIEMENT_ENREGISTRER',
                'DEMANDE_VALIDER'
            )
            """)
    public ResponseEntity<RecuEmailResponse> envoyerParEmail(
            @PathVariable Long recuId
    ) {
        return ResponseEntity.ok(
                recuEmailService.envoyer(recuId)
        );
    }
}
