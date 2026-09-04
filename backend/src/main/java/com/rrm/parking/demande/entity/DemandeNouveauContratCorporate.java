package com.rrm.parking.demande.entity;

import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.vehicule.entity.Vehicule;
import jakarta.persistence.*;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "demande_nouveau_contrat_corporate")
@PrimaryKeyJoinColumn(
        name = "id",
        foreignKey = @ForeignKey(
                name = "fk_demande_corporate_demande"
        )
)
public class DemandeNouveauContratCorporate extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tarif_parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_corporate_tarif"
            )
    )
    private TarifParking tarifParking;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "demande_corporate_vehicule",
            joinColumns = @JoinColumn(
                    name = "demande_id",
                    foreignKey = @ForeignKey(
                            name = "fk_demande_corporate_vehicule_demande"
                    )
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "vehicule_id",
                    foreignKey = @ForeignKey(
                            name = "fk_demande_corporate_vehicule_vehicule"
                    )
            ),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_demande_corporate_vehicule",
                    columnNames = {"demande_id", "vehicule_id"}
            )
    )
    private Set<Vehicule> vehiculesSelectionnes = new LinkedHashSet<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "contrat_genere_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_demande_corporate_contrat"
            )
    )
    private ContratCorporate contratGenere;

    protected DemandeNouveauContratCorporate() {
        // Constructeur JPA
    }

    public DemandeNouveauContratCorporate(
            String reference,
            CanalInitiation canalInitiation,
            ClientEntreprise client,
            Utilisateur initieePar,
            TarifParking tarifParking
    ) {
        super(reference, canalInitiation, client, initieePar);

        this.tarifParking = exigerNonNull(
                tarifParking,
                "Le tarif corporate est obligatoire"
        );
    }

    public void selectionnerTarif(TarifParking tarif) {
        verifierDemandeNonSoumise();

        this.tarifParking = exigerNonNull(
                tarif,
                "Le tarif corporate est obligatoire"
        );
    }

    public void ajouterVehicule(Vehicule vehicule) {
        verifierDemandeNonSoumise();

        Vehicule vehiculeValide = exigerNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        verifierVehiculeEntreprise(vehiculeValide);
        vehiculesSelectionnes.add(vehiculeValide);
    }

    public void retirerVehicule(Vehicule vehicule) {
        verifierDemandeNonSoumise();

        if (vehicule == null) {
            return;
        }

        vehiculesSelectionnes.remove(vehicule);
    }

    public void associerContratGenere(ContratCorporate contrat) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de générer le contrat"
            );
        }

        if (contratGenere != null) {
            throw new IllegalStateException(
                    "Un contrat a déjà été généré pour cette demande"
            );
        }

        this.contratGenere = exigerNonNull(
                contrat,
                "Le contrat généré est obligatoire"
        );
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (tarifParking == null) {
            throw new IllegalStateException(
                    "Le tarif corporate est obligatoire"
            );
        }
    }

    private void verifierVehiculeEntreprise(Vehicule vehicule) {
        Client clientDemande = getClient();
        Client proprietaireVehicule = vehicule.getClient();

        boolean memeClient = clientDemande == proprietaireVehicule
                || (
                clientDemande != null
                        && proprietaireVehicule != null
                        && clientDemande.getId() != null
                        && clientDemande.getId()
                        .equals(proprietaireVehicule.getId())
        );

        if (!memeClient) {
            throw new IllegalArgumentException(
                    "Le véhicule n'appartient pas à l'entreprise de la demande"
            );
        }
    }

    private void verifierDemandeNonSoumise() {
        if (getStatut() != null) {
            throw new IllegalStateException(
                    "La demande ne peut plus être modifiée après sa soumission"
            );
        }
    }

    private <T> T exigerNonNull(T valeur, String message) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public TarifParking getTarifParking() {
        return tarifParking;
    }

    public Set<Vehicule> getVehiculesSelectionnes() {
        return Collections.unmodifiableSet(vehiculesSelectionnes);
    }

    public ContratCorporate getContratGenere() {
        return contratGenere;
    }
}