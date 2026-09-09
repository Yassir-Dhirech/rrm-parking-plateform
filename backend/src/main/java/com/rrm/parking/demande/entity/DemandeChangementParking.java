package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "demande_changement_parking")
@PrimaryKeyJoinColumn(
        name = "id",
        foreignKey = @ForeignKey(
                name = "fk_changement_parking_demande"
        )
)
public class DemandeChangementParking extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "abonnement_concerne_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_changement_parking_abonnement"
            )
    )
    private AbonnementRegulier abonnementConcerne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "nouveau_parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_changement_parking_nouveau_parking"
            )
    )
    private Parking nouveauParking;

    @Column(name = "date_changement_souhaitee")
    private LocalDate dateChangementSouhaitee;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "affectation_generee_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_changement_parking_affectation"
            )
    )
    private AffectationParking affectationGeneree;

    protected DemandeChangementParking() {
        // Constructeur JPA
    }

    public DemandeChangementParking(
            String reference,
            CanalInitiation canalInitiation,
            ClientParticulier client,
            Utilisateur initieePar,
            AbonnementRegulier abonnementConcerne,
            Parking nouveauParking,
            LocalDate dateChangementSouhaitee
    ) {
        super(reference, canalInitiation, client, initieePar);

        verifierAbonnementDuClient(client, abonnementConcerne);

        this.abonnementConcerne = abonnementConcerne;
        this.nouveauParking = exigerNonNull(
                nouveauParking,
                "Le nouveau parking est obligatoire"
        );
        this.dateChangementSouhaitee = dateChangementSouhaitee;
    }

    public void selectionnerParking(Parking parking) {
        verifierModifiableAvantPaiement();

        this.nouveauParking = exigerNonNull(
                parking,
                "Le nouveau parking est obligatoire"
        );
    }

    public void modifierDateChangementSouhaitee(LocalDate date) {
        verifierModifiableAvantPaiement();
        this.dateChangementSouhaitee = date;
    }

    public void associerAffectationGeneree(AffectationParking affectation) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de générer l'affectation"
            );
        }

        if (affectationGeneree != null) {
            throw new IllegalStateException(
                    "Une affectation a déjà été générée pour cette demande"
            );
        }

        this.affectationGeneree = exigerNonNull(
                affectation,
                "L'affectation générée est obligatoire"
        );
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (abonnementConcerne == null) {
            throw new IllegalStateException(
                    "L'abonnement concerné est obligatoire"
            );
        }

        if (nouveauParking == null) {
            throw new IllegalStateException(
                    "Le nouveau parking est obligatoire"
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

        ClientParticulier proprietaire = abonnementValide.getClient();

        boolean memeClient = clientValide == proprietaire
                || (
                clientValide.getId() != null
                        && proprietaire != null
                        && clientValide.getId().equals(proprietaire.getId())
        );

        if (!memeClient) {
            throw new IllegalArgumentException(
                    "L'abonnement n'appartient pas au client de la demande"
            );
        }
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

    public Parking getNouveauParking() {
        return nouveauParking;
    }

    public LocalDate getDateChangementSouhaitee() {
        return dateChangementSouhaitee;
    }

    public AffectationParking getAffectationGeneree() {
        return affectationGeneree;
    }
}