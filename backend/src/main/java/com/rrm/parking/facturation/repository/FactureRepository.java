package com.rrm.parking.facturation.repository;

import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FactureRepository
        extends JpaRepository<Facture, Long> {

    Optional<Facture> findByNumero(String numero);

    boolean existsByNumero(String numero);

    Optional<Facture> findByPaiementId(
            Long paiementId
    );

    boolean existsByPaiementId(
            Long paiementId
    );

    List<Facture> findByStatut(
            StatutFacture statut
    );
}