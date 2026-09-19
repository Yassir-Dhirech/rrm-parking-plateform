package com.rrm.parking.facturation.controller;

import com.rrm.parking.demande.dto.response.DemandeFacturationResponse;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.service.FacturePdfService;
import com.rrm.parking.facturation.service.FacturationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
public class FacturationController {

    private final FacturationService facturationService;
    private final FacturePdfService facturePdfService;

    @GetMapping("/demandes-validees")
    public ResponseEntity<List<DemandeFacturationResponse>>
    listerDemandesValidees(
            @RequestParam(required = false) String recherche,
            @RequestParam(defaultValue = "ANCIEN") String ordre
    ) {
        return ResponseEntity.ok(
                facturationService.listerDemandesValidees(
                        recherche,
                        ordre
                )
        );
    }

    @PostMapping("/demandes/{demandeId}")
    public ResponseEntity<FactureResponse> generer(
            @PathVariable Long demandeId
    ) {
        return ResponseEntity.ok(
                facturationService.genererPourDemande(demandeId)
        );
    }

    @GetMapping("/{factureId}")
    public ResponseEntity<FactureResponse> consulter(
            @PathVariable Long factureId
    ) {
        return ResponseEntity.ok(
                facturationService.consulter(factureId)
        );
    }

    @GetMapping(
            value = "/{factureId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> telechargerPdf(
            @PathVariable Long factureId
    ) {
        FactureResponse facture = facturationService.consulter(factureId);
        byte[] pdf = facturePdfService.generer(factureId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(
                        facture.numero() + ".pdf",
                        StandardCharsets.UTF_8
                )
                .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
