package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface DemandeClientRepository
        extends JpaRepository<DemandeClient, Long> {

    Optional<DemandeClient> findByReference(String reference);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DemandeClient d where d.id = :id")
    Optional<DemandeClient> findByIdPourMiseAJour(
            @Param("id") Long id
    );

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

    List<DemandeClient>
    findByStatutOrderByDateSoumissionAsc(
            StatutDemande statut
    );

    List<DemandeClient>
    findByStatutOrderByDateSoumissionDesc(
            StatutDemande statut
    );

    List<DemandeClient>
    findByStatutOrderByDateModificationAsc(
            StatutDemande statut
    );

    List<DemandeClient>
    findByStatutOrderByDateModificationDesc(
            StatutDemande statut
    );

    @Query("""
            select d
            from DemandeNouvelAbonnementRegulier d
            where d.abonnementGenere.id = :abonnementId
            """)
    Optional<DemandeClient> findByAbonnementGenereId(
            @Param("abonnementId") Long abonnementId
    );
}
