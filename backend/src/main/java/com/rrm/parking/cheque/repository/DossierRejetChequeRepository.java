package com.rrm.parking.cheque.repository;

import com.rrm.parking.cheque.entity.DossierRejetCheque;
import com.rrm.parking.cheque.enums.StatutRejetCheque;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DossierRejetChequeRepository extends JpaRepository<DossierRejetCheque, Long> {
    boolean existsByPaiementInitialId(Long paiementId);
    boolean existsByAbonnementIdAndStatutIn(Long abonnementId, List<StatutRejetCheque> statuts);
    List<DossierRejetCheque> findByStatutInOrderByDateDeclarationAsc(List<StatutRejetCheque> statuts);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DossierRejetCheque d where d.id = :id")
    Optional<DossierRejetCheque> findByIdPourMiseAJour(@Param("id") Long id);
}
