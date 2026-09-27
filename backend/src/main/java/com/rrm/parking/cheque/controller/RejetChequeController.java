package com.rrm.parking.cheque.controller;

import com.rrm.parking.cheque.dto.ChequeCandidatResponse;
import com.rrm.parking.cheque.dto.DeclarationRejetChequeRequest;
import com.rrm.parking.cheque.dto.DossierRejetChequeResponse;
import com.rrm.parking.cheque.dto.OperationRejetChequeResponse;
import com.rrm.parking.cheque.dto.RegularisationChequeRequest;
import com.rrm.parking.cheque.dto.NotificationRejetResponse;
import com.rrm.parking.cheque.service.RejetChequeService;
import com.rrm.parking.cheque.service.DocumentCorrectifPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rejets-cheques")
@RequiredArgsConstructor
public class RejetChequeController {
    private final RejetChequeService service;
    private final DocumentCorrectifPdfService documents;

    @GetMapping("/cheques")
    @PreAuthorize("hasRole('COMPTABLE')")
    public Page<ChequeCandidatResponse> rechercher(
            @RequestParam(required = false) String recherche,
            @RequestParam(defaultValue = "0") int page) {
        return service.rechercher(recherche, page);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPTABLE')")
    public ResponseEntity<DossierRejetChequeResponse> declarer(
            @Valid @RequestBody DeclarationRejetChequeRequest requete,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.declarer(requete, utilisateurId(jwt)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPTABLE','RESPONSABLE_STATIONNEMENT','SUPERVISEUR','AGENT_ADMINISTRATIF')")
    public List<DossierRejetChequeResponse> lister(Authentication authentication,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_AGENT_ADMINISTRATIF"))
                ? service.listerPourAgent(utilisateurId(jwt)) : service.lister();
    }

    @GetMapping("/notifications")
    @PreAuthorize("hasAnyRole('COMPTABLE','RESPONSABLE_STATIONNEMENT','SUPERVISEUR','AGENT_ADMINISTRATIF')")
    public List<NotificationRejetResponse> notifications(@AuthenticationPrincipal Jwt jwt) {
        return service.notificationsPourUtilisateur(utilisateurId(jwt));
    }

    @GetMapping(value = "/{dossierId}/document-correctif", produces = "application/pdf")
    @PreAuthorize("hasAnyRole('COMPTABLE','RESPONSABLE_STATIONNEMENT')")
    public ResponseEntity<byte[]> documentCorrectif(@PathVariable Long dossierId) {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=document-correctif-" + dossierId + ".pdf")
                .body(documents.generer(dossierId));
    }

    @GetMapping("/{dossierId}/operations-a-bloquer")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public List<OperationRejetChequeResponse> operationsABloquer(@PathVariable Long dossierId) {
        return service.operationsABloquer(dossierId);
    }

    @GetMapping("/{dossierId}/operations-a-reactiver")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public List<OperationRejetChequeResponse> operationsAReactiver(@PathVariable Long dossierId) {
        return service.operationsAReactiver(dossierId);
    }

    @PostMapping("/{dossierId}/valider")
    @PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
    public DossierRejetChequeResponse valider(
            @PathVariable Long dossierId, @AuthenticationPrincipal Jwt jwt) {
        return service.valider(dossierId, utilisateurId(jwt));
    }

    @PostMapping("/{dossierId}/operations/{operationId}/blocage-termine")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public DossierRejetChequeResponse confirmerBlocage(
            @PathVariable Long dossierId, @PathVariable Long operationId,
            @AuthenticationPrincipal Jwt jwt) {
        return service.confirmerBlocageCarte(dossierId, operationId, utilisateurId(jwt));
    }

    @PostMapping("/{dossierId}/regulariser")
    @PreAuthorize("hasRole('AGENT_ADMINISTRATIF')")
    public DossierRejetChequeResponse regulariser(@PathVariable Long dossierId,
            @Valid @RequestBody RegularisationChequeRequest requete, @AuthenticationPrincipal Jwt jwt) {
        return service.regulariser(dossierId, requete, utilisateurId(jwt));
    }

    @PostMapping("/{dossierId}/reactiver")
    @PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
    public DossierRejetChequeResponse reactiver(@PathVariable Long dossierId, @AuthenticationPrincipal Jwt jwt) {
        return service.reactiver(dossierId, utilisateurId(jwt));
    }

    @PostMapping("/{dossierId}/operations/{operationId}/activation-terminee")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public DossierRejetChequeResponse confirmerActivation(@PathVariable Long dossierId,
            @PathVariable Long operationId, @AuthenticationPrincipal Jwt jwt) {
        return service.confirmerActivationCarte(dossierId, operationId, utilisateurId(jwt));
    }

    private Long utilisateurId(Jwt jwt) {
        Number id = jwt.getClaim("userId");
        if (id == null) {
            throw new IllegalStateException("Identifiant utilisateur absent du jeton");
        }
        return id.longValue();
    }
}
