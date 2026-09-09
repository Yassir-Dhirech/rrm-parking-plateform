package com.rrm.parking.facturation.entity;

import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "recu",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_recu_numero",
                        columnNames = "numero"
                ),
                @UniqueConstraint(
                        name = "uk_recu_paiement",
                        columnNames = "paiement_id"
                )
        }
)
public class Recu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String numero;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "paiement_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_recu_paiement"
            )
    )
    private Paiement paiement;

    @Column(
            name = "montant_recu",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal montantRecu;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "mode_paiement",
            nullable = false,
            length = 20
    )
    private ModePaiement modePaiement;

    @Column(name = "date_generation", nullable = false)
    private LocalDateTime dateGeneration;

    protected Recu() {
        // Constructeur JPA
    }

    public Recu(
            String numero,
            Paiement paiement
    ) {
        Paiement paiementValide = exigerNonNull(
                paiement,
                "Le paiement est obligatoire"
        );

        if (paiementValide.getStatut()
                != StatutPaiement.CONFIRME) {
            throw new IllegalArgumentException(
                    "Un reçu exige un paiement confirmé"
            );
        }

        this.numero = normaliserNumero(numero);
        this.paiement = paiementValide;

        /*
         * Ces deux valeurs sont conservées comme instantané.
         * Le reçu reste historiquement fidèle même si le modèle
         * Paiement évolue plus tard.
         */
        this.montantRecu = paiementValide.getMontant();
        this.modePaiement = paiementValide.getModePaiement();
        this.dateGeneration = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        if (numero == null || numero.isBlank()) {
            throw new IllegalStateException(
                    "Le numéro du reçu est obligatoire"
            );
        }

        if (paiement == null) {
            throw new IllegalStateException(
                    "Le paiement du reçu est obligatoire"
            );
        }

        if (paiement.getStatut()
                != StatutPaiement.CONFIRME) {
            throw new IllegalStateException(
                    "Le paiement du reçu doit être confirmé"
            );
        }

        if (montantRecu == null
                || montantRecu.signum() <= 0) {
            throw new IllegalStateException(
                    "Le montant reçu doit être strictement positif"
            );
        }

        if (modePaiement == null) {
            throw new IllegalStateException(
                    "Le mode de paiement est obligatoire"
            );
        }

        if (dateGeneration == null) {
            dateGeneration = LocalDateTime.now();
        }
    }

    private static String normaliserNumero(
            String numero
    ) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException(
                    "Le numéro du reçu est obligatoire"
            );
        }

        return numero.trim().toUpperCase(Locale.ROOT);
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

    public String getNumero() {
        return numero;
    }

    public Paiement getPaiement() {
        return paiement;
    }

    public BigDecimal getMontantRecu() {
        return montantRecu;
    }

    public ModePaiement getModePaiement() {
        return modePaiement;
    }

    public LocalDateTime getDateGeneration() {
        return dateGeneration;
    }
}