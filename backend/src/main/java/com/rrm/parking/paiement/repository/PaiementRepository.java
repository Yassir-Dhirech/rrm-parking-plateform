package com.rrm.parking.paiement.repository;

import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaiementRepository
        extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReference(String reference);

    boolean existsByReference(String reference);

    boolean existsByDemandeIdAndStatut(
            Long demandeId,
            StatutPaiement statut
    );

    Optional<Paiement> findByDemandeIdAndStatut(
            Long demandeId,
            StatutPaiement statut
    );

    List<Paiement> findByDemandeIdOrderByDateCreationDesc(
            Long demandeId
    );

    Optional<Paiement> findByPeriodeAbonnementId(
            Long periodeAbonnementId
    );

    List<Paiement> findByStatut(
            StatutPaiement statut
    );

    List<Paiement> findByModePaiement(
            ModePaiement modePaiement
    );

    List<Paiement>
    findByTraiteParIdAndStatutOrderByDateConfirmationDesc(
            Long utilisateurId,
            StatutPaiement statut
    );

    @Query("""
            select coalesce(sum(p.montant), 0)
            from Paiement p
            where p.statut = :statut
              and p.traitePar.id = :utilisateurId
              and p.dateConfirmation >= :debut
              and p.dateConfirmation < :fin
            """)
    BigDecimal sumMontantConfirmeParUtilisateurEntre(
            @Param("utilisateurId") Long utilisateurId,
            @Param("statut") StatutPaiement statut,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );

    @Query("""
            select count(p)
            from Paiement p
            where p.statut = :statut
              and p.traitePar.id = :utilisateurId
              and p.dateConfirmation >= :debut
              and p.dateConfirmation < :fin
            """)
    long countConfirmesParUtilisateurEntre(
            @Param("utilisateurId") Long utilisateurId,
            @Param("statut") StatutPaiement statut,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin
    );
}
