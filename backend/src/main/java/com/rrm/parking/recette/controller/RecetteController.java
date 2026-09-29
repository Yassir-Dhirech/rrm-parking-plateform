package com.rrm.parking.recette.controller;

import com.rrm.parking.recette.dto.PaiementDisponibleDto;
import com.rrm.parking.recette.dto.RecetteDto;
import com.rrm.parking.recette.service.RecetteService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recettes")
@RequiredArgsConstructor
public class RecetteController {
    private final RecetteService service;
    private Long user(Jwt jwt) { return ((Number) jwt.getClaim("userId")).longValue(); }

    @GetMapping("/parkings")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public List<RecetteService.ParkingAutorise> parkings(@AuthenticationPrincipal Jwt jwt) {
        return service.parkingsAutorises(user(jwt));
    }
    @GetMapping("/paiements-disponibles")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public List<PaiementDisponibleDto> disponibles(@RequestParam Long parkingId, @RequestParam LocalDate dateArret,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return service.disponibles(parkingId, dateArret, user(jwt));
    }
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISEUR','COMPTABLE','RESPONSABLE_STATIONNEMENT','ADMINISTRATEUR_SI')")
    public List<RecetteDto> lister(@AuthenticationPrincipal Jwt jwt) { return service.lister(user(jwt)); }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISEUR','COMPTABLE','RESPONSABLE_STATIONNEMENT','ADMINISTRATEUR_SI')")
    public RecetteDto detail(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) { return service.detail(id, user(jwt)); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public RecetteDto creer(@Valid @RequestBody RecetteService.CreerRequest req, @AuthenticationPrincipal Jwt jwt) {
        return service.creer(req, user(jwt));
    }
    @PostMapping("/{id}/transmettre")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public RecetteDto transmettre(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) { return service.transmettre(id, user(jwt)); }
    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public RecetteDto annuler(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) { return service.annuler(id, user(jwt)); }
    @PostMapping("/{id}/receptionner")
    @PreAuthorize("hasRole('COMPTABLE')")
    public RecetteDto receptionner(@PathVariable Long id, @Valid @RequestBody RecetteService.ReceptionRequest req,
                                   @AuthenticationPrincipal Jwt jwt) { return service.receptionner(id, req, user(jwt)); }
    @GetMapping("/{id}/excel")
    @PreAuthorize("hasAnyRole('SUPERVISEUR','COMPTABLE','RESPONSABLE_STATIONNEMENT','ADMINISTRATEUR_SI')")
    public ResponseEntity<byte[]> excel(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) throws IOException {
        var r = service.autoriserLecture(id, user(jwt));
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=recette-" + r.getReference() + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(service.excel(id, user(jwt)));
    }
    @GetMapping("/{id}/accuse")
    @PreAuthorize("hasAnyRole('SUPERVISEUR','COMPTABLE','RESPONSABLE_STATIONNEMENT','ADMINISTRATEUR_SI')")
    public ResponseEntity<byte[]> accuse(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) throws IOException {
        var r = service.autoriserLecture(id, user(jwt));
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=accuse-" + r.getReference() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF).body(service.accuse(id, user(jwt)));
    }
}
