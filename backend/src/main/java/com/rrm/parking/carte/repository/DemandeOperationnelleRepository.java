package com.rrm.parking.carte.repository;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DemandeOperationnelleRepository
        extends JpaRepository<DemandeOperationnelle, Long> {

    Optional<DemandeOperationnelle> findByReference(
            String reference
    );

    boolean existsByReference(
            String reference
    );

    List<DemandeOperationnelle>
    findByCarteAccesIdOrderByDateCreationDesc(
            Long carteAccesId
    );

    List<DemandeOperationnelle> findByStatut(
            StatutDemandeOperationnelle statut
    );

    List<DemandeOperationnelle> findByTypeOperation(
            TypeOperationCarte typeOperation
    );

    List<DemandeOperationnelle>
    findByAffecteeAIdAndStatut(
            Long utilisateurId,
            StatutDemandeOperationnelle statut
    );

    List<DemandeOperationnelle>
    findByExecuteeParIdAndStatut(
            Long utilisateurId,
            StatutDemandeOperationnelle statut
    );
}