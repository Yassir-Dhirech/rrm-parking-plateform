package com.rrm.parking.client.controller;

import com.rrm.parking.client.dto.response.BaseClientsResponse;
import com.rrm.parking.client.enums.StatutClient;
import com.rrm.parking.client.service.BaseClientsSuperviseurService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/superviseur/clients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERVISEUR')")
public class BaseClientsSuperviseurController {
    private final BaseClientsSuperviseurService service;

    @GetMapping("/reguliers")
    public BaseClientsResponse.PageResult<BaseClientsResponse.ParticulierListe> reguliers(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutClient statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int taille) {
        return service.particuliers(utilisateurId(jwt), recherche, statut, dateDebut, dateFin, page, taille);
    }

    @GetMapping("/reguliers/{id}")
    public BaseClientsResponse.ParticulierDetail regulier(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.particulier(utilisateurId(jwt), id);
    }

    @GetMapping("/corporate")
    public BaseClientsResponse.PageResult<BaseClientsResponse.EntrepriseListe> corporate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutClient statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int taille) {
        return service.entreprises(utilisateurId(jwt), recherche, statut, dateDebut, dateFin, page, taille);
    }

    @GetMapping("/corporate/{id}")
    public BaseClientsResponse.EntrepriseDetail entreprise(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.entreprise(utilisateurId(jwt), id);
    }

    private Long utilisateurId(Jwt jwt) {
        Number id = jwt.getClaim("userId");
        if (id == null) throw new IllegalStateException("Le jeton ne contient pas l'identifiant utilisateur");
        return id.longValue();
    }
}
