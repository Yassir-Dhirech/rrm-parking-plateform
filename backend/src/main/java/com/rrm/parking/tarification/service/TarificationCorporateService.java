package com.rrm.parking.tarification.service;

import com.rrm.parking.tarification.model.DecompteCorporate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TarificationCorporateService {

    private static final int SEUIL_TARIF_REDUIT = 10;
    public static final int DUREE_CONTRAT_MOIS = 240;
    public static final BigDecimal FRAIS_CARTE_UNITAIRE_TTC =
            new BigDecimal("50.00");
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

    public DecompteCorporate calculerDecompte(int nombrePlaces) {
        BigDecimal prixMensuelUnitaire =
                calculerPrixMensuelUnitaireTTC(nombrePlaces);
        BigDecimal montantAbonnement = prixMensuelUnitaire
                .multiply(BigDecimal.valueOf(DUREE_CONTRAT_MOIS))
                .multiply(BigDecimal.valueOf(nombrePlaces))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal fraisCartes = FRAIS_CARTE_UNITAIRE_TTC
                .multiply(BigDecimal.valueOf(nombrePlaces))
                .setScale(2, RoundingMode.HALF_UP);

        return new DecompteCorporate(
                nombrePlaces,
                DUREE_CONTRAT_MOIS,
                prixMensuelUnitaire,
                montantAbonnement,
                fraisCartes,
                montantAbonnement.add(fraisCartes)
                        .setScale(2, RoundingMode.HALF_UP)
        );
    }

    private void verifierNombrePlaces(int nombrePlaces) {
        if (nombrePlaces <= 0) {
            throw new IllegalArgumentException(
                    "Le nombre de places corporate doit être strictement positif"
            );
        }
    }
}
