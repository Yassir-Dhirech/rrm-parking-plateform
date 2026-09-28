package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.ModificationDemandeReguliereRequest;
import com.rrm.parking.demande.dto.response.SuiviDemandePublicResponse;
import com.rrm.parking.demande.service.SuiviDemandePublicService;
import com.rrm.parking.document.enums.TypePieceJointe;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumMap;
import java.util.Map;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/public/demandes/suivi")
public class SuiviDemandePublicController {
    private final SuiviDemandePublicService suivi;

    public record Reference(@NotBlank @Size(max = 60) String reference) {}

    @PostMapping
    public SuiviDemandePublicResponse consulter(@Valid @RequestBody Reference requete) {
        return suivi.consulter(requete.reference());
    }

    @PostMapping("/{reference}/modification/otp")
    public void envoyerCode(@PathVariable String reference) {
        suivi.demanderCode(reference);
    }

    @PutMapping(value = "/{reference}/modification", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SuiviDemandePublicResponse enregistrer(@PathVariable String reference,
            @RequestPart("code") String code,
            @Valid @RequestPart("demande") ModificationDemandeReguliereRequest requete,
            @RequestPart(value = "cinRecto", required = false) MultipartFile cinRecto,
            @RequestPart(value = "cinVerso", required = false) MultipartFile cinVerso,
            @RequestPart(value = "carteGriseRecto", required = false) MultipartFile carteGriseRecto,
            @RequestPart(value = "carteGriseVerso", required = false) MultipartFile carteGriseVerso) {
        Map<TypePieceJointe, MultipartFile> fichiers = new EnumMap<>(TypePieceJointe.class);
        if (cinRecto != null && !cinRecto.isEmpty()) fichiers.put(TypePieceJointe.CIN_RECTO, cinRecto);
        if (cinVerso != null && !cinVerso.isEmpty()) fichiers.put(TypePieceJointe.CIN_VERSO, cinVerso);
        if (carteGriseRecto != null && !carteGriseRecto.isEmpty()) fichiers.put(TypePieceJointe.CARTE_GRISE_RECTO, carteGriseRecto);
        if (carteGriseVerso != null && !carteGriseVerso.isEmpty()) fichiers.put(TypePieceJointe.CARTE_GRISE_VERSO, carteGriseVerso);
        return suivi.enregistrer(reference, code, requete, fichiers);
    }
}
