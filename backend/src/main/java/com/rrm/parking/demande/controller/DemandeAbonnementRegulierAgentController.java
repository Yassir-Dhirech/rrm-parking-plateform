package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.DemandeAbonnementRegulierRequest;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.service.DemandeAbonnementRegulierService;
import com.rrm.parking.demande.service.OtpValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/agent/demandes/abonnements-reguliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
public class DemandeAbonnementRegulierAgentController {

    private final DemandeAbonnementRegulierService service;
    private final OtpValidationService otpValidationService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<DemandeAbonnementRegulierResponse> creer(
            @Valid @RequestPart("demande")
            DemandeAbonnementRegulierRequest demande,
            @RequestPart("cinRecto") MultipartFile cinRecto,
            @RequestPart("cinVerso") MultipartFile cinVerso,
            @RequestPart("carteGriseRecto") MultipartFile carteGriseRecto,
            @RequestPart("carteGriseVerso") MultipartFile carteGriseVerso,
            @AuthenticationPrincipal Jwt jwt
    ) {
        DemandeAbonnementRegulierResponse response =
                service.creerAssisteeParAgent(
                        demande,
                        cinRecto,
                        cinVerso,
                        carteGriseRecto,
                        carteGriseVerso,
                        extraireUtilisateurId(jwt)
                );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{reference}/otp/validation")
    public ResponseEntity<ValidationOtpResponse> validerOtp(
            @PathVariable String reference,
            @Valid @RequestBody ValidationOtpRequest request
    ) {
        return ResponseEntity.ok(
                otpValidationService.valider(reference, request)
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
