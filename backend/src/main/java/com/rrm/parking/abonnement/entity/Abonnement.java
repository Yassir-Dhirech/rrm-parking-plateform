package com.rrm.parking.abonnement.entity;

import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "abonnement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_abonnement_reference",
                        columnNames = "reference"
                )
        }
)
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutAbonnement statut;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private LocalDateTime dateModification;

    @OneToMany(
            mappedBy = "abonnement",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    @OrderBy("numero ASC")
    private List<PeriodeAbonnement> periodes = new ArrayList<>();

    protected Abonnement() {
    }

    protected Abonnement(String reference) {
        this.reference = reference;
        this.statut = StatutAbonnement.EN_ATTENTE_ACTIVATION;
    }

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        if (statut == null) {
            statut = StatutAbonnement.EN_ATTENTE_ACTIVATION;
        }

        dateCreation = maintenant;
        dateModification = maintenant;
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public boolean estActif() {
        return statut == StatutAbonnement.ACTIF;
    }

    public void activer() {
        if (statut != StatutAbonnement.EN_ATTENTE_ACTIVATION) {
            throw new IllegalStateException(
                    "Seul un abonnement en attente peut être activé"
            );
        }

        statut = StatutAbonnement.ACTIF;
    }

    public void suspendre(String motif) {
        verifierMotif(motif);

        if (statut != StatutAbonnement.ACTIF) {
            throw new IllegalStateException(
                    "Seul un abonnement actif peut être suspendu"
            );
        }

        statut = StatutAbonnement.SUSPENDU;
    }

    public void reactiver() {
        if (statut != StatutAbonnement.SUSPENDU) {
            throw new IllegalStateException(
                    "Seul un abonnement suspendu peut être réactivé"
            );
        }

        statut = StatutAbonnement.ACTIF;
    }

    public void resilier(String motif) {
        verifierMotif(motif);

        if (statut == StatutAbonnement.RESILIE) {
            throw new IllegalStateException(
                    "L'abonnement est déjà résilié"
            );
        }

        statut = StatutAbonnement.RESILIE;
    }

    public void marquerExpire() {
        if (statut == StatutAbonnement.RESILIE) {
            throw new IllegalStateException(
                    "Un abonnement résilié ne peut pas devenir expiré"
            );
        }

        statut = StatutAbonnement.EXPIRE;
    }

    private void verifierMotif(String motif) {
        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif est obligatoire"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public StatutAbonnement getStatut() {
        return statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public List<PeriodeAbonnement> getPeriodes() {
        return Collections.unmodifiableList(periodes);
    }

    public void ajouterPeriode(PeriodeAbonnement periode) {
        Objects.requireNonNull(
                periode,
                "La période est obligatoire"
        );

        if (periode.getAbonnement() != this) {
            throw new IllegalArgumentException(
                    "La période doit appartenir à cet abonnement"
            );
        }

        int prochainNumero = periodes.stream()
                .map(PeriodeAbonnement::getNumero)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        if (!periode.getNumero().equals(prochainNumero)) {
            throw new IllegalArgumentException(
                    "Le numéro attendu pour la nouvelle période est "
                            + prochainNumero
            );
        }

        obtenirDernierePeriodeNonAnnulee().ifPresent(derniere -> {
            LocalDate dateDebutAttendue =
                    derniere.getDateFin().plusDays(1);

            if (!periode.getDateDebut().equals(dateDebutAttendue)) {
                throw new IllegalArgumentException(
                        "La nouvelle période doit commencer le "
                                + dateDebutAttendue
                );
            }
        });

        periodes.add(periode);
    }

    public Optional<PeriodeAbonnement> obtenirPeriodeActive(
            LocalDate date
    ) {
        return periodes.stream()
                .filter(periode -> periode.estActiveA(date))
                .findFirst();
    }

    private Optional<PeriodeAbonnement>
    obtenirDernierePeriodeNonAnnulee() {
        return periodes.stream()
                .filter(periode ->
                        periode.getStatut()
                                != StatutPeriodeAbonnement.ANNULEE
                )
                .max(Comparator.comparing(
                        PeriodeAbonnement::getNumero
                ));
    }
}