package com.rrm.parking.document.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import java.nio.file.StandardCopyOption;
import com.google.api.services.drive.DriveScopes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Configuration
@ConditionalOnProperty(
        prefix = "app.storage",
        name = "type",
        havingValue = "google-drive"
)
public class GoogleDriveConfig {

    @Bean
    public Drive googleDrive(
            @Value("${app.storage.google-drive.credentials-path}")
            String credentialsPath,

            @Value("${app.storage.google-drive.tokens-path}")
            String tokensPath
    ) throws Exception {

        var transport = GoogleNetHttpTransport.newTrustedTransport();
        var jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets clientSecrets;

        try (var input = Files.newInputStream(Path.of(credentialsPath))) {
            clientSecrets = GoogleClientSecrets.load(
                    jsonFactory,
                    new InputStreamReader(input)
            );
        }

        Path sourceTokens = Path.of(tokensPath);
        Path runtimeTokens =
                Files.createTempDirectory("rrm-google-drive-tokens-");

        try (var fichiers = Files.list(sourceTokens)) {
            for (Path fichier : fichiers
                    .filter(Files::isRegularFile)
                    .toList()) {

                Files.copy(
                        fichier,
                        runtimeTokens.resolve(fichier.getFileName()),
                        StandardCopyOption.REPLACE_EXISTING
                );
            }
        }


        var flow = new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                clientSecrets,
                List.of(DriveScopes.DRIVE)
        )
                .setDataStoreFactory(
                        new FileDataStoreFactory(
                                runtimeTokens.toFile()
                        )
                )
                .setAccessType("offline")
                .build();

        Credential credential =
                flow.loadCredential("rrm-test-user");

        if (credential == null) {
            throw new IllegalStateException(
                    "Token Google Drive introuvable"
            );
        }

        return new Drive.Builder(
                transport,
                jsonFactory,
                credential
        )
                .setApplicationName("RRM Parking")
                .build();
    }
}
