package com.rrm.parking.tarification.repository;

import com.rrm.parking.tarification.entity.TarifParking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TarifParkingRepository
        extends JpaRepository<TarifParking, Long> {

    boolean existsByParkingId(Long parkingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select tarif from TarifParking tarif
            where tarif.parking.id = :parkingId
              and tarif.forfait.id = :forfaitId
              and tarif.dateRetrait is null
            """)
    List<TarifParking> trouverForfaitDuParkingPourRetrait(
            @Param("parkingId") Long parkingId, @Param("forfaitId") Long forfaitId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select tarif from TarifParking tarif join fetch tarif.forfait where tarif.id = :id")
    Optional<TarifParking> findByIdPourMiseAJour(@Param("id") Long id);

    boolean existsByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
            Long parkingId,
            Long forfaitId,
            Integer dureeEnMois,
            LocalDate dateDebutValidite
    );

    Optional<TarifParking> findByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
            Long parkingId,
            Long forfaitId,
            Integer dureeEnMois,
            LocalDate dateDebutValidite
    );

    @Query("""
        select tarif
        from TarifParking tarif
        join fetch tarif.parking parking
        join fetch tarif.forfait forfait
        where parking.id = :parkingId
          and forfait.actif = true
          and tarif.dateRetrait is null
          and tarif.dateDebutValidite <= :date
          and (
                tarif.dateFinValidite is null
                or tarif.dateFinValidite >= :date
          )
        order by forfait.libelle asc,
                 tarif.dureeEnMois asc
        """)
    List<TarifParking> trouverTarifsApplicables(
            @Param("parkingId")
            Long parkingId,

            @Param("date")
            LocalDate date
    );
}
