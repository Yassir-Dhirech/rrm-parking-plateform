package com.rrm.parking.demande.event;

import java.math.BigDecimal;

public record CorporateOtpValideEvent(
        String email,
        String destinataire,
        String reference,
        String raisonSociale,
        String parkingNom,
        String libelleProjet,
        int nombrePlaces,
        BigDecimal prixMensuelUnitaireTtc,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCartesTtc,
        BigDecimal montantTotalTtc
) {
}
