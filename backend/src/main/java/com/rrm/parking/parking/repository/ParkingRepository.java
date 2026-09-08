package com.rrm.parking.parking.repository;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ParkingRepository
        extends JpaRepository<Parking, Long> {

    Optional<Parking> findByCodeIgnoreCase(String code);

    List<Parking> findAllByStatutOrderByNomAsc(
            StatutParking statut
    );

    List<Parking> findAllByStatutInOrderByNomAsc(
            Collection<StatutParking> statuts
    );

    boolean existsByCodeIgnoreCase(String code);
}