package com.rrm.parking.tarification.dto.response;

import com.rrm.parking.tarification.entity.TarifParking;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record TarifParkingPublicResponse(

        Long tarifParkingId,

        Long parkingId,

        Long forfaitId,

        String forfaitCode,

        String forfaitLibelle,

        String forfaitDescription,

        Boolean placeReservee,

        Integer dureeEnMois,

        BigDecimal prixMensuelHT,

        BigDecimal tauxTVA,

        BigDecimal prixMensuelTTC,

        BigDecimal montantTotalTTC,

        LocalDate dateDebutValidite,

        LocalDate dateFinValidite

) {

    public static TarifParkingPublicResponse depuis(
            TarifParking tarif
    ) {
        BigDecimal prixMensuelTTC =
                tarif.calculerPrixTTC();

        BigDecimal montantTotalTTC =
                prixMensuelTTC
                        .multiply(
                                BigDecimal.valueOf(
                                        tarif.getDureeEnMois()
                                )
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return new TarifParkingPublicResponse(
                tarif.getId(),
                tarif.getParking().getId(),
                tarif.getForfait().getId(),
                tarif.getForfait().getCode(),
                tarif.getForfait().getLibelle(),
                tarif.getForfait().getDescription(),
                tarif.getForfait().getPlaceReservee(),
                tarif.getDureeEnMois(),
                tarif.getPrixHT(),
                tarif.getTauxTVA(),
                prixMensuelTTC,
                montantTotalTTC,
                tarif.getDateDebutValidite(),
                tarif.getDateFinValidite()
        );
    }
}