package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DemandeClientRepository
        extends JpaRepository<DemandeClient, Long> {

    Optional<DemandeClient> findByReference(String reference);

    boolean existsByReference(String reference);

    List<DemandeClient> findByStatut(StatutDemande statut);

    List<DemandeClient> findByClientId(Long clientId);
}