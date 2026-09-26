package com.rrm.parking.dashboard.dto.response;

import java.util.List;

public record AgentDashboardRechercheResponse(
        List<Resultat> resultats
) {
    public record Resultat(
            String type,
            Long id,
            String reference,
            String nomClient,
            String identifiantClient,
            String statut,
            String parkingNom,
            String lien
    ) { }
}
