package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.projection.OccupationParkingProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AffectationParkingRepository
        extends JpaRepository<AffectationParking, Long> {

    List<AffectationParking>
    findAllByAbonnementIdOrderByDateDebutAsc(
            Long abonnementId
    );

    Optional<AffectationParking>
    findFirstByAbonnementIdAndDateFinIsNull(
            Long abonnementId
    );

    @Query("""
            select
                affectation.parking.id as parkingId,
                count(distinct affectation.abonnement.id)
                    as placesOccupees
            from AffectationParking affectation
            where affectation.abonnement.statut in :statuts
              and affectation.dateDebut <= :date
              and (
                    affectation.dateFin is null
                    or affectation.dateFin >= :date
              )
            group by affectation.parking.id
            """)
    List<OccupationParkingProjection>
    compterPlacesOccupeesParParking(
            @Param("statuts")
            Collection<StatutAbonnement> statuts,

            @Param("date")
            LocalDate date
    );
}