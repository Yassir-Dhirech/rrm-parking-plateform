package com.rrm.parking.abonnement.entity;

import com.rrm.parking.parking.entity.Parking;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "affectation_parking",
        indexes = {
                @Index(
                        name = "idx_affectation_parking_abonnement",
                        columnList = "abonnement_regulier_id"
                ),
                @Index(
                        name = "idx_affectation_parking_parking",
                        columnList = "parking_id"
                )
        }
)
public class AffectationParking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "abonnement_regulier_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_affectation_parking_abonnement"
            )
    )
    private AbonnementRegulier abonnement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_affectation_parking_parking"
            )
    )
    private Parking parking;

    @Column(nullable = false)
    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    protected AffectationParking() {
    }

    public AffectationParking(
            AbonnementRegulier abonnement,
            Parking parking,
            LocalDate dateDebut
    ) {
        if (abonnement == null) {
            throw new IllegalArgumentException(
                    "L'abonnement est obligatoire"
            );
        }

        if (parking == null) {
            throw new IllegalArgumentException(
                    "Le parking est obligatoire"
            );
        }

        if (dateDebut == null) {
            throw new IllegalArgumentException(
                    "La date de début est obligatoire"
            );
        }

        this.abonnement = abonnement;
        this.parking = parking;
        this.dateDebut = dateDebut;
    }

    @PrePersist
    protected void avantCreation() {
        dateCreation = LocalDateTime.now();
    }

    public boolean estActiveA(LocalDate date) {
        if (date == null || date.isBefore(dateDebut)) {
            return false;
        }

        return dateFin == null || !date.isAfter(dateFin);
    }

    public void cloturer(LocalDate nouvelleDateFin) {
        if (dateFin != null) {
            throw new IllegalStateException(
                    "L'affectation est déjà clôturée"
            );
        }

        if (nouvelleDateFin == null
                || nouvelleDateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException(
                    "La date de fin ne peut pas précéder la date de début"
            );
        }

        dateFin = nouvelleDateFin;
    }

    public Long getId() {
        return id;
    }

    public AbonnementRegulier getAbonnement() {
        return abonnement;
    }

    public Parking getParking() {
        return parking;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }
}