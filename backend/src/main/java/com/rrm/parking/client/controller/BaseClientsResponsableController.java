package com.rrm.parking.client.controller;

import com.rrm.parking.client.dto.response.BaseClientsResponse;
import com.rrm.parking.client.enums.StatutClient;
import com.rrm.parking.client.service.BaseClientsResponsableService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/base-clients", "/api/responsable/clients"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_COMPTABLE')")
public class BaseClientsResponsableController {

    private final BaseClientsResponsableService service;

    @GetMapping("/reguliers")
    public BaseClientsResponse.PageResult<BaseClientsResponse.ParticulierListe> reguliers(
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutClient statut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int taille
    ) {
        return service.particuliers(recherche, statut, dateDebut, dateFin, page, taille);
    }

    @GetMapping("/reguliers/{id}")
    public BaseClientsResponse.ParticulierDetail regulier(@PathVariable Long id) {
        return service.particulier(id);
    }

    @GetMapping("/corporate")
    public BaseClientsResponse.PageResult<BaseClientsResponse.EntrepriseListe> corporate(
            @RequestParam(required = false) String recherche,
            @RequestParam(required = false) StatutClient statut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int taille
    ) {
        return service.entreprises(recherche, statut, dateDebut, dateFin, page, taille);
    }

    @GetMapping("/corporate/{id}")
    public BaseClientsResponse.EntrepriseDetail entreprise(@PathVariable Long id) {
        return service.entreprise(id);
    }
}
