package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.DemandeAbonnementRegulierRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.service.DemandeAbonnementRegulierService;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.service.OtpValidationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(
        "/api/public/demandes/abonnements-reguliers"
)
@RequiredArgsConstructor
public class DemandeAbonnementRegulierController {

    private final DemandeAbonnementRegulierService
            demandeAbonnementRegulierService;

    private final OtpValidationService otpValidationService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<
            DemandeAbonnementRegulierResponse
            > creer(
            @Valid
            @RequestPart("demande")
            DemandeAbonnementRegulierRequest demande,

            @RequestPart("cinRecto")
            MultipartFile cinRecto,

            @RequestPart("cinVerso")
            MultipartFile cinVerso,

            @RequestPart("carteGriseRecto")
            MultipartFile carteGriseRecto,

            @RequestPart("carteGriseVerso")
            MultipartFile carteGriseVerso
    ) {
        DemandeAbonnementRegulierResponse response =
                demandeAbonnementRegulierService.creer(
                        demande,
                        cinRecto,
                        cinVerso,
                        carteGriseRecto,
                        carteGriseVerso
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/{reference}/otp/validation")
    public ResponseEntity<ValidationOtpResponse> validerOtp(
            @PathVariable String reference,
            @Valid @RequestBody
            ValidationOtpRequest request
    ) {
        ValidationOtpResponse response =
                otpValidationService.valider(
                        reference,
                        request
                );

        return ResponseEntity.ok(response);
    }
}