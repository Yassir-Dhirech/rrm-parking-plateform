package com.rrm.parking.parking.repository;

import com.rrm.parking.parking.entity.Parking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParkingRepository
        extends JpaRepository<Parking, Long> {

    Optional<Parking> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}