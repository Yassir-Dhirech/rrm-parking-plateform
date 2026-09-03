package com.rrm.parking.facturation.entity;

import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Entity
@Table(
        name = "facture",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_facture_numero",
                        columnNames = "numero"
                ),
                @UniqueConstraint(
                        name = "uk_facture_paiement",
                        columnNames = "paiement_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_facture_statut",
                        columnList = "statut"
                )
        }
)
public class Facture {

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
                    name = "fk_facture_paiement"
            )
    )
    private Paiement paiement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutFacture statut;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_emission")
    private LocalDateTime dateEmission;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_annulation", length = 1000)
    private String motifAnnulation;

    @Column(
            name = "total_ht",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalHt = BigDecimal.ZERO;

    @Column(
            name = "total_tva",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalTva = BigDecimal.ZERO;

    @Column(
            name = "total_ttc",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalTtc = BigDecimal.ZERO;

    @OneToMany(
            mappedBy = "facture",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("id ASC")
    private List<LigneFacture> lignes = new ArrayList<>();

    protected Facture() {
        // Constructeur JPA
    }

    public Facture(
            String numero,
            Paiement paiement
    ) {
        this.numero = normaliserNumero(numero);
        this.paiement = exigerNonNull(
                paiement,
                "Le paiement est obligatoire"
        );

        if (paiement.getStatut() != StatutPaiement.CONFIRME) {
            throw new IllegalArgumentException(
                    "Une facture exige un paiement confirmé"
            );
        }

        this.statut = StatutFacture.BROUILLON;
        this.dateCreation = LocalDateTime.now();
    }

    public void ajouterLigne(LigneFacture ligne) {
        verifierModifiable();

        LigneFacture ligneValide = exigerNonNull(
                ligne,
                "La ligne de facture est obligatoire"
        );

        if (lignes.contains(ligneValide)) {
            throw new IllegalStateException(
                    "La ligne existe déjà dans la facture"
            );
        }

        ligneValide.rattacherA(this);
        lignes.add(ligneValide);
        recalculerTotaux();
    }

    public void retirerLigne(LigneFacture ligne) {
        verifierModifiable();

        if (ligne == null || !lignes.contains(ligne)) {
            return;
        }

        lignes.remove(ligne);
        ligne.detacher();
        recalculerTotaux();
    }

    public void emettre() {
        verifierModifiable();

        if (lignes.isEmpty()) {
            throw new IllegalStateException(
                    "Une facture doit contenir au moins une ligne"
            );
        }

        recalculerTotaux();

        if (totalTtc.signum() <= 0) {
            throw new IllegalStateException(
                    "Le total TTC doit être strictement positif"
            );
        }

        this.statut = StatutFacture.EMISE;
        this.dateEmission = LocalDateTime.now();
    }

    public void annuler(String motif) {
        if (statut == StatutFacture.ANNULEE) {
            throw new IllegalStateException(
                    "La facture est déjà annulée"
            );
        }

        this.motifAnnulation = exigerTexte(
                motif,
                "Le motif d'annulation est obligatoire"
        );

        this.statut = StatutFacture.ANNULEE;
        this.dateAnnulation = LocalDateTime.now();
    }

    void verifierModifiable() {
        if (statut != StatutFacture.BROUILLON) {
            throw new IllegalStateException(
                    "Seule une facture en brouillon peut être modifiée"
            );
        }
    }

    void recalculerTotaux() {
        this.totalHt = lignes.stream()
                .map(LigneFacture::getMontantHt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalTva = lignes.stream()
                .map(LigneFacture::getMontantTva)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalTtc = lignes.stream()
                .map(LigneFacture::getMontantTtc)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculerChiffreAffairesAbonnements() {
        if (statut != StatutFacture.EMISE) {
            return BigDecimal.ZERO;
        }

        return lignes.stream()
                .filter(ligne ->
                        ligne.getTypeLigne()
                                == TypeLigneFacture.ABONNEMENT
                )
                .map(LigneFacture::getMontantHt)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        if (numero == null || numero.isBlank()) {
            throw new IllegalStateException(
                    "Le numéro de facture est obligatoire"
            );
        }

        if (paiement == null) {
            throw new IllegalStateException(
                    "Le paiement est obligatoire"
            );
        }

        if (statut == null) {
            throw new IllegalStateException(
                    "Le statut de facture est obligatoire"
            );
        }

        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }

        recalculerTotaux();
    }

    private static String normaliserNumero(String numero) {
        return exigerTexte(
                numero,
                "Le numéro de facture est obligatoire"
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

    public String getNumero() {
        return numero;
    }

    public Paiement getPaiement() {
        return paiement;
    }

    public StatutFacture getStatut() {
        return statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateEmission() {
        return dateEmission;
    }

    public LocalDateTime getDateAnnulation() {
        return dateAnnulation;
    }

    public String getMotifAnnulation() {
        return motifAnnulation;
    }

    public BigDecimal getTotalHt() {
        return totalHt;
    }

    public BigDecimal getTotalTva() {
        return totalTva;
    }

    public BigDecimal getTotalTtc() {
        return totalTtc;
    }

    public List<LigneFacture> getLignes() {
        return Collections.unmodifiableList(lignes);
    }
}