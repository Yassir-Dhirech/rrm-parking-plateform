package com.rrm.parking.integration.twilio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.twilio")
public record TwilioProperties(

        String accountSid,

        String authToken,

        String smsFrom,

        String whatsappFrom
) {
}