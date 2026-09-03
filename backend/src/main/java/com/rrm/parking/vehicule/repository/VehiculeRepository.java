package com.rrm.parking.vehicule.repository;

import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.enums.StatutVehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculeRepository
        extends JpaRepository<Vehicule, Long> {

    Optional<Vehicule> findByImmatriculationIgnoreCase(
            String immatriculation
    );

    boolean existsByImmatriculationIgnoreCase(
            String immatriculation
    );

    List<Vehicule> findAllByClientIdOrderByDateCreationDesc(
            Long clientId
    );

    boolean existsByClientIdAndStatut(
            Long clientId,
            StatutVehicule statut
    );
}