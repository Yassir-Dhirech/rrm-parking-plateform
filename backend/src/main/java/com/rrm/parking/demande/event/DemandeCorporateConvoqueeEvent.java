package com.rrm.parking.demande.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DemandeCorporateConvoqueeEvent(
        String reference,
        String raisonSociale,
        String destinataire,
        String email,
        String parkingNom,
        BigDecimal montantTotalTtc,
        LocalDateTime dateConvocation
) {
}
