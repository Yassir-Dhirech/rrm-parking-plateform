package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.DemandeCorporateRequest;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.DemandeCorporateResponse;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.service.DemandeCorporateService;
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
@RequestMapping("/api/public/demandes/corporate")
@RequiredArgsConstructor
public class DemandeCorporateController {

    private final DemandeCorporateService demandeCorporateService;
    private final OtpValidationService otpValidationService;

    @PostMapping
    public ResponseEntity<DemandeCorporateResponse> creer(
            @Valid @RequestBody DemandeCorporateRequest requete
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(demandeCorporateService.creer(requete));
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
