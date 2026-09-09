package com.rrm.parking.tarification.repository;

import com.rrm.parking.tarification.entity.Forfait;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForfaitRepository
        extends JpaRepository<Forfait, Long> {

    Optional<Forfait> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}