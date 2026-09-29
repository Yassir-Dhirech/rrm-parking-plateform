package com.rrm.parking.notification.controller;

import com.rrm.parking.notification.dto.NotificationSuperviseurResponse;
import com.rrm.parking.notification.service.NotificationsSuperviseurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/superviseur/notifications")
@PreAuthorize("hasRole('SUPERVISEUR')")
@RequiredArgsConstructor
public class NotificationsSuperviseurController {
    private final NotificationsSuperviseurService service;

    @GetMapping
    public List<NotificationSuperviseurResponse> lister(@AuthenticationPrincipal Jwt jwt) {
        return service.lister(utilisateurId(jwt));
    }

    @PostMapping("/{id}/lecture")
    public ResponseEntity<Void> marquerLue(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        service.marquerLue(utilisateurId(jwt), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lecture-totale")
    public ResponseEntity<Void> toutMarquerLu(@AuthenticationPrincipal Jwt jwt) {
        service.toutMarquerLu(utilisateurId(jwt));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> masquer(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        service.masquer(utilisateurId(jwt), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> toutMasquer(@AuthenticationPrincipal Jwt jwt) {
        service.toutMasquer(utilisateurId(jwt));
        return ResponseEntity.noContent().build();
    }

    private Long utilisateurId(Jwt jwt) {
        Number id = jwt.getClaim("userId");
        if (id == null) throw new IllegalStateException("Le jeton ne contient pas l'identifiant utilisateur");
        return id.longValue();
    }
}
