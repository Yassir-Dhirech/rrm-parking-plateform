package com.rrm.parking.tarification.entity;

import com.rrm.parking.parking.entity.Parking;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tarif_parking",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tarif_parking_forfait_duree_date",
                        columnNames = {
                                "parking_id",
                                "forfait_id",
                                "duree_en_mois",
                                "date_debut_validite"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class TarifParking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "parking_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_tarif_parking_parking")
    )
    private Parking parking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "forfait_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_tarif_parking_forfait")
    )
    private Forfait forfait;

    @Positive
    @Column(name = "duree_en_mois", nullable = false)
    private Integer dureeEnMois;

    @DecimalMin(value = "0.00")
    @Column(
            name = "prix_ht",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal prixHT;

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00")
    @Column(
            name = "taux_tva",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal tauxTVA;

    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void avantCreation() {
        dateCreation = LocalDateTime.now();
        verifierCoherence();
    }

    @PreUpdate
    protected void avantModification() {
        verifierCoherence();
    }

    private void verifierCoherence() {
        if (dateDebutValidite == null) {
            throw new IllegalStateException(
                    "La date de début de validité est obligatoire"
            );
        }

        if (dateFinValidite != null
                && dateFinValidite.isBefore(dateDebutValidite)) {
            throw new IllegalStateException(
                    "La date de fin ne peut pas précéder la date de début"
            );
        }
    }

    public BigDecimal calculerPrixTTC() {
        if (prixHT == null || tauxTVA == null) {
            throw new IllegalStateException(
                    "Le prix HT et le taux de TVA sont obligatoires"
            );
        }

        BigDecimal coefficientTVA = BigDecimal.ONE.add(
                tauxTVA.divide(
                        BigDecimal.valueOf(100),
                        4,
                        RoundingMode.HALF_UP
                )
        );

        return prixHT
                .multiply(coefficientTVA)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public boolean estApplicableA(LocalDate date) {
        if (date == null || dateDebutValidite == null) {
            return false;
        }

        boolean apresDebut =
                !date.isBefore(dateDebutValidite);

        boolean avantFin =
                dateFinValidite == null
                        || !date.isAfter(dateFinValidite);

        return apresDebut && avantFin;
    }

    public void cloturer(LocalDate dateFin) {
        if (dateFin == null) {
            throw new IllegalArgumentException(
                    "La date de clôture est obligatoire"
            );
        }

        if (dateDebutValidite != null
                && dateFin.isBefore(dateDebutValidite)) {
            throw new IllegalArgumentException(
                    "La date de clôture ne peut pas précéder le début"
            );
        }

        dateFinValidite = dateFin;
    }
}