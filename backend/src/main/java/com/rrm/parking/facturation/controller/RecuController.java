package com.rrm.parking.facturation.controller;
import com.rrm.parking.facturation.service.RecuPdfService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.charset.StandardCharsets;
import com.rrm.parking.facturation.dto.response.RecuEmailResponse;
import com.rrm.parking.facturation.service.RecuEmailService;
import com.rrm.parking.facturation.dto.response.RecuConsultationResponse;
import com.rrm.parking.facturation.service.RecuConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recus")
@RequiredArgsConstructor
public class RecuController {

    private final RecuPdfService recuPdfService;
    private final RecuConsultationService
            recuConsultationService;
    private final RecuEmailService recuEmailService;

    @GetMapping("/{recuId}")
    @PreAuthorize("""
            hasAnyAuthority(
                'PAIEMENT_ENREGISTRER',
                'DEMANDE_VALIDER'
            )
            """)
    public ResponseEntity<RecuConsultationResponse>
    consulter(
            @PathVariable Long recuId
    ) {
        return ResponseEntity.ok(
                recuConsultationService.consulter(recuId)
        );
    }

    @GetMapping(
            value = "/{recuId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    @PreAuthorize("""
        hasAnyAuthority(
            'PAIEMENT_ENREGISTRER',
            'DEMANDE_VALIDER'
        )
        """)
    public ResponseEntity<byte[]> telechargerPdf(
            @PathVariable Long recuId
    ) {
        RecuConsultationResponse recu =
                recuConsultationService.consulter(recuId);

        byte[] pdf = recuPdfService.generer(recuId);

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                recu.numeroRecu() + ".pdf",
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
    @PostMapping("/{recuId}/envoyer-email")
    @PreAuthorize("""
        hasAnyAuthority(
            'PAIEMENT_ENREGISTRER',
            'DEMANDE_VALIDER'
        )
        """)
    public ResponseEntity<RecuEmailResponse>
    envoyerParEmail(
            @PathVariable Long recuId
    ) {
        return ResponseEntity.ok(
                recuEmailService.envoyer(recuId)
        );
    }
}