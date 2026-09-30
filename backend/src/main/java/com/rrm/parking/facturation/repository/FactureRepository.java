package com.rrm.parking.facturation.repository;

import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FactureRepository
        extends JpaRepository<Facture, Long>, JpaSpecificationExecutor<Facture> {

    Optional<Facture> findByNumero(String numero);

    boolean existsByNumero(String numero);

    Optional<Facture> findByPaiementId(
            Long paiementId
    );

    Optional<Facture> findFirstByPaiementDemandeIdOrderByIdAsc(
            Long demandeId
    );

    boolean existsByPaiementId(
            Long paiementId
    );

    List<Facture> findByStatut(
            StatutFacture statut
    );

    @Query("""
            select distinct f from Facture f
            where exists (
                   select p.id from Paiement p
                   where p.id = f.paiement.id
                     and p.periodeAbonnement.abonnement.id = :abonnementId)
               or f.paiement.demande.id in (
                   select d.id from DemandeNouvelAbonnementRegulier d
                   where d.abonnementGenere.id = :abonnementId)
               or f.paiement.demande.id in (
                   select d.id from DemandeRenouvellementRegulier d
                   where d.abonnementConcerne.id = :abonnementId)
               or f.paiement.demande.id in (
                   select d.id from DemandeNouveauContratCorporate d
                   where d.abonnementGenere.id = :abonnementId)
            order by f.dateCreation desc
            """)
    List<Facture> findToutesParAbonnement(@Param("abonnementId") Long abonnementId);
}
