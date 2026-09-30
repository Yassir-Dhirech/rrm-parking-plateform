package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandePerteCarte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DemandePerteCarteRepository extends JpaRepository<DemandePerteCarte, Long> {
    Optional<DemandePerteCarte> findByReference(String reference);
}
