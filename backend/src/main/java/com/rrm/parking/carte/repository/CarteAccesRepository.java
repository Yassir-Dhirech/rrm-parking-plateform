package com.rrm.parking.carte.repository;

import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarteAccesRepository
        extends JpaRepository<CarteAcces, Long> {

    Optional<CarteAcces> findByReference(
            String reference
    );

    Optional<CarteAcces> findByNumeroCarte(
            String numeroCarte
    );

    boolean existsByReference(
            String reference
    );

    boolean existsByNumeroCarte(
            String numeroCarte
    );

    List<CarteAcces> findByAbonnementId(
            Long abonnementId
    );

    Optional<CarteAcces> findByAbonnementIdAndStatut(
            Long abonnementId,
            StatutCarteAcces statut
    );

    List<CarteAcces> findByStatut(
            StatutCarteAcces statut
    );
}