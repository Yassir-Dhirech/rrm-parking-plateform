package com.rrm.parking.tarification.entity;

import com.rrm.parking.tarification.enums.JourSemaine;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plage_acces")
@Getter
@Setter
@NoArgsConstructor
public class PlageAcces {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(
            name = "plage_acces_jour",
            joinColumns = @JoinColumn(name = "plage_acces_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "jour_semaine", nullable = false, length = 15)
    private Set<JourSemaine> joursApplicables = new HashSet<>();


    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

    @Column(name = "acces_toute_la_journee", nullable = false)
    private Boolean accesTouteLaJournee = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "forfait_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_plage_acces_forfait")
    )
    private Forfait forfait;

    @PrePersist
    @PreUpdate
    protected void verifierCoherence() {
        if (accesTouteLaJournee == null) {
            accesTouteLaJournee = false;
        }

        if (joursApplicables == null || joursApplicables.isEmpty()) {
            throw new IllegalStateException(
                    "Une plage d'accès doit contenir au moins un jour"
            );
        }

        if (accesTouteLaJournee) {
            heureDebut = null;
            heureFin = null;
        } else if (heureDebut == null || heureFin == null) {
            throw new IllegalStateException(
                    "Les heures de début et de fin sont obligatoires"
            );
        }
    }

    public boolean estApplicableA(LocalDate date) {
        if (date == null) {
            return false;
        }

        JourSemaine jour =
                JourSemaine.depuis(date.getDayOfWeek());

        return joursApplicables.contains(jour);
    }



}