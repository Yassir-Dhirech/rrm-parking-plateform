package com.rrm.parking.facturation.repository;

import com.rrm.parking.facturation.entity.Recu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecuRepository
        extends JpaRepository<Recu, Long> {

    Optional<Recu> findByNumero(String numero);

    boolean existsByNumero(String numero);

    Optional<Recu> findByPaiementId(
            Long paiementId
    );

    boolean existsByPaiementId(
            Long paiementId
    );
}