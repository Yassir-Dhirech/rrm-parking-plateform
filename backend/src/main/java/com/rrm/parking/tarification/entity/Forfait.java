package com.rrm.parking.tarification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "forfait",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_forfait_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Forfait {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(length = 500)
    private String description;

    @Column(name = "place_reservee", nullable = false)
    private Boolean placeReservee = false;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        dateCreation = maintenant;
        dateModification = maintenant;

        if (placeReservee == null) {
            placeReservee = false;
        }

        if (actif == null) {
            actif = true;
        }
    }

    @OneToMany(
            mappedBy = "forfait",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PlageAcces> plagesAcces = new ArrayList<>();

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void activer() {
        actif = true;
    }

    public void desactiver() {
        actif = false;
    }

    public void ajouterPlageAcces(PlageAcces plageAcces) {
        if (plageAcces == null) {
            throw new IllegalArgumentException(
                    "La plage d'accès est obligatoire"
            );
        }

        plagesAcces.add(plageAcces);
        plageAcces.setForfait(this);
    }

    public void retirerPlageAcces(PlageAcces plageAcces) {
        plagesAcces.remove(plageAcces);

        if (plageAcces != null) {
            plageAcces.setForfait(null);
        }
    }
}