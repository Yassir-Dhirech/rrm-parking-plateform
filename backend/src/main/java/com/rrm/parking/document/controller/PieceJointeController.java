package com.rrm.parking.document.controller;

import com.rrm.parking.document.entity.PieceJointe;
import com.rrm.parking.document.repository.PieceJointeRepository;
import com.rrm.parking.document.service.StockageDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/pieces-jointes")
@RequiredArgsConstructor
public class PieceJointeController {

    private final PieceJointeRepository pieceJointeRepository;
    private final StockageDocumentService stockageDocumentService;

    @GetMapping("/{id}/contenu")
    @PreAuthorize(
            "hasAuthority('DEMANDE_CONSULTER')"
    )
    public ResponseEntity<byte[]> obtenirContenu(
            @PathVariable Long id
    ) {
        PieceJointe piece =
                pieceJointeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Pièce jointe introuvable"
                                )
                        );

        byte[] contenu =
                stockageDocumentService.lire(
                        piece.getStorageKey()
                );

        ContentDisposition disposition =
                ContentDisposition.inline()
                        .filename(
                                piece.getNomFichierOriginal(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                piece.getTypeMime()
                        )
                )
                .contentLength(contenu.length)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .body(contenu);
    }
}