package com.rrm.parking.integration.brevo.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(
        prefix = "app.integration.brevo"
)
public record BrevoProperties(

        @NotBlank
        String apiKey,

        @NotBlank
        String smsSender
) {
}