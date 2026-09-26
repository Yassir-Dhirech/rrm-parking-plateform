package com.rrm.parking.demande.controller;

import com.rrm.parking.demande.dto.request.ModificationDemandeReguliereRequest;
import com.rrm.parking.demande.dto.response.DemandeDetailResponse;
import com.rrm.parking.demande.service.ModificationDemandeAgentService;
import com.rrm.parking.document.enums.TypePieceJointe;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/agent/demandes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
public class ModificationDemandeAgentController {

    private final ModificationDemandeAgentService service;

    @PutMapping(
            value = "/{demandeId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public DemandeDetailResponse modifier(
            @PathVariable Long demandeId,
            @Valid @RequestPart("demande") ModificationDemandeReguliereRequest demande,
            @RequestPart(value = "cinRecto", required = false) MultipartFile cinRecto,
            @RequestPart(value = "cinVerso", required = false) MultipartFile cinVerso,
            @RequestPart(value = "carteGriseRecto", required = false) MultipartFile carteGriseRecto,
            @RequestPart(value = "carteGriseVerso", required = false) MultipartFile carteGriseVerso,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Map<TypePieceJointe, MultipartFile> documents =
                new EnumMap<>(TypePieceJointe.class);
        ajouter(documents, TypePieceJointe.CIN_RECTO, cinRecto);
        ajouter(documents, TypePieceJointe.CIN_VERSO, cinVerso);
        ajouter(documents, TypePieceJointe.CARTE_GRISE_RECTO, carteGriseRecto);
        ajouter(documents, TypePieceJointe.CARTE_GRISE_VERSO, carteGriseVerso);
        Number utilisateurId = jwt.getClaim("userId");
        if (utilisateurId == null) {
            throw new IllegalStateException("Le jeton ne contient pas l'identifiant utilisateur");
        }
        return service.modifier(
                demandeId,
                demande,
                documents,
                utilisateurId.longValue()
        );
    }

    private void ajouter(
            Map<TypePieceJointe, MultipartFile> documents,
            TypePieceJointe type,
            MultipartFile fichier
    ) {
        if (fichier != null && !fichier.isEmpty()) {
            documents.put(type, fichier);
        }
    }
}
