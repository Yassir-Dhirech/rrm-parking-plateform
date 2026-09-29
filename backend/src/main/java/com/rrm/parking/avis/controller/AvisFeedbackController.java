package com.rrm.parking.avis.controller;

import com.rrm.parking.avis.dto.AvisResponse;
import com.rrm.parking.avis.dto.CreerAvisRequest;
import com.rrm.parking.avis.service.AvisFeedbackService;
import com.rrm.parking.avis.service.RapportAvisPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
public class AvisFeedbackController {
    private final AvisFeedbackService avis;
    private final RapportAvisPdfService rapport;

    @PostMapping("/api/public/avis")
    public ResponseEntity<AvisResponse.Detail> creer(@Valid @RequestBody CreerAvisRequest requete) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avis.creer(requete));
    }

    @GetMapping("/api/responsable/avis")
    @PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
    public Page<AvisResponse.Detail> lister(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int taille) {
        if (page < 0 || taille < 1 || taille > 100) {
            throw new IllegalArgumentException("Pagination invalide");
        }
        return avis.lister(page, taille);
    }

    @GetMapping("/api/responsable/avis/statistiques")
    @PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
    public AvisResponse.Statistiques statistiques() {
        return avis.statistiques();
    }

    @GetMapping(value = "/api/responsable/avis/rapport", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
    public ResponseEntity<byte[]> rapport() {
        byte[] pdf = rapport.generer();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-avis-rrm.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
