package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface DemandeClientRepository
        extends JpaRepository<DemandeClient, Long> {

    Optional<DemandeClient> findByReference(String reference);

    boolean existsByReference(String reference);

    List<DemandeClient> findByStatut(StatutDemande statut);

    List<DemandeClient> findByClientId(Long clientId);

    Optional<DemandeClient> findByReferenceIgnoreCase(
            String reference
    );

    List<DemandeClient>
    findByClientIdOrderByDateSoumissionDesc(
            Long clientId
    );

    List<DemandeClient>
    findByStatutOrderByDateValidationOtpAsc(
            StatutDemande statut
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select demande
        from DemandeClient demande
        where demande.id = :id
        """)
    Optional<DemandeClient> findByIdPourPaiement(
            @Param("id") Long id
    );
}