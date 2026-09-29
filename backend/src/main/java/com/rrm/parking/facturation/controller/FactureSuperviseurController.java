package com.rrm.parking.facturation.controller;

import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.dto.response.FacturesComptableResponse;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.service.FacturePdfService;
import com.rrm.parking.facturation.service.FacturationService;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superviseur/factures")
@PreAuthorize("hasRole('SUPERVISEUR')")
@RequiredArgsConstructor
public class FactureSuperviseurController {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");

    private final FacturationService facturationService;
    private final FacturePdfService facturePdfService;
    private final AffectationAgentParkingRepository affectations;

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
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(facturationService.listerFactures(
                page, taille, recherche, statut, modePaiement, dateDebut, dateFin,
                parkingsAutorises(jwt)));
    }

    @GetMapping("/{factureId}")
    public ResponseEntity<FactureResponse> consulter(
            @PathVariable Long factureId, @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(facturationService.consulterPourParkings(
                factureId, parkingsAutorises(jwt)));
    }

    @GetMapping(value = "/{factureId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> telechargerPdf(
            @PathVariable Long factureId, @AuthenticationPrincipal Jwt jwt
    ) {
        FactureResponse facture = facturationService.consulterPourParkings(
                factureId, parkingsAutorises(jwt));
        byte[] pdf = facturePdfService.generer(factureId);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(facture.numero() + ".pdf", StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    private Set<Long> parkingsAutorises(Jwt jwt) {
        Number utilisateurId = jwt.getClaim("userId");
        if (utilisateurId == null) {
            throw new IllegalStateException("Le jeton ne contient pas l'identifiant utilisateur");
        }
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        return affectations.findAllByUtilisateurIdAndActiveTrue(utilisateurId.longValue()).stream()
                .filter(a -> a.getDateDebut() != null && !a.getDateDebut().isAfter(aujourdHui))
                .filter(a -> a.getDateFin() == null || !a.getDateFin().isBefore(aujourdHui))
                .map(a -> a.getParking().getId())
                .collect(Collectors.toSet());
    }
}
