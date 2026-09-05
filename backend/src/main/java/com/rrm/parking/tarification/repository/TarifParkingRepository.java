package com.rrm.parking.tarification.repository;

import com.rrm.parking.tarification.entity.TarifParking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface TarifParkingRepository
        extends JpaRepository<TarifParking, Long> {

    boolean existsByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
            Long parkingId,
            Long forfaitId,
            Integer dureeEnMois,
            LocalDate dateDebutValidite
    );
}