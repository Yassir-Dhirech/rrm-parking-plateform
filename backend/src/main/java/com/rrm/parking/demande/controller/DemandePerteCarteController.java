package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.service.DemandePerteCarteService;
import com.rrm.parking.paiement.enums.ModePaiement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/demandes/perte-carte")
@RequiredArgsConstructor
public class DemandePerteCarteController {

    private final DemandePerteCarteService perteService;

    public record SaisieCinRequest(String cin) {}
    public record DeclarerPerteRequest(String cin, ModePaiement modePaiement) {}
    public record ValiderOtpRequest(String code) {}

    @PostMapping("/recherche")
    public ResponseEntity<DemandePerteCarteService.InfoCartePerdueDto> rechercher(@RequestBody SaisieCinRequest req) {
        return ResponseEntity.ok(perteService.rechercherParCin(req.cin()));
    }

    @PostMapping("/declarer")
    public ResponseEntity<DemandeAbonnementRegulierResponse> declarer(@RequestBody DeclarerPerteRequest req) {
        return ResponseEntity.ok(perteService.declarerPerteEtEnvoyerOtp(req.cin(), req.modePaiement()));
    }

    @PostMapping("/{reference}/otp/validation")
    public ResponseEntity<ValidationOtpResponse> validerOtp(@PathVariable String reference, @RequestBody ValiderOtpRequest req) {
        return ResponseEntity.ok(perteService.validerOtpEtSuspendreCarte(reference, req.code()));
    }
}
