package com.rrm.parking.integration.brevo.service;

import com.rrm.parking.integration.brevo.config.BrevoProperties;
import com.rrm.parking.notification.service.EmailEnvoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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
        BrevoEmailRequest requete =
                new BrevoEmailRequest(
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
                        contenuHtml
                );

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
                    "Échec de l'envoi de l'email par Brevo",
                    exception
            );
        }
    }

    private record BrevoEmailRequest(
            Expediteur sender,
            List<Destinataire> to,
            String subject,
            String htmlContent
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
}