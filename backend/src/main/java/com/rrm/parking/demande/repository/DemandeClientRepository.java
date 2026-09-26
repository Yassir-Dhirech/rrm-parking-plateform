package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.time.LocalDateTime;
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
    findByInitieeParIdOrderByDateSoumissionDesc(
            Long utilisateurId
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

    @Query("""
            select count(d)
            from DemandeNouvelAbonnementRegulier d
            where d.statut = :statut
              and d.tarifParking.parking.id = :parkingId
            """)
    long countNouvellesDemandesRegulieresParParkingEtStatut(
            @Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut
    );

    @Query("""
            select count(d)
            from DemandeRenouvellementRegulier d
            where d.statut = :statut
              and d.tarifParking.parking.id = :parkingId
            """)
    long countRenouvellementsParParkingEtStatut(
            @Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut
    );

    @Query("""
            select d from DemandeNouvelAbonnementRegulier d
            where d.statut = :statut and d.tarifParking.parking.id = :parkingId
            order by d.dateValidationOtp asc, d.id asc
            """)
    List<DemandeClient> prochainesNouvellesDemandes(
            @Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut,
            Pageable limite
    );

    @Query("""
            select d from DemandeRenouvellementRegulier d
            where d.statut = :statut and d.tarifParking.parking.id = :parkingId
            order by d.dateValidationOtp asc, d.id asc
            """)
    List<DemandeClient> prochainsRenouvellements(
            @Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut,
            Pageable limite
    );

    // La liste des demandes est consultable sur tous les parkings ; les actions
    // de paiement restent contrôlées séparément par le service de paiement.
    @Query(value = """
            select dc.id from demande_client dc
            join client_particulier cp on cp.id = dc.client_id
            where (exists (select 1 from demande_nouvel_abonnement_regulier n where n.id = dc.id)
                or exists (select 1 from demande_renouvellement_regulier r where r.id = dc.id))
              and (lower(dc.reference) like :terme escape '!'
                or lower(cp.cin) like :terme escape '!'
                or lower(cp.nom) like :terme escape '!'
                or lower(cp.prenom) like :terme escape '!'
                or lower(concat(cp.prenom, ' ', cp.nom)) like :terme escape '!'
                or lower(concat(cp.nom, ' ', cp.prenom)) like :terme escape '!')
            order by dc.date_soumission desc, dc.id desc
            limit 10
            """, nativeQuery = true)
    List<Long> rechercherIdsReguliers(@Param("terme") String terme);

    @Query("""
            select count(d) from DemandeNouvelAbonnementRegulier d
            where d.statut = :statut and d.tarifParking.parking.id = :parkingId
              and coalesce(d.dateValidationOtp, d.dateSoumission) <= :seuil
            """)
    long countNouvellesEnRetard(@Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut,
            @Param("seuil") LocalDateTime seuil);

    @Query("""
            select count(d) from DemandeRenouvellementRegulier d
            where d.statut = :statut and d.tarifParking.parking.id = :parkingId
              and coalesce(d.dateValidationOtp, d.dateSoumission) <= :seuil
            """)
    long countRenouvellementsEnRetard(@Param("parkingId") Long parkingId,
            @Param("statut") StatutDemande statut,
            @Param("seuil") LocalDateTime seuil);
}
