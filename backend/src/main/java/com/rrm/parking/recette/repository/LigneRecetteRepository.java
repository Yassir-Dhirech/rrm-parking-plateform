package com.rrm.parking.recette.repository;

import com.rrm.parking.recette.entity.LigneRecette;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LigneRecetteRepository extends JpaRepository<LigneRecette, Long> {
    boolean existsByPaiementId(Long paiementId);
}
