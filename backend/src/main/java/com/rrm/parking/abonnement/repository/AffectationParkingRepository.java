package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.AffectationParking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AffectationParkingRepository
        extends JpaRepository<AffectationParking, Long> {

    List<AffectationParking>
    findAllByAbonnementIdOrderByDateDebutAsc(
            Long abonnementId
    );

    Optional<AffectationParking>
    findFirstByAbonnementIdAndDateFinIsNull(
            Long abonnementId
    );
}