package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import com.rrm.parking.abonnement.entity.Abonnement;

@Entity
@Table(name = "demande_renouvellement_regulier")
@PrimaryKeyJoinColumn(
        name = "id",
        foreignKey = @ForeignKey(
                name = "fk_renouvellement_demande"
        )
)
public class DemandeRenouvellementRegulier extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "abonnement_concerne_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_renouvellement_abonnement"
            )
    )
    private AbonnementRegulier abonnementConcerne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tarif_parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_renouvellement_tarif"
            )
    )
    private TarifParking tarifParking;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "periode_generee_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_renouvellement_periode"
            )
    )
    private PeriodeAbonnement periodeGeneree;

    protected DemandeRenouvellementRegulier() {
        // Constructeur JPA
    }

    public DemandeRenouvellementRegulier(
            String reference,
            CanalInitiation canalInitiation,
            ClientParticulier client,
            Utilisateur initieePar,
            AbonnementRegulier abonnementConcerne,
            TarifParking tarifParking
    ) {
        super(reference, canalInitiation, client, initieePar);

        verifierAbonnementDuClient(client, abonnementConcerne);

        this.abonnementConcerne = abonnementConcerne;
        this.tarifParking = exigerNonNull(
                tarifParking,
                "Le tarif du renouvellement est obligatoire"
        );
    }

    public void selectionnerTarif(TarifParking nouveauTarif) {
        if (getStatut() != null) {
            throw new IllegalStateException(
                    "Le tarif ne peut plus être modifié après la soumission"
            );
        }

        this.tarifParking = exigerNonNull(
                nouveauTarif,
                "Le tarif est obligatoire"
        );
    }

    public void associerPeriodeGeneree(PeriodeAbonnement periode) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de générer une période"
            );
        }

        if (periodeGeneree != null) {
            throw new IllegalStateException(
                    "Une période a déjà été générée pour cette demande"
            );
        }

        PeriodeAbonnement periodeValidee = exigerNonNull(
                periode,
                "La période générée est obligatoire"
        );

        if (!memeAbonnement(
                abonnementConcerne,
                periodeValidee.getAbonnement()
        )) {
            throw new IllegalArgumentException(
                    "La période doit appartenir à l'abonnement concerné"
            );
        }

        this.periodeGeneree = periodeValidee;
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (abonnementConcerne == null) {
            throw new IllegalStateException(
                    "L'abonnement concerné est obligatoire"
            );
        }

        if (tarifParking == null) {
            throw new IllegalStateException(
                    "Le tarif du renouvellement est obligatoire"
            );
        }
    }

    private void verifierAbonnementDuClient(
            ClientParticulier client,
            AbonnementRegulier abonnement
    ) {
        ClientParticulier clientValide = exigerNonNull(
                client,
                "Le client est obligatoire"
        );

        AbonnementRegulier abonnementValide = exigerNonNull(
                abonnement,
                "L'abonnement concerné est obligatoire"
        );

        if (!memeClient(clientValide, abonnementValide.getClient())) {
            throw new IllegalArgumentException(
                    "L'abonnement n'appartient pas au client de la demande"
            );
        }
    }

    private boolean memeClient(
            ClientParticulier premier,
            ClientParticulier second
    ) {
        if (premier == second) {
            return true;
        }

        return premier != null
                && second != null
                && premier.getId() != null
                && premier.getId().equals(second.getId());
    }

    private boolean memeAbonnement(
            Abonnement premier,
            Abonnement second
    ) {
        if (premier == second) {
            return true;
        }

        return premier != null
                && second != null
                && premier.getId() != null
                && premier.getId().equals(second.getId());
    }

    private <T> T exigerNonNull(T valeur, String message) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public AbonnementRegulier getAbonnementConcerne() {
        return abonnementConcerne;
    }

    public TarifParking getTarifParking() {
        return tarifParking;
    }

    public PeriodeAbonnement getPeriodeGeneree() {
        return periodeGeneree;
    }
}