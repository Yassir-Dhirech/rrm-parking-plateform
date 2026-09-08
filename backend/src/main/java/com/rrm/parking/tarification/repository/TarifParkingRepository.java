package com.rrm.parking.tarification.repository;

import com.rrm.parking.tarification.entity.TarifParking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

import java.time.LocalDate;

public interface TarifParkingRepository
        extends JpaRepository<TarifParking, Long> {

    boolean existsByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
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