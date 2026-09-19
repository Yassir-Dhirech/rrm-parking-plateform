package com.rrm.parking.demande.event;

public record CorrectionDemandeDemandeeEvent(
        String referenceDemande,
        String email,
        String nomClient,
        String motif
) {
}
