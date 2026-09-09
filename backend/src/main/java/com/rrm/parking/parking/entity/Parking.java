package com.rrm.parking.parking.entity;

import com.rrm.parking.parking.enums.StatutParking;
import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "parking",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_parking_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(nullable = false, length = 255)
    private String adresse;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @PositiveOrZero
    @Column(name = "capacite_totale", nullable = false)
    private Integer capaciteTotale;

    @PositiveOrZero
    @Column(
            name = "capacite_reservee_abonnements",
            nullable = false
    )
    private Integer capaciteReserveeAbonnements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutParking statut = StatutParking.ACTIF;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @Column(name = "date_archivage")
    private LocalDateTime dateArchivage;

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        dateCreation = maintenant;
        dateModification = maintenant;

        if (statut == null) {
            statut = StatutParking.ACTIF;
        }
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void activer() {
        statut = StatutParking.ACTIF;
        dateArchivage = null;
    }

    public void suspendre() {
        statut = StatutParking.SUSPENDU;
    }

    public void archiver() {
        statut = StatutParking.ARCHIVE;
        dateArchivage = LocalDateTime.now();
    }

    public void modifierCapacites(
            Integer nouvelleCapaciteTotale,
            Integer nouvelleCapaciteReservee
    ) {
        if (nouvelleCapaciteTotale == null
                || nouvelleCapaciteReservee == null
                || nouvelleCapaciteTotale < 0
                || nouvelleCapaciteReservee < 0) {
            throw new IllegalArgumentException(
                    "Les capacités doivent être positives ou nulles"
            );
        }

        if (nouvelleCapaciteReservee > nouvelleCapaciteTotale) {
            throw new IllegalArgumentException(
                    "La capacité réservée ne peut pas dépasser la capacité totale"
            );
        }

        capaciteTotale = nouvelleCapaciteTotale;
        capaciteReserveeAbonnements =
                nouvelleCapaciteReservee;
    }
}