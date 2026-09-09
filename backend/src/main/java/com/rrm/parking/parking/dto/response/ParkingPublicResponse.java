package com.rrm.parking.parking.dto.response;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ParkingPublicResponse(

        Long id,
        String code,
        String nom,
        String adresse,
        BigDecimal latitude,
        BigDecimal longitude,
        StatutParking statut,
        Integer capaciteTotale,
        Integer capaciteReserveeAbonnements,
        long placesOccupeesAbonnements,
        long placesDisponiblesAbonnements,
        BigDecimal tauxOccupationAbonnements,
        boolean souscriptionDisponible

) {

    public static ParkingPublicResponse depuis(
            Parking parking,
            long placesOccupees
    ) {
        int capaciteReservee =
                parking.getCapaciteReserveeAbonnements() == null
                        ? 0
                        : parking.getCapaciteReserveeAbonnements();

        long placesDisponibles = Math.max(
                0,
                capaciteReservee - placesOccupees
        );

        boolean souscriptionDisponible =
                parking.getStatut() == StatutParking.ACTIF
                        && placesDisponibles > 0;

        BigDecimal tauxOccupation =
                calculerTauxOccupation(
                        placesOccupees,
                        capaciteReservee
                );

        return new ParkingPublicResponse(
                parking.getId(),
                parking.getCode(),
                parking.getNom(),
                parking.getAdresse(),
                parking.getLatitude(),
                parking.getLongitude(),
                parking.getStatut(),
                parking.getCapaciteTotale(),
                capaciteReservee,
                placesOccupees,
                placesDisponibles,
                tauxOccupation,
                souscriptionDisponible
        );
    }

    private static BigDecimal calculerTauxOccupation(
            long placesOccupees,
            int capaciteReservee
    ) {
        if (capaciteReservee <= 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal
                .valueOf(placesOccupees)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(capaciteReservee),
                        2,
                        RoundingMode.HALF_UP
                );
    }
}