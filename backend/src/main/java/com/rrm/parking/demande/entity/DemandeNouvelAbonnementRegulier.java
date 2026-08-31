package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.tarification.entity.TarifParking;
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

    protected DemandeNouvelAbonnementRegulier() {
    }

    public DemandeNouvelAbonnementRegulier(
            String reference,
            CanalInitiation canalInitiation,
            ClientParticulier client,
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
        if (getStatut() != null) {
            throw new IllegalStateException(
                    "Le tarif ne peut plus être modifié après la soumission"
            );
        }

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

    @PrePersist
    private void verifierAvantCreation() {
        if (tarifParking == null) {
            throw new IllegalStateException(
                    "Un tarif doit être sélectionné avant l'enregistrement"
            );
        }
    }

    public TarifParking getTarifParking() {
        return tarifParking;
    }

    public AbonnementRegulier getAbonnementGenere() {
        return abonnementGenere;
    }
}