package com.rrm.parking.integration.twilio.service;

import com.rrm.parking.common.exception.OtpEnvoiException;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.service.otp.OtpEnvoiService;
import com.rrm.parking.integration.twilio.config.TwilioProperties;
import com.twilio.http.TwilioRestClient;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "app.otp",
        name = "provider",
        havingValue = "twilio"
)
public class TwilioOtpEnvoiService
        implements OtpEnvoiService {

    private final TwilioRestClient twilioRestClient;
    private final TwilioProperties properties;

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

        String destinationNormalisee =
                normaliserNumeroMarocain(destination);

        String contenu = construireMessage(code);

        try {
            switch (canal) {
                case SMS -> envoyerSms(
                        destinationNormalisee,
                        contenu
                );

                case WHATSAPP -> envoyerWhatsApp(
                        destinationNormalisee,
                        contenu
                );
            }
        } catch (RuntimeException exception) {
            throw new OtpEnvoiException(
                    "Impossible d'envoyer le code OTP via "
                            + canal,
                    exception
            );
        }
    }

    private void envoyerSms(
            String destination,
            String contenu
    ) {
        Message.creator(
                new PhoneNumber(destination),
                new PhoneNumber(properties.smsFrom()),
                contenu
        ).create(twilioRestClient);
    }

    private void envoyerWhatsApp(
            String destination,
            String contenu
    ) {
        Message.creator(
                new PhoneNumber(
                        "whatsapp:" + destination
                ),
                new PhoneNumber(
                        normaliserExpediteurWhatsApp(
                                properties.whatsappFrom()
                        )
                ),
                contenu
        ).create(twilioRestClient);
    }

    private String construireMessage(String code) {
        if (code == null
                || !code.matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Le code OTP doit contenir exactement 6 chiffres"
            );
        }

        return "Votre code de confirmation RRM est "
                + code
                + ". Il expire dans 10 minutes. "
                + "Ne le communiquez a personne.";
    }

    private String normaliserNumeroMarocain(
            String numero
    ) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException(
                    "Le numéro de téléphone est obligatoire"
            );
        }

        String valeur = numero
                .trim()
                .replaceAll("[\\s.()-]", "");

        if (valeur.startsWith("00")) {
            valeur = "+" + valeur.substring(2);
        } else if (valeur.startsWith("0")) {
            valeur = "+212" + valeur.substring(1);
        } else if (valeur.startsWith("212")) {
            valeur = "+" + valeur;
        }

        if (!valeur.matches("\\+\\d{8,15}")) {
            throw new IllegalArgumentException(
                    "Le numéro de téléphone est invalide"
            );
        }

        return valeur;
    }

    private String normaliserExpediteurWhatsApp(
            String expediteur
    ) {
        if (expediteur.startsWith("whatsapp:")) {
            return expediteur;
        }

        return "whatsapp:" + expediteur;
    }
}