package com.rrm.parking.parking.repository;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Parking p where p.id = :id")
    Optional<Parking> findByIdPourMiseAJour(@Param("id") Long id);
}
