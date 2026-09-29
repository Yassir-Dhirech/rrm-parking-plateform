package com.rrm.parking.recette.repository;

import com.rrm.parking.recette.entity.Recette;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface RecetteRepository extends JpaRepository<Recette, Long> {
    List<Recette> findAllByOrderByDateCreationDesc();
    List<Recette> findByParkingIdOrderByDateCreationDesc(Long parkingId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Recette r where r.id = :id")
    Optional<Recette> verrouiller(@Param("id") Long id);
}
