package com.rrm.parking.utilisateur.repository;

import com.rrm.parking.utilisateur.entity.Utilisateur;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository
        extends JpaRepository<Utilisateur, Long> {

    @EntityGraph(attributePaths = {
            "roles",
            "roles.permissions"
    })
    Optional<Utilisateur> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}