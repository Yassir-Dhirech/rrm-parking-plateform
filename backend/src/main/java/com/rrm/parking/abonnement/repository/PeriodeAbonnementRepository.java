package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PeriodeAbonnementRepository
        extends JpaRepository<PeriodeAbonnement, Long> {

    List<PeriodeAbonnement>
    findAllByAbonnementIdOrderByNumeroAsc(
            Long abonnementId
    );

    Optional<PeriodeAbonnement>
    findByAbonnementIdAndStatut(
            Long abonnementId,
            StatutPeriodeAbonnement statut
    );

    boolean existsByAbonnementIdAndStatut(
            Long abonnementId,
            StatutPeriodeAbonnement statut
    );
}