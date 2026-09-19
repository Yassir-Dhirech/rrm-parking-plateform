package com.rrm.parking.carte.event;

public record CarteActiveeEvent(
        Long factureId,
        String referenceDemande,
        String referenceCarte,
        String email,
        String nomClient
) {
}
