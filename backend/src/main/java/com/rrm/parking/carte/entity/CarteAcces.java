package com.rrm.parking.carte.entity;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "carte_acces",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_carte_acces_reference",
                        columnNames = "reference"
                ),
                @UniqueConstraint(
                        name = "uk_carte_acces_numero",
                        columnNames = "numero_carte"
                )
        },
        indexes = {
                @Index(
                        name = "idx_carte_acces_abonnement",
                        columnList = "abonnement_id"
                ),
                @Index(
                        name = "idx_carte_acces_statut",
                        columnList = "statut"
                )
        }
)
public class CarteAcces {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Référence interne générée dès la création.
     * Exemple : CARTE-2026-000001
     */
    @Column(nullable = false, length = 60)
    private String reference;

    /*
     * Numéro physique de la carte.
     * Il peut rester null tant que la carte n'est pas imprimée.
     */
    @Column(name = "numero_carte", length = 100)
    private String numeroCarte;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "abonnement_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_carte_acces_abonnement"
            )
    )
    private Abonnement abonnement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutCarteAcces statut;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_impression")
    private LocalDateTime dateImpression;

    @Column(name = "date_activation")
    private LocalDateTime dateActivation;

    @Column(name = "date_suspension")
    private LocalDateTime dateSuspension;

    @Column(name = "date_desactivation")
    private LocalDateTime dateDesactivation;

    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;

    @Column(name = "motif_derniere_operation", length = 1000)
    private String motifDerniereOperation;

    @Version
    @Column(nullable = false)
    private Long version;

    protected CarteAcces() {
        // Constructeur JPA
    }

    public CarteAcces(
            String reference,
            Abonnement abonnement
    ) {
        this.reference = normaliserReference(reference);
        this.abonnement = exigerNonNull(
                abonnement,
                "L'abonnement est obligatoire"
        );

        this.statut = StatutCarteAcces.EN_PREPARATION;
        this.dateCreation = LocalDateTime.now();
    }

    public void demanderImpression() {
        verifierStatut(
                StatutCarteAcces.EN_PREPARATION,
                "La carte doit être en préparation"
        );

        this.statut = StatutCarteAcces.A_IMPRIMER;
        this.motifDerniereOperation = null;
    }

    public void marquerCommeImprimee(String numeroCarte) {
        verifierStatut(
                StatutCarteAcces.A_IMPRIMER,
                "La carte doit être en attente d'impression"
        );

        this.numeroCarte = normaliserNumeroCarte(numeroCarte);
        this.statut = StatutCarteAcces.IMPRIMEE;
        this.dateImpression = LocalDateTime.now();
        this.motifDerniereOperation = null;
    }

    public void demanderActivation() {
        if (statut != StatutCarteAcces.IMPRIMEE
                && statut != StatutCarteAcces.SUSPENDUE) {
            throw new IllegalStateException(
                    "Seule une carte imprimée ou suspendue peut être mise en attente d'activation"
            );
        }

        this.statut = StatutCarteAcces.A_ACTIVER;
        this.motifDerniereOperation = null;
    }

    public void activer() {
        verifierStatut(
                StatutCarteAcces.A_ACTIVER,
                "La carte doit être en attente d'activation"
        );

        if (numeroCarte == null || numeroCarte.isBlank()) {
            throw new IllegalStateException(
                    "Une carte sans numéro physique ne peut pas être activée"
            );
        }

        this.statut = StatutCarteAcces.ACTIVE;
        this.dateActivation = LocalDateTime.now();
        this.dateSuspension = null;
        this.motifDerniereOperation = null;
    }

    public void suspendre(String motif) {
        verifierStatut(
                StatutCarteAcces.ACTIVE,
                "Seule une carte active peut être suspendue"
        );

        this.statut = StatutCarteAcces.SUSPENDUE;
        this.dateSuspension = LocalDateTime.now();
        this.motifDerniereOperation = exigerTexte(
                motif,
                "Le motif de suspension est obligatoire"
        );
    }

    public void desactiver(String motif) {
        if (statut != StatutCarteAcces.ACTIVE
                && statut != StatutCarteAcces.SUSPENDUE
                && statut != StatutCarteAcces.A_ACTIVER) {
            throw new IllegalStateException(
                    "La carte ne peut pas être désactivée depuis son état actuel"
            );
        }

        this.statut = StatutCarteAcces.DESACTIVEE;
        this.dateDesactivation = LocalDateTime.now();
        this.motifDerniereOperation = exigerTexte(
                motif,
                "Le motif de désactivation est obligatoire"
        );
    }

    public void expirer() {
        if (statut == StatutCarteAcces.DESACTIVEE
                || statut == StatutCarteAcces.EXPIREE) {
            throw new IllegalStateException(
                    "La carte est déjà dans un état définitif"
            );
        }

        this.statut = StatutCarteAcces.EXPIREE;
        this.dateExpiration = LocalDateTime.now();
        this.motifDerniereOperation =
                "Expiration de la carte";
    }

    private void verifierStatut(
            StatutCarteAcces statutAttendu,
            String message
    ) {
        if (statut != statutAttendu) {
            throw new IllegalStateException(message);
        }
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        if (reference == null || reference.isBlank()) {
            throw new IllegalStateException(
                    "La référence de la carte est obligatoire"
            );
        }

        if (abonnement == null) {
            throw new IllegalStateException(
                    "L'abonnement de la carte est obligatoire"
            );
        }

        if (statut == null) {
            throw new IllegalStateException(
                    "Le statut de la carte est obligatoire"
            );
        }

        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }

        boolean numeroObligatoire =
                statut == StatutCarteAcces.IMPRIMEE
                        || statut == StatutCarteAcces.A_ACTIVER
                        || statut == StatutCarteAcces.ACTIVE
                        || statut == StatutCarteAcces.SUSPENDUE
                        || statut == StatutCarteAcces.DESACTIVEE
                        || statut == StatutCarteAcces.EXPIREE;

        if (numeroObligatoire
                && (numeroCarte == null || numeroCarte.isBlank())) {
            throw new IllegalStateException(
                    "Le numéro physique est obligatoire dans cet état"
            );
        }
    }

    private static String normaliserReference(
            String reference
    ) {
        return exigerTexte(
                reference,
                "La référence de la carte est obligatoire"
        ).toUpperCase(Locale.ROOT);
    }

    private static String normaliserNumeroCarte(
            String numeroCarte
    ) {
        return exigerTexte(
                numeroCarte,
                "Le numéro physique de la carte est obligatoire"
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

    public String getNumeroCarte() {
        return numeroCarte;
    }

    public Abonnement getAbonnement() {
        return abonnement;
    }

    public StatutCarteAcces getStatut() {
        return statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateImpression() {
        return dateImpression;
    }

    public LocalDateTime getDateActivation() {
        return dateActivation;
    }

    public LocalDateTime getDateSuspension() {
        return dateSuspension;
    }

    public LocalDateTime getDateDesactivation() {
        return dateDesactivation;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public String getMotifDerniereOperation() {
        return motifDerniereOperation;
    }

    public Long getVersion() {
        return version;
    }
}