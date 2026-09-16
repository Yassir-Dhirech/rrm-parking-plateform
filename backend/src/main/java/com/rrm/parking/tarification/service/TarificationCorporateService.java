package com.rrm.parking.tarification.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TarificationCorporateService {

    private static final int SEUIL_TARIF_REDUIT = 10;
    private static final BigDecimal PRIX_JUSQU_A_DIX_PLACES_TTC =
            new BigDecimal("375.00");
    private static final BigDecimal PRIX_A_PARTIR_DE_ONZE_PLACES_TTC =
            new BigDecimal("325.00");

    public BigDecimal calculerPrixMensuelUnitaireTTC(int nombrePlaces) {
        verifierNombrePlaces(nombrePlaces);

        return nombrePlaces <= SEUIL_TARIF_REDUIT
                ? PRIX_JUSQU_A_DIX_PLACES_TTC
                : PRIX_A_PARTIR_DE_ONZE_PLACES_TTC;
    }

    public BigDecimal calculerMontantMensuelTTC(int nombrePlaces) {
        return calculerPrixMensuelUnitaireTTC(nombrePlaces)
                .multiply(BigDecimal.valueOf(nombrePlaces))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void verifierNombrePlaces(int nombrePlaces) {
        if (nombrePlaces <= 0) {
            throw new IllegalArgumentException(
                    "Le nombre de places corporate doit être strictement positif"
            );
        }
    }
}
