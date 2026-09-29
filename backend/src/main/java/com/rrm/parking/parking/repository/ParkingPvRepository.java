package com.rrm.parking.parking.repository;

import com.rrm.parking.parking.entity.ParkingPv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParkingPvRepository extends JpaRepository<ParkingPv, Long> {
    Optional<ParkingPv> findFirstByParkingIdOrderByDateDepotDescIdDesc(Long parkingId);
}
