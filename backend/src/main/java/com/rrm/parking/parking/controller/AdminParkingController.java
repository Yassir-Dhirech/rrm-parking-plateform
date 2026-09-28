package com.rrm.parking.parking.controller;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/parkings")
@RequiredArgsConstructor
public class AdminParkingController {

    private final ParkingRepository parkingRepository;
    private final AuditLogRepository auditLogRepository;

    // 1. Lister tous les parkings réels depuis MySQL
    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminParkingDto> listerTous() {
        return parkingRepository.findAll().stream().map(this::versDto).toList();
    }

    // 2. Créer un nouveau parking directement en base
    @PostMapping
    @Transactional
    public ResponseEntity<?> creer(
            @RequestBody CreerParkingRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String code = req.code() != null && !req.code().isBlank()
                ? req.code().trim().toUpperCase(Locale.ROOT)
                : "PRK-" + System.currentTimeMillis();

        if (parkingRepository.existsByCodeIgnoreCase(code)) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Le code parking '" + code + "' existe déjà."));
        }

        Parking p = new Parking();
        p.setCode(code);
        p.setNom(req.nom().trim());
        p.setAdresse(req.adresse().trim());
        p.setCapaciteTotale(req.capaciteTotale() != null ? req.capaciteTotale() : 100);
        p.setCapaciteReserveeAbonnements(req.placesReserveesAbonnes() != null ? req.placesReserveesAbonnes() : 50);
        p.setLatitude(req.latitude() != null ? BigDecimal.valueOf(req.latitude()) : BigDecimal.valueOf(34.02088));
        p.setLongitude(req.longitude() != null ? BigDecimal.valueOf(req.longitude()) : BigDecimal.valueOf(-6.84165));
        p.setStatut(StatutParking.ACTIF);

        Parking sauve = parkingRepository.save(p);

        // Audit log
        try {
            auditLogRepository.save(new AuditLog(
                    null,
                    jwt != null ? jwt.getSubject() : "Admin",
                    sauve,
                    TypeActionAudit.CREATION,
                    ResultatAudit.SUCCES,
                    "PARKING",
                    sauve.getId(),
                    sauve.getNom(),
                    "Création du parking " + sauve.getNom(),
                    "Capacité: " + sauve.getCapaciteTotale() + " places",
                    null, null, "POST", "/api/admin/parkings", null
            ));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(versDto(sauve));
    }

    // 3. Modifier les caractéristiques d'un parking
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody MajParkingRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking introuvable"));

        if (req.nom() != null) p.setNom(req.nom().trim());
        if (req.adresse() != null) p.setAdresse(req.adresse().trim());
        if (req.capaciteTotale() != null) p.setCapaciteTotale(req.capaciteTotale());
        if (req.placesReserveesAbonnes() != null) p.setCapaciteReserveeAbonnements(req.placesReserveesAbonnes());
        if (req.latitude() != null) p.setLatitude(BigDecimal.valueOf(req.latitude()));
        if (req.longitude() != null) p.setLongitude(BigDecimal.valueOf(req.longitude()));

        Parking misAJour = parkingRepository.save(p);

        try {
            auditLogRepository.save(new AuditLog(
                    null,
                    jwt != null ? jwt.getSubject() : "Admin",
                    misAJour,
                    TypeActionAudit.MODIFICATION,
                    ResultatAudit.SUCCES,
                    "PARKING",
                    misAJour.getId(),
                    misAJour.getNom(),
                    "Modification du parking " + misAJour.getNom(),
                    "Motif: " + req.motifModification(),
                    null, null, "PUT", "/api/admin/parkings/" + id, null
            ));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(versDto(misAJour));
    }

    // 4. Verrouiller / Déverrouiller (Mode Maintenance)
    @PatchMapping("/{id}/verrouiller")
    @Transactional
    public ResponseEntity<?> toggleVerrouillage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking introuvable"));

        boolean verrouiller = Boolean.TRUE.equals(body.get("lock"));
        p.setStatut(verrouiller ? StatutParking.SUSPENDU : StatutParking.ACTIF);
        parkingRepository.save(p);

        return ResponseEntity.ok(Map.of("message", "Statut maintenance mis à jour", "verrouille", verrouiller));
    }

    // 5. Désactiver un parking
    @PatchMapping("/{id}/desactiver")
    @Transactional
    public ResponseEntity<?> desactiver(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking introuvable"));

        p.setStatut(StatutParking.ARCHIVE);
        parkingRepository.save(p);

        return ResponseEntity.ok(Map.of("message", "Parking désactivé"));
    }

    // 6. Supprimer un parking
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        parkingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Parking supprimé"));
    }

    private AdminParkingDto versDto(Parking p) {
        int capTotale = p.getCapaciteTotale() != null ? p.getCapaciteTotale() : 0;
        int capAbos = p.getCapaciteReserveeAbonnements() != null ? p.getCapaciteReserveeAbonnements() : 0;
        int quotaTickets = Math.max(0, capTotale - capAbos);
        boolean actif = p.getStatut() == StatutParking.ACTIF || p.getStatut() == StatutParking.SUSPENDU;
        boolean verrouille = p.getStatut() == StatutParking.SUSPENDU;

        return new AdminParkingDto(
                p.getId(),
                p.getCode(),
                p.getNom(),
                p.getAdresse(),
                capTotale,
                capAbos,
                quotaTickets,
                capAbos,
                Math.round(capAbos * 0.6),
                Math.round(capAbos * 0.4),
                actif,
                verrouille,
                p.getLatitude() != null ? p.getLatitude().doubleValue() : 34.02088,
                p.getLongitude() != null ? p.getLongitude().doubleValue() : -6.84165,
                p.getStatut().name()
        );
    }

    public record AdminParkingDto(
            Long id,
            String code,
            String nom,
            String adresse,
            int capaciteTotale,
            int placesReserveesAbonnes,
            int quotaTickets,
            int quotaAbonnementsTotal,
            double quotaCorporate,
            double quotaParticulier,
            boolean actif,
            boolean verrouille,
            double latitude,
            double longitude,
            String statut
    ) {}

    public record CreerParkingRequest(
            String code,
            String nom,
            String adresse,
            Integer capaciteTotale,
            Integer placesReserveesAbonnes,
            Double latitude,
            Double longitude
    ) {}

    public record MajParkingRequest(
            String nom,
            String adresse,
            Integer capaciteTotale,
            Integer placesReserveesAbonnes,
            Double latitude,
            Double longitude,
            String motifModification
    ) {}
}
