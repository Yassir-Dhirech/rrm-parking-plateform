package com.rrm.parking.tarification.repository;

import com.rrm.parking.tarification.entity.TarifParking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarifParkingRepository
        extends JpaRepository<TarifParking, Long> {
}