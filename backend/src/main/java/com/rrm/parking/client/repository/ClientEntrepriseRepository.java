package com.rrm.parking.client.repository;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.enums.StatutClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ClientEntrepriseRepository
        extends JpaRepository<ClientEntreprise, Long> {

    Optional<ClientEntreprise> findByIce(String ice);

    boolean existsByIce(String ice);

    @Query(value = """
            select client from ClientEntreprise client
            where (:recherche is null or
                lower(client.raisonSociale) like :recherche or
                lower(client.ice) like :recherche or
                lower(client.numeroRC) like :recherche or
                lower(client.email) like :recherche or
                lower(client.telephone) like :recherche)
              and (:statut is null or client.statut = :statut)
              and (:debut is null or client.dateCreation >= :debut)
              and (:finExclusive is null or client.dateCreation < :finExclusive)
            """,
            countQuery = """
            select count(client) from ClientEntreprise client
            where (:recherche is null or
                lower(client.raisonSociale) like :recherche or
                lower(client.ice) like :recherche or
                lower(client.numeroRC) like :recherche or
                lower(client.email) like :recherche or
                lower(client.telephone) like :recherche)
              and (:statut is null or client.statut = :statut)
              and (:debut is null or client.dateCreation >= :debut)
              and (:finExclusive is null or client.dateCreation < :finExclusive)
            """)
    Page<ClientEntreprise> rechercherPourBaseClients(
            @Param("recherche") String recherche,
            @Param("statut") StatutClient statut,
            @Param("debut") LocalDateTime debut,
            @Param("finExclusive") LocalDateTime finExclusive,
            Pageable pageable
    );
}
