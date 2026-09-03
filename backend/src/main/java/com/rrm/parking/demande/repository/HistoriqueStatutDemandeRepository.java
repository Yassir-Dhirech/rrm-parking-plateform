package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.HistoriqueStatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueStatutDemandeRepository
        extends JpaRepository<HistoriqueStatutDemande, Long> {

    List<HistoriqueStatutDemande> findByDemandeId(Long demandeId);
}