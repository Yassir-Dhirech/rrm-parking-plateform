package com.rrm.parking.carte.corporate;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responsable/cartes-corporate/echeances")
@PreAuthorize("hasRole('RESPONSABLE_STATIONNEMENT')")
@RequiredArgsConstructor
public class EcheanceCarteCorporateController {
    private final EcheanceCarteCorporateService service;
    private final NotificationEcheanceCorporateService notifications;

    @GetMapping
    public EcheanceCarteCorporateResponse lister() { return service.lister(); }

    @GetMapping("/notifications")
    public List<NotificationEcheanceCorporateService.Alerte> notifications(@AuthenticationPrincipal Jwt jwt) {
        return notifications.lister(utilisateurId(jwt));
    }

    @PostMapping("/notifications/{id}/lecture")
    public void marquerLue(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        notifications.marquerLue(utilisateurId(jwt), id);
    }

    @PostMapping("/notifications/lecture-totale")
    public void toutMarquerLu(@AuthenticationPrincipal Jwt jwt) {
        notifications.toutMarquerLu(utilisateurId(jwt));
    }

    @DeleteMapping("/notifications/{id}")
    public void masquer(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        notifications.masquer(utilisateurId(jwt), id);
    }

    @DeleteMapping("/notifications")
    public void toutMasquer(@AuthenticationPrincipal Jwt jwt) {
        notifications.toutMasquer(utilisateurId(jwt));
    }

    @PostMapping("/cartes/{carteId}/demande")
    public EcheanceCarteCorporateResponse.Dossier generer(@PathVariable Long carteId,
                                                            @AuthenticationPrincipal Jwt jwt) {
        return service.genererDemande(carteId, utilisateurId(jwt));
    }

    @PostMapping("/{dossierId}/cloture")
    public EcheanceCarteCorporateResponse.Dossier cloturer(@PathVariable Long dossierId,
                                                             @AuthenticationPrincipal Jwt jwt) {
        return service.cloturer(dossierId, utilisateurId(jwt));
    }

    private Long utilisateurId(Jwt jwt) {
        Number id = jwt.getClaim("userId");
        if (id == null) throw new IllegalStateException("Identifiant utilisateur absent du jeton");
        return id.longValue();
    }
}
