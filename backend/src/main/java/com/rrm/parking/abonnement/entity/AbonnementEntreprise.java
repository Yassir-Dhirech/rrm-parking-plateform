package com.rrm.parking.abonnement.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.contrat.enums.StatutContrat;
import com.rrm.parking.vehicule.entity.Vehicule;
import jakarta.persistence.*;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "abonnement_entreprise")
@PrimaryKeyJoinColumn(name = "id")
public class AbonnementEntreprise extends Abonnement {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "contrat_corporate_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_abonnement_entreprise_contrat"
            )
    )
    private ContratCorporate contrat;

    @ManyToMany
    @JoinTable(
            name = "abonnement_entreprise_vehicule",
            joinColumns = @JoinColumn(
                    name = "abonnement_entreprise_id",
                    foreignKey = @ForeignKey(
                            name = "fk_abonnement_entreprise_vehicule_abonnement"
                    )
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "vehicule_id",
                    foreignKey = @ForeignKey(
                            name = "fk_abonnement_entreprise_vehicule_vehicule"
                    )
            ),
            uniqueConstraints = {
                    @UniqueConstraint(
                            name = "uk_abonnement_entreprise_vehicule",
                            columnNames = {
                                    "abonnement_entreprise_id",
                                    "vehicule_id"
                            }
                    )
            }
    )
    private Set<Vehicule> vehicules = new LinkedHashSet<>();

    protected AbonnementEntreprise() {
    }

    public AbonnementEntreprise(
            String reference,
            ContratCorporate contrat
    ) {
        super(reference);

        if (contrat == null) {
            throw new IllegalArgumentException(
                    "Le contrat corporate est obligatoire"
            );
        }

        if (contrat.getStatut() != StatutContrat.ACTIF) {
            throw new IllegalStateException(
                    "Le contrat doit être actif avant de créer l'abonnement"
            );
        }

        this.contrat = contrat;
    }

    public void ajouterVehicule(Vehicule vehicule) {
        Objects.requireNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        verifierProprietaire(vehicule);

        if (vehicules.contains(vehicule)) {
            throw new IllegalArgumentException(
                    "Le véhicule est déjà couvert par cet abonnement"
            );
        }

        if (vehicules.size()
                >= contrat.getNombrePlacesContractuelles()) {
            throw new IllegalStateException(
                    "Le nombre maximal de véhicules du contrat est atteint"
            );
        }

        vehicules.add(vehicule);
    }

    public void retirerVehicule(Vehicule vehicule) {
        Objects.requireNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        if (!vehicules.remove(vehicule)) {
            throw new IllegalArgumentException(
                    "Le véhicule n'est pas couvert par cet abonnement"
            );
        }
    }

    public boolean contientVehicule(Vehicule vehicule) {
        return vehicule != null && vehicules.contains(vehicule);
    }

    private void verifierProprietaire(Vehicule vehicule) {
        Client proprietaire = vehicule.getClient();
        Client entrepriseDuContrat =
                contrat.getClientEntreprise();

        if (proprietaire == entrepriseDuContrat) {
            return;
        }

        if (proprietaire == null
                || proprietaire.getId() == null
                || entrepriseDuContrat.getId() == null
                || !proprietaire.getId().equals(
                entrepriseDuContrat.getId()
        )) {
            throw new IllegalArgumentException(
                    "Le véhicule doit appartenir à l'entreprise du contrat"
            );
        }
    }

    public ContratCorporate getContrat() {
        return contrat;
    }

    public Set<Vehicule> getVehicules() {
        return Collections.unmodifiableSet(vehicules);
    }
}