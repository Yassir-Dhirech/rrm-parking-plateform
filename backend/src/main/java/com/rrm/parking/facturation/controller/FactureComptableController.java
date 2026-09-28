package com.rrm.parking.facturation.controller;

import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.dto.response.FacturesComptableResponse;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.service.FacturePdfService;
import com.rrm.parking.facturation.service.FacturationService;
import com.rrm.parking.paiement.enums.ModePaiement;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/comptable/factures")
@PreAuthorize("hasRole('COMPTABLE')")
@RequiredArgsConstructor
public class FactureComptableController {

    private final FacturationService facturationService;
    private final FacturePdfService facturePdfService;

    @GetMapping
    public ResponseEntity<FacturesComptableResponse> lister(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int taille,
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutFacture statut,
            @RequestParam(required = false) ModePaiement modePaiement,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin
    ) {
        return ResponseEntity.ok(facturationService.listerFactures(
                page, taille, recherche, statut, modePaiement, dateDebut, dateFin
        ));
    }

    @GetMapping("/{factureId}")
    public ResponseEntity<FactureResponse> consulter(@PathVariable Long factureId) {
        return ResponseEntity.ok(facturationService.consulter(factureId));
    }

    @GetMapping(value = "/{factureId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> telechargerPdf(@PathVariable Long factureId) {
        FactureResponse facture = facturationService.consulter(factureId);
        byte[] pdf = facturePdfService.generer(factureId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(facture.numero() + ".pdf", StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
