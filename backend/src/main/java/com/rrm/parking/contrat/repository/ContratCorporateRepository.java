package com.rrm.parking.contrat.repository;

import com.rrm.parking.contrat.entity.ContratCorporate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContratCorporateRepository
        extends JpaRepository<ContratCorporate, Long> {

    Optional<ContratCorporate> findByReferenceIgnoreCase(
            String reference
    );

    boolean existsByReferenceIgnoreCase(
            String reference
    );

    List<ContratCorporate>
    findAllByClientEntrepriseIdOrderByDateCreationDesc(
            Long clientEntrepriseId
    );
}