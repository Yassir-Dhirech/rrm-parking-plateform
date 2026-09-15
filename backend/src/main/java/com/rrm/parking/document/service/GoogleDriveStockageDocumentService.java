package com.rrm.parking.document.service;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.rrm.parking.common.exception.StockageDocumentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@ConditionalOnProperty(
        prefix = "app.storage",
        name = "type",
        havingValue = "google-drive"
)
public class GoogleDriveStockageDocumentService
        implements StockageDocumentService {

    private static final long TAILLE_MAXIMALE =
            10L * 1024L * 1024L;

    private final Drive drive;
    private final String dossierId;

    public GoogleDriveStockageDocumentService(
            Drive drive,
            @Value("${app.storage.google-drive.folder-id}")
            String dossierId
    ) {
        this.drive = drive;
        this.dossierId = dossierId;
    }

    @Override
    public FichierStocke stocker(
            MultipartFile fichier,
            String dossier
    ) {
        verifierFichier(fichier);

        try {
            byte[] contenu = fichier.getBytes();
            String typeMime = fichier.getContentType()
                    .toLowerCase(Locale.ROOT);

            String extension = determinerExtension(typeMime);
            verifierSignature(contenu, typeMime);

            String nomDrive =
                    normaliserNom(dossier)
                            + "_"
                            + UUID.randomUUID()
                            + "."
                            + extension;

            var metadata =
                    new com.google.api.services.drive.model.File()
                            .setName(nomDrive)
                            .setParents(List.of(dossierId));

            var media = new InputStreamContent(
                    typeMime,
                    new ByteArrayInputStream(contenu)
            );

            var fichierDrive = drive.files()
                    .create(metadata, media)
                    .setFields("id,name")
                    .execute();

            return new FichierStocke(
                    nettoyerNomOriginal(fichier.getOriginalFilename()),
                    fichierDrive.getId(),
                    typeMime,
                    fichier.getSize(),
                    calculerChecksum(contenu)
            );

        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible d’enregistrer le fichier dans Google Drive",
                    exception
            );
        }
    }

    @Override
    public byte[] lire(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException(
                    "La clé de stockage est obligatoire"
            );
        }

        try {
            ByteArrayOutputStream sortie =
                    new ByteArrayOutputStream();

            drive.files()
                    .get(storageKey)
                    .executeMediaAndDownloadTo(sortie);

            return sortie.toByteArray();

        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible de lire le fichier Google Drive",
                    exception
            );
        }
    }

    @Override
    public void supprimerSiExiste(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }

        try {
            drive.files().delete(storageKey).execute();
        } catch (GoogleJsonResponseException exception) {
            if (exception.getStatusCode() != 404) {
                throw new StockageDocumentException(
                        "Impossible de supprimer le fichier Google Drive",
                        exception
                );
            }
        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible de supprimer le fichier Google Drive",
                    exception
            );
        }
    }

    private void verifierFichier(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new IllegalArgumentException(
                    "Le fichier est obligatoire"
            );
        }

        if (fichier.getSize() > TAILLE_MAXIMALE) {
            throw new IllegalArgumentException(
                    "Le fichier ne doit pas dépasser 10 Mo"
            );
        }

        if (fichier.getContentType() == null) {
            throw new IllegalArgumentException(
                    "Le type MIME est obligatoire"
            );
        }
    }

    private String determinerExtension(String typeMime) {
        return switch (typeMime) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "application/pdf" -> "pdf";
            default -> throw new IllegalArgumentException(
                    "Seuls JPEG, PNG et PDF sont autorisés"
            );
        };
    }

    private void verifierSignature(
            byte[] contenu,
            String typeMime
    ) {
        boolean valide = switch (typeMime) {
            case "image/jpeg" ->
                    commencePar(contenu, 0xFF, 0xD8, 0xFF);
            case "image/png" ->
                    commencePar(
                            contenu,
                            0x89, 0x50, 0x4E, 0x47,
                            0x0D, 0x0A, 0x1A, 0x0A
                    );
            case "application/pdf" ->
                    commencePar(contenu, 0x25, 0x50, 0x44, 0x46);
            default -> false;
        };

        if (!valide) {
            throw new IllegalArgumentException(
                    "Le contenu ne correspond pas au type du fichier"
            );
        }
    }

    private boolean commencePar(
            byte[] contenu,
            int... signature
    ) {
        if (contenu.length < signature.length) {
            return false;
        }

        for (int index = 0; index < signature.length; index++) {
            if ((contenu[index] & 0xFF) != signature[index]) {
                return false;
            }
        }

        return true;
    }

    private String calculerChecksum(byte[] contenu) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest
                            .getInstance("SHA-256")
                            .digest(contenu)
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 est indisponible",
                    exception
            );
        }
    }

    private String normaliserNom(String dossier) {
        if (dossier == null || dossier.isBlank()) {
            throw new IllegalArgumentException(
                    "Le nom du dossier est obligatoire"
            );
        }

        return dossier.trim()
                .replace("\\", "_")
                .replace("/", "_")
                .replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private String nettoyerNomOriginal(String nom) {
        if (nom == null || nom.isBlank()) {
            return "document";
        }

        return nom.replace("\\", "/")
                .substring(nom.replace("\\", "/")
                        .lastIndexOf('/') + 1);
    }
}