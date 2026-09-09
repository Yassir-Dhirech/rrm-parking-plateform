package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AbonnementEntrepriseRepository
        extends JpaRepository<AbonnementEntreprise, Long> {

    Optional<AbonnementEntreprise> findByContratId(
            Long contratId
    );

    boolean existsByContratId(
            Long contratId
    );

    List<AbonnementEntreprise>
    findAllByContratClientEntrepriseIdOrderByDateCreationDesc(
            Long clientEntrepriseId
    );

    List<AbonnementEntreprise>
    findAllByVehiculesId(
            Long vehiculeId
    );
}