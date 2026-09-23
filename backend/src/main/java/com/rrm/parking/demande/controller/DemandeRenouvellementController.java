package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.DemandeRenouvellementRequest;
import com.rrm.parking.demande.dto.request.RechercheRenouvellementRequest;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.dto.response.RenouvellementConsultationResponse;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.service.DemandeRenouvellementService;
import com.rrm.parking.demande.service.OtpValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/demandes/renouvellements")
@RequiredArgsConstructor
public class DemandeRenouvellementController {

    private final DemandeRenouvellementService renouvellementService;
    private final OtpValidationService otpValidationService;

    @PostMapping("/recherche")
    public ResponseEntity<RenouvellementConsultationResponse> rechercher(
            @Valid @RequestBody RechercheRenouvellementRequest requete
    ) {
        return ResponseEntity.ok(renouvellementService.rechercher(requete));
    }

    @PostMapping
    public ResponseEntity<DemandeAbonnementRegulierResponse> creer(
            @Valid @RequestBody DemandeRenouvellementRequest requete
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(renouvellementService.creer(requete));
    }

    @PostMapping("/{reference}/otp/renvoi")
    public ResponseEntity<DemandeAbonnementRegulierResponse> renvoyerOtp(
            @PathVariable String reference
    ) {
        return ResponseEntity.ok(
                renouvellementService.renvoyerOtp(reference)
        );
    }

    @PostMapping("/{reference}/otp/validation")
    public ResponseEntity<ValidationOtpResponse> validerOtp(
            @PathVariable String reference,
            @Valid @RequestBody ValidationOtpRequest requete
    ) {
        return ResponseEntity.ok(
                otpValidationService.valider(reference, requete)
        );
    }
}