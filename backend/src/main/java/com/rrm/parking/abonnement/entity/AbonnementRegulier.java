package com.rrm.parking.abonnement.entity;

import com.rrm.parking.client.entity.ClientParticulier;
import jakarta.persistence.*;
import com.rrm.parking.parking.entity.Parking;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.time.LocalDate;
import java.util.Optional;

@Entity
@Table(name = "abonnement_regulier")
@PrimaryKeyJoinColumn(name = "id")
public class AbonnementRegulier extends Abonnement {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_particulier_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_abonnement_regulier_client"
            )
    )
    private ClientParticulier client;

    @OneToMany(
            mappedBy = "abonnement",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    @OrderBy("dateDebut ASC")
    private List<AffectationParking> affectationsParking =
            new ArrayList<>();

    protected AbonnementRegulier() {
    }

    public AbonnementRegulier(
            String reference,
            ClientParticulier client
    ) {
        super(reference);

        if (client == null) {
            throw new IllegalArgumentException(
                    "Le client particulier est obligatoire"
            );
        }

        this.client = client;
    }

    public boolean peutEtreRenouvele() {
        return estActif() && !getPeriodes().isEmpty();
    }

    public Optional<PeriodeAbonnement> obtenirPeriodeActive() {
        return obtenirPeriodeActive(LocalDate.now());
    }

    public ClientParticulier getClient() {
        return client;
    }
    public List<AffectationParking> getAffectationsParking() {
        return Collections.unmodifiableList(affectationsParking);
    }

    public Optional<AffectationParking> obtenirAffectationActive(
            LocalDate date
    ) {
        return affectationsParking.stream()
                .filter(affectation -> affectation.estActiveA(date))
                .findFirst();
    }

    public void affecterParkingInitial(
            Parking parking,
            LocalDate dateDebut
    ) {
        Objects.requireNonNull(
                parking,
                "Le parking est obligatoire"
        );

        Objects.requireNonNull(
                dateDebut,
                "La date de début est obligatoire"
        );

        if (!affectationsParking.isEmpty()) {
            throw new IllegalStateException(
                    "L'abonnement possède déjà une affectation parking"
            );
        }

        affectationsParking.add(
                new AffectationParking(this, parking, dateDebut)
        );
    }

    public void changerParking(
            Parking nouveauParking,
            LocalDate dateChangement
    ) {
        Objects.requireNonNull(
                nouveauParking,
                "Le nouveau parking est obligatoire"
        );

        Objects.requireNonNull(
                dateChangement,
                "La date de changement est obligatoire"
        );

        if (!estActif()) {
            throw new IllegalStateException(
                    "Seul un abonnement actif peut changer de parking"
            );
        }

        AffectationParking affectationActuelle =
                obtenirAffectationActive(
                        dateChangement.minusDays(1)
                ).orElseThrow(() ->
                        new IllegalStateException(
                                "Aucune affectation parking active"
                        )
                );

        if (!dateChangement.isAfter(
                affectationActuelle.getDateDebut()
        )) {
            throw new IllegalArgumentException(
                    "La date de changement doit être postérieure au début de l'affectation actuelle"
            );
        }

        if (memeParking(
                affectationActuelle.getParking(),
                nouveauParking
        )) {
            throw new IllegalArgumentException(
                    "Le nouveau parking doit être différent du parking actuel"
            );
        }

        affectationActuelle.cloturer(
                dateChangement.minusDays(1)
        );

        affectationsParking.add(
                new AffectationParking(
                        this,
                        nouveauParking,
                        dateChangement
                )
        );
    }

    private boolean memeParking(
            Parking premier,
            Parking second
    ) {
        if (premier == second) {
            return true;
        }

        if (premier.getId() == null || second.getId() == null) {
            return false;
        }

        return premier.getId().equals(second.getId());
    }
}