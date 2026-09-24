package com.rrm.parking.demande.event;

public record DemandeCorporateRefuseeEvent(
        String reference,
        String raisonSociale,
        String destinataire,
        String email,
        String motif
) {
}
