package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.abonnement.repository.projection.OccupationParkingProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

public interface DemandeNouveauContratCorporateRepository
        extends JpaRepository<DemandeNouveauContratCorporate, Long> {

    List<DemandeNouveauContratCorporate>
    findByStatutInOrderByDateSoumissionAsc(
            Collection<StatutDemande> statuts
    );

    List<DemandeNouveauContratCorporate>
    findByStatutInOrderByDateSoumissionDesc(
            Collection<StatutDemande> statuts
    );

    @Query("""
            select coalesce(sum(d.nombrePlaces), 0)
            from DemandeNouveauContratCorporate d
            where d.parking.id = :parkingId
              and d.statut in :statuts
            """)
    long compterPlacesReservees(
            @Param("parkingId") Long parkingId,
            @Param("statuts") Collection<StatutDemande> statuts
    );

    @Query("""
            select coalesce(sum(d.nombrePlaces), 0)
            from DemandeNouveauContratCorporate d
            where d.parking.id = :parkingId
              and d.statut in :statuts
              and d.id <> :demandeId
            """)
    long compterPlacesReserveesHorsDemande(
            @Param("parkingId") Long parkingId,
            @Param("statuts") Collection<StatutDemande> statuts,
            @Param("demandeId") Long demandeId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select d
            from DemandeNouveauContratCorporate d
            join fetch d.client
            join fetch d.parking
            where d.id = :id
            """)
    Optional<DemandeNouveauContratCorporate> findByIdPourDecision(
            @Param("id") Long id
    );

    @Query("""
            select
                d.parking.id as parkingId,
                sum(d.nombrePlaces) as placesOccupees
            from DemandeNouveauContratCorporate d
            where d.statut in :statuts
            group by d.parking.id
            """)
    List<OccupationParkingProjection> compterPlacesReserveesParParking(
            @Param("statuts") Collection<StatutDemande> statuts
    );
}
