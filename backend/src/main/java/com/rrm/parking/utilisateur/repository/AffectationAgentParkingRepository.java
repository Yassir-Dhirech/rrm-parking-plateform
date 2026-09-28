package com.rrm.parking.utilisateur.repository;

import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AffectationAgentParkingRepository
        extends JpaRepository<AffectationAgentParking, Long> {

    Optional<AffectationAgentParking>
    findByUtilisateurIdAndActiveTrue(Long utilisateurId);

    // Support multi-parkings actifs par utilisateur
    List<AffectationAgentParking>
    findAllByUtilisateurIdAndActiveTrue(Long utilisateurId);

    boolean existsByUtilisateurIdAndActiveTrue(Long utilisateurId);

    List<AffectationAgentParking>
    findAllByUtilisateurIdOrderByDateDebutDesc(Long utilisateurId);
}
