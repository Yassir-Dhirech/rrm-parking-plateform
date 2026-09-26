package com.rrm.parking.demande.controller;

import com.rrm.parking.contrat.service.ContratCorporatePdfService;
import com.rrm.parking.demande.dto.request.RefusDemandeCorporateRequest;
import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.demande.dto.response.DecisionCorporateResponse;
import com.rrm.parking.demande.dto.response.ConvocationCorporateResponse;
import com.rrm.parking.demande.dto.response.DemandeCorporateDetailResponse;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.service.DemandeCorporateResponsableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/demandes/corporate/responsable")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
public class DemandeCorporateResponsableController {

    private final DemandeCorporateResponsableService responsableService;
    private final ContratCorporatePdfService contratPdfService;

    @GetMapping("/a-valider")
    public ResponseEntity<List<DemandeRechercheResponse>> lister(
            @RequestParam(required = false) String recherche,
            @RequestParam(defaultValue = "ANCIEN") String ordre
    ) {
        return ResponseEntity.ok(responsableService.lister(recherche, ordre));
    }

    @GetMapping("/{demandeId}")
    public ResponseEntity<DemandeCorporateDetailResponse> consulter(
            @PathVariable Long demandeId
    ) {
        return ResponseEntity.ok(responsableService.consulter(demandeId));
    }

    @PostMapping("/{demandeId}/validation")
    public ResponseEntity<DecisionCorporateResponse> valider(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.valider(demandeId, utilisateurId(jwt))
        );
    }

    @PostMapping("/{demandeId}/refus")
    public ResponseEntity<DecisionCorporateResponse> refuser(
            @PathVariable Long demandeId,
            @Valid @RequestBody RefusDemandeCorporateRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.refuser(
                        demandeId,
                        utilisateurId(jwt),
                        requete.motif()
                )
        );
    }

    @PostMapping("/{demandeId}/convocation")
    public ResponseEntity<ConvocationCorporateResponse> convoquer(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.convoquer(
                        demandeId,
                        utilisateurId(jwt)
                )
        );
    }

    @PostMapping("/{demandeId}/paiement-cheque")
    public ResponseEntity<DemandeCorporateDetailResponse> enregistrerPaiement(
            @PathVariable Long demandeId,
            @RequestBody EnregistrementPaiementRequest requete,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.enregistrerPaiement(
                        demandeId,
                        utilisateurId(jwt),
                        requete
                )
        );
    }

    @PostMapping("/{demandeId}/retour-contrat-legalise")
    public ResponseEntity<DemandeCorporateDetailResponse> declarerRetourContrat(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.declarerRetourContrat(
                        demandeId,
                        utilisateurId(jwt)
                )
        );
    }

    @PostMapping("/{demandeId}/facturation")
    public ResponseEntity<DemandeCorporateDetailResponse> genererFacture(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.genererFactureEtCartes(
                        demandeId,
                        utilisateurId(jwt)
                )
        );
    }

    @PostMapping("/{demandeId}/finalisation")
    public ResponseEntity<DemandeCorporateDetailResponse> finaliser(
            @PathVariable Long demandeId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                responsableService.finaliser(
                        demandeId,
                        utilisateurId(jwt)
                )
        );
    }

    @GetMapping(value = "/{demandeId}/contrat/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> telechargerContrat(
            @PathVariable Long demandeId
    ) {
        DemandeCorporateDetailResponse demande = responsableService.consulter(demandeId);
        byte[] pdf = contratPdfService.generer(demandeId);
        String nom = (demande.referenceContrat() == null
                ? "contrat-corporate"
                : demande.referenceContrat()) + ".pdf";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(nom, StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    private Long utilisateurId(Jwt jwt) {
        Number valeur = jwt.getClaim("userId");
        if (valeur == null) {
            throw new IllegalStateException(
                    "Le jeton ne contient pas l'identifiant utilisateur"
            );
        }
        return valeur.longValue();
    }
}
