package com.rrm.parking.dashboard.controller;

import com.rrm.parking.dashboard.dto.response.AnalyseCaResponse;
import com.rrm.parking.dashboard.service.AnalyseCaExcelService;
import com.rrm.parking.dashboard.service.AnalyseCaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/comptable/analyse-ca")
@PreAuthorize("hasRole('COMPTABLE')")
@RequiredArgsConstructor
public class AnalyseCaComptableController {
    private final AnalyseCaService analyse;
    private final AnalyseCaExcelService excel;

    @GetMapping("/periode")
    public AnalyseCaResponse.Periode periode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return analyse.periode(dateDebut, dateFin);
    }

    @GetMapping("/mensuel")
    public AnalyseCaResponse.Annee mensuel(@RequestParam int annee) {
        return analyse.annee(annee);
    }

    @GetMapping(value = "/excel", produces =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> excel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dateFin,
            @RequestParam int annee,
            @RequestParam AnalyseCaExcelService.Tableaux tableaux) {
        String nom = "analyse-ca-" + annee + "-" + tableaux.name().toLowerCase() + ".xlsx";
        byte[] fichier = excel.generer(dateDebut, dateFin, annee, tableaux);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(nom, StandardCharsets.UTF_8).build().toString())
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(fichier.length)
                .body(fichier);
    }
}
