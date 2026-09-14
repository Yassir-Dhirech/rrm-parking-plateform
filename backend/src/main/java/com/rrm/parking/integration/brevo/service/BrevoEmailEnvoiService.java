package com.rrm.parking.integration.brevo.service;

import com.rrm.parking.integration.brevo.config.BrevoProperties;
import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class BrevoEmailEnvoiService
        implements EmailEnvoiService {

    private final RestClient brevoRestClient;
    private final BrevoProperties properties;

    @Override
    public void envoyer(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml
    ) {
        envoyerRequete(
                creerRequete(
                        destinataire,
                        nomDestinataire,
                        sujet,
                        contenuHtml,
                        null
                )
        );
    }

    @Override
    public void envoyerAvecPieceJointe(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml,
            byte[] contenuPieceJointe,
            String nomPieceJointe
    ) {
        if (contenuPieceJointe == null
                || contenuPieceJointe.length == 0) {
            throw new IllegalArgumentException(
                    "La pièce jointe est vide"
            );
        }

        if (nomPieceJointe == null
                || nomPieceJointe.isBlank()) {
            throw new IllegalArgumentException(
                    "Le nom de la pièce jointe est obligatoire"
            );
        }

        String contenuBase64 = Base64
                .getEncoder()
                .encodeToString(contenuPieceJointe);

        List<PieceJointe> piecesJointes = List.of(
                new PieceJointe(
                        contenuBase64,
                        nomPieceJointe
                )
        );

        envoyerRequete(
                creerRequete(
                        destinataire,
                        nomDestinataire,
                        sujet,
                        contenuHtml,
                        piecesJointes
                )
        );
    }

    private BrevoEmailRequest creerRequete(
            String destinataire,
            String nomDestinataire,
            String sujet,
            String contenuHtml,
            List<PieceJointe> piecesJointes
    ) {
        return new BrevoEmailRequest(
                new Expediteur(
                        properties.senderName(),
                        properties.senderEmail()
                ),
                List.of(
                        new Destinataire(
                                destinataire,
                                nomDestinataire
                        )
                ),
                sujet,
                contenuHtml,
                piecesJointes
        );
    }

    private void envoyerRequete(
            BrevoEmailRequest requete
    ) {
        try {
            brevoRestClient
                    .post()
                    .uri("/v3/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requete)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Échec de l'envoi de l'e-mail par Brevo",
                    exception
            );
        }
    }

    private record BrevoEmailRequest(
            Expediteur sender,
            List<Destinataire> to,
            String subject,
            String htmlContent,
            List<PieceJointe> attachment
    ) {
    }

    private record Expediteur(
            String name,
            String email
    ) {
    }

    private record Destinataire(
            String email,
            String name
    ) {
    }

    private record PieceJointe(
            String content,
            String name
    ) {
    }
}