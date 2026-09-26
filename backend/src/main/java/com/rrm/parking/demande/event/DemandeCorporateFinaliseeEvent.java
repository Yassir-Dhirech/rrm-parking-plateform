package com.rrm.parking.demande.event;

import java.time.LocalDateTime;

public record DemandeCorporateFinaliseeEvent(
        String reference,
        String raisonSociale,
        String destinataire,
        String email,
        String parkingNom,
        Integer nombreCartes,
        String numeroFacture,
        LocalDateTime dateActivationCartes
) {
}
