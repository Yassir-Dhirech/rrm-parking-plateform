package com.rrm.parking.carte.repository;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    boolean existsByCarteAccesIdAndTypeOperation(
            Long carteAccesId,
            TypeOperationCarte typeOperation
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
    findByTypeOperationAndStatutInOrderByDateCreationAsc(
            TypeOperationCarte typeOperation,
            List<StatutDemandeOperationnelle> statuts
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

    List<DemandeOperationnelle>
    findByExecuteeParIdAndTypeOperationAndStatutOrderByDateExecutionDesc(
            Long utilisateurId,
            TypeOperationCarte typeOperation,
            StatutDemandeOperationnelle statut
    );

    @Query("""
            select count(distinct operation.id)
            from DemandeOperationnelle operation
            where operation.typeOperation = :typeOperation
              and operation.statut in :statuts
              and (
                  exists (
                      select affectation.id
                      from AffectationParking affectation
                      where affectation.abonnement.id = operation.carteAcces.abonnement.id
                        and affectation.parking.id = :parkingId
                        and affectation.dateDebut <= :dateReference
                        and (affectation.dateFin is null or affectation.dateFin >= :dateReference)
                  )
                  or exists (
                      select corporate.id
                      from DemandeNouveauContratCorporate corporate
                      where corporate.id = operation.demandeClientSource.id
                        and corporate.parking.id = :parkingId
                  )
              )
            """)
    long countOuvertesParTypeEtParking(
            @Param("typeOperation") TypeOperationCarte typeOperation,
            @Param("statuts") List<StatutDemandeOperationnelle> statuts,
            @Param("parkingId") Long parkingId,
            @Param("dateReference") LocalDate dateReference
    );
}
