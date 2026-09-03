package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AbonnementRepository
        extends JpaRepository<Abonnement, Long> {

    Optional<Abonnement> findByReferenceIgnoreCase(
            String reference
    );

    boolean existsByReferenceIgnoreCase(
            String reference
    );
}