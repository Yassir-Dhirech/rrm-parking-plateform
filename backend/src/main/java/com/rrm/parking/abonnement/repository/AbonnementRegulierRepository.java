package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AbonnementRegulierRepository
        extends JpaRepository<AbonnementRegulier, Long> {

    List<AbonnementRegulier>
    findAllByClientIdOrderByDateCreationDesc(
            Long clientId
    );
}