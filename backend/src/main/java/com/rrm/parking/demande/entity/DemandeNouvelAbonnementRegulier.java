package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "demande_nouvel_abonnement_regulier")
@PrimaryKeyJoinColumn(name = "id")
public class DemandeNouvelAbonnementRegulier
        extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tarif_parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_nouvel_abonnement_tarif"
            )
    )
    private TarifParking tarifParking;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "abonnement_genere_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_demande_nouvel_abonnement_genere"
            )
    )
    private AbonnementRegulier abonnementGenere;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "vehicule_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_nouvel_abonnement_vehicule"
            )
    )
    private Vehicule vehicule;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "mode_paiement_souhaite",
            nullable = false,
            length = 20,
            columnDefinition = "VARCHAR(20)"
    )
    private ModePaiement modePaiementSouhaite;

    protected DemandeNouvelAbonnementRegulier() {
    }



    public DemandeNouvelAbonnementRegulier(
            String reference,
            CanalInitiation canalInitiation,
            Client client,
            Utilisateur initieePar
    ) {
        super(
                reference,
                canalInitiation,
                client,
                initieePar
        );
    }

    public void selectionnerTarif(
            TarifParking tarifParking
    ) {
        verifierModifiableAvantPaiement();

        this.tarifParking = Objects.requireNonNull(
                tarifParking,
                "Le tarif parking est obligatoire"
        );
    }

    public void associerAbonnementGenere(
            AbonnementRegulier abonnement
    ) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de générer l'abonnement"
            );
        }

        if (abonnementGenere != null) {
            throw new IllegalStateException(
                    "La demande a déjà généré un abonnement"
            );
        }

        abonnementGenere = Objects.requireNonNull(
                abonnement,
                "L'abonnement généré est obligatoire"
        );
    }

    private void verifierVehiculeDuClient(Vehicule vehicule) {
        Client clientDemande = getClient();
        Client proprietaire = vehicule.getClient();

        boolean memeClient =
                clientDemande == proprietaire
                        || (
                        clientDemande != null
                                && proprietaire != null
                                && clientDemande.getId() != null
                                && clientDemande.getId()
                                .equals(proprietaire.getId())
                );

        if (!memeClient) {
            throw new IllegalArgumentException(
                    "Le véhicule n'appartient pas au client de la demande"
            );
        }
    }

    public void selectionnerVehicule(Vehicule vehicule) {
        verifierModifiableAvantPaiement();

        Vehicule vehiculeValide = Objects.requireNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        verifierVehiculeDuClient(vehiculeValide);
        this.vehicule = vehiculeValide;
    }

    public void choisirModePaiement(
            ModePaiement modePaiement
    ) {
        verifierModifiableAvantPaiement();

        this.modePaiementSouhaite = Objects.requireNonNull(
                modePaiement,
                "Le mode de paiement souhaité est obligatoire"
        );
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (tarifParking == null) {
            throw new IllegalStateException(
                    "Un tarif doit être sélectionné"
            );
        }

        if (vehicule == null) {
            throw new IllegalStateException(
                    "Un véhicule doit être sélectionné"
            );
        }

        if (modePaiementSouhaite == null) {
            throw new IllegalStateException(
                    "Le mode de paiement souhaité est obligatoire"
            );
        }
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public ModePaiement getModePaiementSouhaite() {
        return modePaiementSouhaite;
    }

    public TarifParking getTarifParking() {
        return tarifParking;
    }

    public AbonnementRegulier getAbonnementGenere() {
        return abonnementGenere;
    }
}