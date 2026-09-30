package com.rrm.parking.abonnement.repository;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface AbonnementRepository
        extends JpaRepository<Abonnement, Long> {

    Optional<Abonnement> findByReferenceIgnoreCase(
            String reference
    );

    boolean existsByReferenceIgnoreCase(
            String reference
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Abonnement a where a.id = :id")
    Optional<Abonnement> findByIdForUpdate(@Param("id") Long id);

    @Query(value = """
            select a from Abonnement a
            where (:statut is null or a.statut = :statut)
              and (lower(a.reference) like :recherche
                or exists (select r.id from AbonnementRegulier r
                           where r.id = a.id and (
                             lower(concat(r.client.prenom, ' ', r.client.nom)) like :recherche
                             or lower(r.entrepriseNom) like :recherche))
                or exists (select c.id from AbonnementEntreprise c
                           where c.id = a.id
                             and lower(c.contrat.clientEntreprise.raisonSociale) like :recherche)
                or exists (select af.id from AffectationParking af
                           where af.abonnement.id = a.id
                             and lower(af.parking.nom) like :recherche)
                or exists (select carte.id from CarteAcces carte
                           where carte.abonnement.id = a.id
                             and lower(carte.immatriculationAffectee) like :recherche))
            """,
            countQuery = """
            select count(a) from Abonnement a
            where (:statut is null or a.statut = :statut)
              and (lower(a.reference) like :recherche
                or exists (select r.id from AbonnementRegulier r
                           where r.id = a.id and (
                             lower(concat(r.client.prenom, ' ', r.client.nom)) like :recherche
                             or lower(r.entrepriseNom) like :recherche))
                or exists (select c.id from AbonnementEntreprise c
                           where c.id = a.id
                             and lower(c.contrat.clientEntreprise.raisonSociale) like :recherche)
                or exists (select af.id from AffectationParking af
                           where af.abonnement.id = a.id
                             and lower(af.parking.nom) like :recherche)
                or exists (select carte.id from CarteAcces carte
                           where carte.abonnement.id = a.id
                             and lower(carte.immatriculationAffectee) like :recherche))
            """)
    Page<Abonnement> rechercher(@Param("recherche") String recherche,
                                @Param("statut") StatutAbonnement statut,
                                Pageable pageable);
}
