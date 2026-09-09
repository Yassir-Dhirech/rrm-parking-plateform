package com.rrm.parking.integration.twilio.config;

import com.twilio.http.TwilioRestClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(TwilioProperties.class)
@ConditionalOnProperty(
        prefix = "app.otp",
        name = "provider",
        havingValue = "twilio"
)
public class TwilioConfiguration {

    @Bean
    public TwilioRestClient twilioRestClient(
            TwilioProperties properties
    ) {
        verifierConfiguration(properties);

        return new TwilioRestClient.Builder(
                properties.accountSid(),
                properties.authToken()
        ).build();
    }

    private void verifierConfiguration(
            TwilioProperties properties
    ) {
        exigerValeur(
                properties.accountSid(),
                "TWILIO_ACCOUNT_SID"
        );

        exigerValeur(
                properties.authToken(),
                "TWILIO_AUTH_TOKEN"
        );

        exigerValeur(
                properties.smsFrom(),
                "TWILIO_SMS_FROM"
        );

        exigerValeur(
                properties.whatsappFrom(),
                "TWILIO_WHATSAPP_FROM"
        );
    }

    private void exigerValeur(
            String valeur,
            String nomVariable
    ) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalStateException(
                    "La variable " + nomVariable
                            + " est obligatoire lorsque "
                            + "app.otp.provider=twilio"
            );
        }
    }
}