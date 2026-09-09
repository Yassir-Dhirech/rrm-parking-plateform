package com.rrm.parking.document.repository;

import com.rrm.parking.document.entity.PieceJointe;
import com.rrm.parking.document.enums.StatutPieceJointe;
import com.rrm.parking.document.enums.TypePieceJointe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PieceJointeRepository
        extends JpaRepository<PieceJointe, Long> {

    Optional<PieceJointe> findByReference(
            String reference
    );

    Optional<PieceJointe> findByStorageKey(
            String storageKey
    );

    boolean existsByReference(
            String reference
    );

    boolean existsByStorageKey(
            String storageKey
    );

    List<PieceJointe>
    findByClientIdOrderByDateDepotDesc(
            Long clientId
    );

    List<PieceJointe>
    findByDemandeIdOrderByDateDepotDesc(
            Long demandeId
    );

    List<PieceJointe> findByStatut(
            StatutPieceJointe statut
    );

    List<PieceJointe> findByTypePiece(
            TypePieceJointe typePiece
    );

    List<PieceJointe> findByChecksumSha256(
            String checksumSha256
    );
}