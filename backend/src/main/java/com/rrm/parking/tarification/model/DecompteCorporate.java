package com.rrm.parking.tarification.model;

import java.math.BigDecimal;

public record DecompteCorporate(
        int nombrePlaces,
        int dureeEnMois,
        BigDecimal prixMensuelUnitaireTtc,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCartesTtc,
        BigDecimal montantTotalTtc
) {
}
