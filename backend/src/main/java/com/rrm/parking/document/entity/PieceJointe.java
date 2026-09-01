package com.rrm.parking.document.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.document.enums.StatutPieceJointe;
import com.rrm.parking.document.enums.TypePieceJointe;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "piece_jointe",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_piece_jointe_reference",
                        columnNames = "reference"
                ),
                @UniqueConstraint(
                        name = "uk_piece_jointe_storage_key",
                        columnNames = "storage_key"
                )
        },
        indexes = {
                @Index(
                        name = "idx_piece_jointe_client",
                        columnList = "client_id"
                ),
                @Index(
                        name = "idx_piece_jointe_demande",
                        columnList = "demande_id"
                ),
                @Index(
                        name = "idx_piece_jointe_statut",
                        columnList = "statut"
                )
        }
)
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_piece", nullable = false, length = 40)
    private TypePieceJointe typePiece;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPieceJointe statut;

    @Column(
            name = "nom_fichier_original",
            nullable = false,
            length = 255
    )
    private String nomFichierOriginal;

    /*
     * Identifiant privé du fichier dans le stockage.
     * Ce n'est pas une URL publique ni un chemin transmis au frontend.
     */
    @Column(
            name = "storage_key",
            nullable = false,
            length = 500
    )
    private String storageKey;

    @Column(
            name = "type_mime",
            nullable = false,
            length = 150
    )
    private String typeMime;

    @Column(
            name = "taille_octets",
            nullable = false
    )
    private Long tailleOctets;

    /*
     * Empreinte SHA-256 du fichier :
     * 64 caractères hexadécimaux.
     */
    @Column(
            name = "checksum_sha256",
            nullable = false,
            length = 64
    )
    private String checksumSha256;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "client_id",
            foreignKey = @ForeignKey(
                    name = "fk_piece_jointe_client"
            )
    )
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "demande_id",
            foreignKey = @ForeignKey(
                    name = "fk_piece_jointe_demande"
            )
    )
    private DemandeClient demande;

    /*
     * Peut être null lorsque le fichier est envoyé directement
     * par un client depuis le formulaire public.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "deposee_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_piece_jointe_deposant"
            )
    )
    private Utilisateur deposeePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "validee_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_piece_jointe_validateur"
            )
    )
    private Utilisateur valideePar;

    @Column(name = "date_depot", nullable = false)
    private LocalDateTime dateDepot;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "date_rejet")
    private LocalDateTime dateRejet;

    @Column(name = "date_archivage")
    private LocalDateTime dateArchivage;

    @Column(name = "motif_rejet", length = 1000)
    private String motifRejet;

    @Version
    @Column(nullable = false)
    private Long version;

    protected PieceJointe() {
        // Constructeur JPA
    }

    public static PieceJointe pourClient(
            String reference,
            TypePieceJointe typePiece,
            String nomFichierOriginal,
            String storageKey,
            String typeMime,
            Long tailleOctets,
            String checksumSha256,
            Client client,
            Utilisateur deposeePar
    ) {
        PieceJointe piece = creerBase(
                reference,
                typePiece,
                nomFichierOriginal,
                storageKey,
                typeMime,
                tailleOctets,
                checksumSha256,
                deposeePar
        );

        piece.client = exigerNonNull(
                client,
                "Le client est obligatoire"
        );

        return piece;
    }

    public static PieceJointe pourDemande(
            String reference,
            TypePieceJointe typePiece,
            String nomFichierOriginal,
            String storageKey,
            String typeMime,
            Long tailleOctets,
            String checksumSha256,
            DemandeClient demande,
            Utilisateur deposeePar
    ) {
        PieceJointe piece = creerBase(
                reference,
                typePiece,
                nomFichierOriginal,
                storageKey,
                typeMime,
                tailleOctets,
                checksumSha256,
                deposeePar
        );

        piece.demande = exigerNonNull(
                demande,
                "La demande est obligatoire"
        );

        return piece;
    }

    private static PieceJointe creerBase(
            String reference,
            TypePieceJointe typePiece,
            String nomFichierOriginal,
            String storageKey,
            String typeMime,
            Long tailleOctets,
            String checksumSha256,
            Utilisateur deposeePar
    ) {
        PieceJointe piece = new PieceJointe();

        piece.reference = normaliserReference(reference);

        piece.typePiece = exigerNonNull(
                typePiece,
                "Le type de pièce est obligatoire"
        );

        piece.nomFichierOriginal = nettoyerNomFichier(
                nomFichierOriginal
        );

        piece.storageKey = exigerTexte(
                storageKey,
                "La clé de stockage est obligatoire"
        );

        piece.typeMime = exigerTexte(
                typeMime,
                "Le type MIME est obligatoire"
        ).toLowerCase(Locale.ROOT);

        piece.tailleOctets = verifierTaille(tailleOctets);

        piece.checksumSha256 = verifierChecksum(
                checksumSha256
        );

        piece.deposeePar = deposeePar;
        piece.statut = StatutPieceJointe.TELEVERSEE;
        piece.dateDepot = LocalDateTime.now();

        return piece;
    }

    public void valider(Utilisateur utilisateur) {
        verifierTeleversee();

        this.valideePar = exigerNonNull(
                utilisateur,
                "Le validateur est obligatoire"
        );

        this.statut = StatutPieceJointe.VALIDEE;
        this.dateValidation = LocalDateTime.now();
        this.dateRejet = null;
        this.motifRejet = null;
    }

    public void rejeter(
            String motif,
            Utilisateur utilisateur
    ) {
        verifierTeleversee();

        this.valideePar = exigerNonNull(
                utilisateur,
                "L'utilisateur qui rejette est obligatoire"
        );

        this.motifRejet = exigerTexte(
                motif,
                "Le motif du rejet est obligatoire"
        );

        this.statut = StatutPieceJointe.REJETEE;
        this.dateRejet = LocalDateTime.now();
        this.dateValidation = null;
    }

    public void archiver() {
        if (statut == StatutPieceJointe.ARCHIVEE) {
            throw new IllegalStateException(
                    "La pièce est déjà archivée"
            );
        }

        this.statut = StatutPieceJointe.ARCHIVEE;
        this.dateArchivage = LocalDateTime.now();
    }

    private void verifierTeleversee() {
        if (statut != StatutPieceJointe.TELEVERSEE) {
            throw new IllegalStateException(
                    "La pièce doit être dans l'état TELEVERSEE"
            );
        }
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        boolean clientPresent = client != null;
        boolean demandePresente = demande != null;

        if (clientPresent == demandePresente) {
            throw new IllegalStateException(
                    "La pièce doit appartenir soit à un client, soit à une demande"
            );
        }

        if (reference == null
                || typePiece == null
                || statut == null
                || nomFichierOriginal == null
                || storageKey == null
                || typeMime == null
                || tailleOctets == null
                || checksumSha256 == null
                || dateDepot == null) {
            throw new IllegalStateException(
                    "Les métadonnées de la pièce jointe sont incomplètes"
            );
        }

        verifierTaille(tailleOctets);
        verifierChecksum(checksumSha256);
    }

    private static Long verifierTaille(Long taille) {
        if (taille == null || taille <= 0) {
            throw new IllegalArgumentException(
                    "La taille du fichier doit être strictement positive"
            );
        }

        return taille;
    }

    private static String verifierChecksum(
            String checksum
    ) {
        String valeur = exigerTexte(
                checksum,
                "Le checksum SHA-256 est obligatoire"
        ).toLowerCase(Locale.ROOT);

        if (!valeur.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException(
                    "Le checksum SHA-256 doit contenir 64 caractères hexadécimaux"
            );
        }

        return valeur;
    }

    private static String nettoyerNomFichier(
            String nomFichier
    ) {
        String valeur = exigerTexte(
                nomFichier,
                "Le nom du fichier est obligatoire"
        );

        /*
         * Retire les chemins éventuellement envoyés par le navigateur.
         * Exemple : C:\fakepath\cin.pdf devient cin.pdf.
         */
        valeur = valeur.replace("\\", "/");

        int dernierSeparateur = valeur.lastIndexOf("/");

        if (dernierSeparateur >= 0) {
            valeur = valeur.substring(
                    dernierSeparateur + 1
            );
        }

        if (valeur.isBlank()) {
            throw new IllegalArgumentException(
                    "Le nom du fichier est invalide"
            );
        }

        return valeur;
    }

    private static String normaliserReference(
            String reference
    ) {
        return exigerTexte(
                reference,
                "La référence est obligatoire"
        ).toUpperCase(Locale.ROOT);
    }

    private static String exigerTexte(
            String valeur,
            String message
    ) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return valeur.trim();
    }

    private static <T> T exigerNonNull(
            T valeur,
            String message
    ) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public TypePieceJointe getTypePiece() {
        return typePiece;
    }

    public StatutPieceJointe getStatut() {
        return statut;
    }

    public String getNomFichierOriginal() {
        return nomFichierOriginal;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public Long getTailleOctets() {
        return tailleOctets;
    }

    public String getChecksumSha256() {
        return checksumSha256;
    }

    public Client getClient() {
        return client;
    }

    public DemandeClient getDemande() {
        return demande;
    }

    public Utilisateur getDeposeePar() {
        return deposeePar;
    }

    public Utilisateur getValideePar() {
        return valideePar;
    }

    public LocalDateTime getDateDepot() {
        return dateDepot;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public Long getVersion() {
        return version;
    }
}