package com.rrm.parking.carte.event;

import java.time.LocalDate;

public record CarteActiveeEvent(
        Long factureId,
        String referenceDemande,
        String referenceCarte,
        String email,
        String nomClient,
        boolean renouvellement,
        LocalDate dateDebut,
        LocalDate dateFin
) {
}
