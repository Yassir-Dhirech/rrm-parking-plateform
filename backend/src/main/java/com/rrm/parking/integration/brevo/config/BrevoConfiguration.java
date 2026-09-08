package com.rrm.parking.integration.brevo.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(
        BrevoProperties.class
)
@ConditionalOnProperty(
        name = "app.integration.brevo.enabled",
        havingValue = "true"
)
public class BrevoConfiguration {

    @Bean
    public RestClient brevoRestClient(
            BrevoProperties properties
    ) {
        return RestClient.builder()
                .baseUrl("https://api.brevo.com")
                .defaultHeader(
                        "api-key",
                        properties.apiKey()
                )
                .defaultHeader(
                        HttpHeaders.ACCEPT,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }
}