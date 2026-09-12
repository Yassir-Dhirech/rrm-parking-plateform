package com.rrm.parking.integration.brevo.service;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.service.otp.OtpEnvoiService;
import com.rrm.parking.integration.brevo.config.BrevoProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.otp.provider",
        havingValue = "brevo"
)
public class BrevoSmsOtpEnvoiService implements OtpEnvoiService {

    private final RestClient brevoRestClient;
    private final BrevoProperties properties;
    private final BrevoEmailEnvoiService brevoEmailEnvoiService;

    @Override
    public void envoyer(
            CanalOtp canal,
            String destination,
            String code
    ) {
        if (canal == null) {
            throw new IllegalArgumentException(
                    "Le canal OTP est obligatoire"
            );
        }

        switch (canal) {
            case EMAIL -> envoyerEmail(destination, code);
            case SMS -> envoyerSms(destination, code);
            default -> throw new IllegalArgumentException(
                    "Le canal OTP doit être EMAIL ou SMS"
            );
        }
    }

    private void envoyerEmail(
            String destination,
            String code
    ) {
        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "L'adresse e-mail destinataire est obligatoire"
            );
        }

        String contenuHtml = """
                <p>Bonjour,</p>
                <p>Votre code de vérification RRM est :</p>
                <p style="font-size:24px;font-weight:bold;">%s</p>
                <p>Ce code est valable pendant 10 minutes.</p>
                <p>Si vous n'avez pas effectué cette demande, ignorez ce message.</p>
                """.formatted(code);

        brevoEmailEnvoiService.envoyer(
                destination,
                "Client RRM",
                "Votre code de vérification RRM",
                contenuHtml
        );
    }

    private void envoyerSms(
            String destination,
            String code
    ) {
        if (!properties.smsEnabled()) {
            throw new IllegalStateException(
                    "L'envoi OTP par SMS n'est pas encore activé"
            );
        }

        String numeroNormalise = normaliserNumero(destination);

        String contenu =
                "RRM : votre code de vérification est "
                        + code
                        + ". Il est valable pendant 10 minutes.";

        BrevoSmsRequest requete =
                new BrevoSmsRequest(
                        properties.smsSender(),
                        numeroNormalise,
                        contenu,
                        "transactional",
                        "otp-demande-rrm",
                        true
                );

        try {
            brevoRestClient
                    .post()
                    .uri("/v3/transactionalSMS/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requete)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Échec de l'envoi du code OTP par SMS avec Brevo",
                    exception
            );
        }
    }

    private String normaliserNumero(String destination) {
        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "Le numéro destinataire est obligatoire"
            );
        }

        String numero = destination.replaceAll("[^0-9]", "");

        if (numero.startsWith("00")) {
            numero = numero.substring(2);
        }

        if (numero.startsWith("0")) {
            numero = "212" + numero.substring(1);
        }

        if (!numero.matches("^[1-9][0-9]{7,14}$")) {
            throw new IllegalArgumentException(
                    "Le numéro international est invalide"
            );
        }

        return numero;
    }

    private record BrevoSmsRequest(
            String sender,
            String recipient,
            String content,
            String type,
            String tag,
            boolean unicodeEnabled
    ) {
    }
}