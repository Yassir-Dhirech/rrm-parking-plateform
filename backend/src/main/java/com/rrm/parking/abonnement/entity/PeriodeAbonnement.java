package com.rrm.parking.abonnement.entity;

import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "periode_abonnement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_periode_abonnement_numero",
                        columnNames = {"abonnement_id", "numero"}
                )
        }
)
public class PeriodeAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPeriodeAbonnement statut;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prixHTApplique;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTVAApplique;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "abonnement_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_periode_abonnement_abonnement"
            )
    )
    private Abonnement abonnement;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    protected PeriodeAbonnement() {
    }

    public PeriodeAbonnement(
            Integer numero,
            LocalDate dateDebut,
            LocalDate dateFin,
            BigDecimal prixHTApplique,
            BigDecimal tauxTVAApplique,
            Abonnement abonnement
    ) {
        verifierDates(dateDebut, dateFin);
        verifierMontant(prixHTApplique, "Le prix HT");
        verifierMontant(tauxTVAApplique, "Le taux de TVA");

        if (numero == null || numero <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro de période doit être positif"
            );
        }

        if (abonnement == null) {
            throw new IllegalArgumentException(
                    "L'abonnement est obligatoire"
            );
        }

        this.numero = numero;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.prixHTApplique = prixHTApplique;
        this.tauxTVAApplique = tauxTVAApplique;
        this.abonnement = abonnement;
        this.statut = StatutPeriodeAbonnement.PLANIFIEE;
    }

    @PrePersist
    protected void avantCreation() {
        if (statut == null) {
            statut = StatutPeriodeAbonnement.PLANIFIEE;
        }

        dateCreation = LocalDateTime.now();
    }

    public BigDecimal calculerPrixTTC() {
        BigDecimal multiplicateurTVA = BigDecimal.ONE.add(
                tauxTVAApplique.movePointLeft(2)
        );

        return prixHTApplique
                .multiply(multiplicateurTVA)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public boolean estActiveA(LocalDate date) {
        if (date == null || statut != StatutPeriodeAbonnement.ACTIVE) {
            return false;
        }

        return !date.isBefore(dateDebut)
                && !date.isAfter(dateFin);
    }

    public void activer() {
        if (statut != StatutPeriodeAbonnement.PLANIFIEE) {
            throw new IllegalStateException(
                    "Seule une période planifiée peut être activée"
            );
        }

        statut = StatutPeriodeAbonnement.ACTIVE;
    }

    public void marquerExpiree() {
        if (statut != StatutPeriodeAbonnement.ACTIVE) {
            throw new IllegalStateException(
                    "Seule une période active peut expirer"
            );
        }

        statut = StatutPeriodeAbonnement.EXPIREE;
    }

    public void annuler() {
        if (statut != StatutPeriodeAbonnement.PLANIFIEE) {
            throw new IllegalStateException(
                    "Seule une période planifiée peut être annulée"
            );
        }

        statut = StatutPeriodeAbonnement.ANNULEE;
    }

    private void verifierDates(
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        if (dateDebut == null || dateFin == null) {
            throw new IllegalArgumentException(
                    "Les dates de la période sont obligatoires"
            );
        }

        if (dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException(
                    "La date de fin doit être postérieure ou égale à la date de début"
            );
        }
    }

    private void verifierMontant(
            BigDecimal valeur,
            String libelle
    ) {
        if (valeur == null || valeur.signum() < 0) {
            throw new IllegalArgumentException(
                    libelle + " doit être positif ou nul"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public Integer getNumero() {
        return numero;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public StatutPeriodeAbonnement getStatut() {
        return statut;
    }

    public BigDecimal getPrixHTApplique() {
        return prixHTApplique;
    }

    public BigDecimal getTauxTVAApplique() {
        return tauxTVAApplique;
    }

    public Abonnement getAbonnement() {
        return abonnement;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }
}