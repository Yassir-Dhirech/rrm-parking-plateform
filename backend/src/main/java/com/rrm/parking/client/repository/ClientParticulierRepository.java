package com.rrm.parking.client.repository;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.enums.StatutClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ClientParticulierRepository
        extends JpaRepository<ClientParticulier, Long> {

    Optional<ClientParticulier> findByCinIgnoreCase(String cin);

    boolean existsByCinIgnoreCase(String cin);

    @Query(value = """
            select client from ClientParticulier client
            where (:recherche is null or
                lower(client.nom) like :recherche or
                lower(client.prenom) like :recherche or
                lower(concat(client.prenom, ' ', client.nom)) like :recherche or
                lower(client.cin) like :recherche or
                lower(client.email) like :recherche or
                lower(client.telephone) like :recherche)
              and (:statut is null or client.statut = :statut)
              and (:debut is null or client.dateCreation >= :debut)
              and (:finExclusive is null or client.dateCreation < :finExclusive)
            """,
            countQuery = """
            select count(client) from ClientParticulier client
            where (:recherche is null or
                lower(client.nom) like :recherche or
                lower(client.prenom) like :recherche or
                lower(concat(client.prenom, ' ', client.nom)) like :recherche or
                lower(client.cin) like :recherche or
                lower(client.email) like :recherche or
                lower(client.telephone) like :recherche)
              and (:statut is null or client.statut = :statut)
              and (:debut is null or client.dateCreation >= :debut)
              and (:finExclusive is null or client.dateCreation < :finExclusive)
            """)
    Page<ClientParticulier> rechercherPourBaseClients(
            @Param("recherche") String recherche,
            @Param("statut") StatutClient statut,
            @Param("debut") LocalDateTime debut,
            @Param("finExclusive") LocalDateTime finExclusive,
            Pageable pageable
    );
}
