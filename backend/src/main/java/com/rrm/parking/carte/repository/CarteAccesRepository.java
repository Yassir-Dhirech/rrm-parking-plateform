package com.rrm.parking.carte.repository;

import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

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

    Optional<CarteAcces> findByNumeroCarteIgnoreCase(
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

    List<CarteAcces> findByAbonnementIdOrderByIdAsc(
            Long abonnementId
    );

    Optional<CarteAcces> findByAbonnementIdAndStatut(
            Long abonnementId,
            StatutCarteAcces statut
    );

    List<CarteAcces> findByStatut(
            StatutCarteAcces statut
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CarteAcces c where c.id = :id")
    Optional<CarteAcces> findByIdForUpdate(@Param("id") Long id);
}
