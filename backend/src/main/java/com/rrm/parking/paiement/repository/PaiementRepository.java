package com.rrm.parking.paiement.repository;

import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaiementRepository
        extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReference(String reference);

    boolean existsByReference(String reference);

    List<Paiement> findByDemandeIdOrderByDateCreationDesc(
            Long demandeId
    );

    Optional<Paiement> findByPeriodeAbonnementId(
            Long periodeAbonnementId
    );

    List<Paiement> findByStatut(
            StatutPaiement statut
    );

    List<Paiement> findByModePaiement(
            ModePaiement modePaiement
    );
}