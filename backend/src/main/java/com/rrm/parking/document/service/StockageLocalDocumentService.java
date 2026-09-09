package com.rrm.parking.document.service;


import com.rrm.parking.common.exception.StockageDocumentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
@ConditionalOnProperty(
        prefix = "app.storage",
        name = "type",
        havingValue = "local",
        matchIfMissing = true
)
public class StockageLocalDocumentService
        implements StockageDocumentService {

    private static final long TAILLE_MAXIMALE =
            10L * 1024L * 1024L;

    private final Path cheminBase;

    public StockageLocalDocumentService(
            @Value("${app.storage.base-path}")
            String cheminBase
    ) {
        this.cheminBase = Path.of(cheminBase)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public FichierStocke stocker(
            MultipartFile fichier,
            String dossier
    ) {
        verifierFichier(fichier);

        String dossierNormalise =
                normaliserDossier(dossier);

        byte[] contenu;

        try {
            contenu = fichier.getBytes();
        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible de lire le fichier",
                    exception
            );
        }

        String typeMime = fichier
                .getContentType()
                .toLowerCase(Locale.ROOT);

        String extension =
                determinerExtension(typeMime);

        verifierSignature(contenu, typeMime);

        String storageKey =
                dossierNormalise
                        + "/"
                        + UUID.randomUUID()
                        + "."
                        + extension;

        Path destination = resoudreChemin(
                storageKey
        );

        try {
            Files.createDirectories(
                    destination.getParent()
            );

            Files.write(
                    destination,
                    contenu,
                    StandardOpenOption.CREATE_NEW
            );
        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible d'enregistrer le fichier",
                    exception
            );
        }

        return new FichierStocke(
                nettoyerNomOriginal(
                        fichier.getOriginalFilename()
                ),
                storageKey,
                typeMime,
                fichier.getSize(),
                calculerChecksum(contenu)
        );
    }

    @Override
    public void supprimerSiExiste(
            String storageKey
    ) {
        if (storageKey == null
                || storageKey.isBlank()) {
            return;
        }

        Path fichier = resoudreChemin(
                storageKey
        );

        try {
            Files.deleteIfExists(fichier);
        } catch (IOException exception) {
            throw new StockageDocumentException(
                    "Impossible de supprimer le fichier",
                    exception
            );
        }
    }

    private void verifierFichier(
            MultipartFile fichier
    ) {
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
                    "Le type MIME du fichier est obligatoire"
            );
        }
    }

    private String determinerExtension(
            String typeMime
    ) {
        return switch (typeMime) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "application/pdf" -> "pdf";
            default -> throw new IllegalArgumentException(
                    "Format refusé : seuls JPEG, PNG et PDF sont autorisés"
            );
        };
    }

    private void verifierSignature(
            byte[] contenu,
            String typeMime
    ) {
        boolean valide = switch (typeMime) {
            case "image/jpeg" ->
                    commencePar(
                            contenu,
                            0xFF, 0xD8, 0xFF
                    );

            case "image/png" ->
                    commencePar(
                            contenu,
                            0x89, 0x50, 0x4E, 0x47,
                            0x0D, 0x0A, 0x1A, 0x0A
                    );

            case "application/pdf" ->
                    commencePar(
                            contenu,
                            0x25, 0x50, 0x44, 0x46, 0x2D
                    );

            default -> false;
        };

        if (!valide) {
            throw new IllegalArgumentException(
                    "Le contenu du fichier ne correspond pas à son type"
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

        for (int index = 0;
             index < signature.length;
             index++) {

            if ((contenu[index] & 0xFF)
                    != signature[index]) {
                return false;
            }
        }

        return true;
    }

    private String calculerChecksum(
            byte[] contenu
    ) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            return HexFormat.of().formatHex(
                    digest.digest(contenu)
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 est indisponible",
                    exception
            );
        }
    }

    private String normaliserDossier(
            String dossier
    ) {
        if (dossier == null
                || dossier.isBlank()) {
            throw new IllegalArgumentException(
                    "Le dossier de stockage est obligatoire"
            );
        }

        String valeur = dossier
                .trim()
                .replace("\\", "/");

        if (valeur.startsWith("/")
                || valeur.contains("..")
                || !valeur.matches(
                "[A-Za-z0-9/_-]+"
        )) {
            throw new IllegalArgumentException(
                    "Le dossier de stockage est invalide"
            );
        }

        return valeur;
    }

    private Path resoudreChemin(
            String storageKey
    ) {
        Path chemin = cheminBase
                .resolve(storageKey)
                .normalize();

        if (!chemin.startsWith(cheminBase)) {
            throw new IllegalArgumentException(
                    "La clé de stockage est invalide"
            );
        }

        return chemin;
    }

    private String nettoyerNomOriginal(
            String nom
    ) {
        if (nom == null || nom.isBlank()) {
            return "document";
        }

        String valeur = nom
                .replace("\\", "/");

        int position =
                valeur.lastIndexOf('/');

        return position >= 0
                ? valeur.substring(position + 1)
                : valeur;
    }
}