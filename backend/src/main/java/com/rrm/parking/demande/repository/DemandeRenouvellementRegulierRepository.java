package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface DemandeRenouvellementRegulierRepository
        extends JpaRepository<DemandeRenouvellementRegulier, Long> {

    boolean existsByAbonnementConcerneIdAndStatutIn(
            Long abonnementId,
            Collection<StatutDemande> statuts
    );

    Optional<DemandeRenouvellementRegulier> findByReference(
            String reference
    );

    Optional<DemandeRenouvellementRegulier>
    findFirstByAbonnementConcerneIdAndPeriodeGenereeIsNotNullOrderByDateModificationDesc(
            Long abonnementId
    );
}
