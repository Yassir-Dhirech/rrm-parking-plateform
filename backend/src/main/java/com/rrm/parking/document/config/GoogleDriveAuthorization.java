package com.rrm.parking.document.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;

import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class GoogleDriveAuthorization {

    private static final String DOSSIER_ID =
            "1sG05PhR8PiMwJz-9Sz1Y6Q1dE94eSrMK";

    private GoogleDriveAuthorization() {
    }

    public static void main(String[] args) throws Exception {
        var transport =
                GoogleNetHttpTransport.newTrustedTransport();

        var jsonFactory =
                GsonFactory.getDefaultInstance();

        Path credentialsPath = Path.of(
                "secrets/google-drive-oauth.json"
        );

        GoogleClientSecrets clientSecrets;

        try (var input = Files.newInputStream(credentialsPath)) {
            clientSecrets = GoogleClientSecrets.load(
                    jsonFactory,
                    new InputStreamReader(input)
            );
        }

        var flow = new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                clientSecrets,
                List.of(DriveScopes.DRIVE)
        )
                .setDataStoreFactory(
                        new FileDataStoreFactory(
                                Path.of(
                                        "secrets/google-drive-tokens"
                                ).toFile()
                        )
                )
                .setAccessType("offline")
                .build();

        var receiver = new LocalServerReceiver.Builder()
                .setPort(8888)
                .build();

        Credential credential =
                new AuthorizationCodeInstalledApp(
                        flow,
                        receiver
                ).authorize("rrm-test-user");

        Drive drive = new Drive.Builder(
                transport,
                jsonFactory,
                credential
        )
                .setApplicationName("RRM Parking")
                .build();

        var dossier = drive.files()
                .get(DOSSIER_ID)
                .setFields("id,name,mimeType")
                .execute();

        System.out.println(
                "Connexion réussie au dossier : "
                        + dossier.getName()
                        + " [" + dossier.getId() + "]"
        );
    }
}