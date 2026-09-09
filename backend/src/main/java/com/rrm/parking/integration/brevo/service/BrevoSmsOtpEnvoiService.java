package com.rrm.parking.integration.brevo.service;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.service.otp.OtpEnvoiService;
import com.rrm.parking.integration.brevo.config.BrevoProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.otp.provider",
        havingValue = "brevo"
)
public class BrevoSmsOtpEnvoiService
        implements OtpEnvoiService {

    private final RestClient brevoRestClient;
    private final BrevoProperties properties;

    @Override
    public void envoyer(
            CanalOtp canal,
            String destination,
            String code
    ) {
        if (canal != CanalOtp.SMS) {
            throw new IllegalArgumentException(
                    "Brevo SMS ne prend actuellement en charge que le canal SMS"
            );
        }

        String numeroNormalise =
                normaliserNumero(destination);

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
                    .contentType(
                            org.springframework.http.MediaType.APPLICATION_JSON
                    )
                    .body(requete)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException exception) {
            throw new IllegalStateException(
                    "Échec de l'envoi du code OTP par Brevo",
                    exception
            );
        }
    }

    private String normaliserNumero(
            String destination
    ) {
        if (destination == null
                || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "Le numéro destinataire est obligatoire"
            );
        }

        String numero =
                destination.replaceAll("[^0-9]", "");

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