package com.rrm.parking.demande.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.util.Locale;

@Entity
@Table(name = "demande_changement_vehicule")
@PrimaryKeyJoinColumn(
        name = "id",
        foreignKey = @ForeignKey(
                name = "fk_changement_vehicule_demande"
        )
)
public class DemandeChangementVehicule extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "ancien_vehicule_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_changement_vehicule_ancien"
            )
    )
    private Vehicule ancienVehicule;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "nouveau_vehicule_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_changement_vehicule_nouveau"
            )
    )
    private Vehicule nouveauVehicule;

    @Column(name = "nouvelle_immatriculation", nullable = false, length = 30)
    private String nouvelleImmatriculation;

    @Column(name = "nouvelle_marque", length = 80)
    private String nouvelleMarque;

    @Column(name = "nouveau_modele", length = 80)
    private String nouveauModele;

    @Column(name = "nouvelle_couleur", length = 50)
    private String nouvelleCouleur;

    @Enumerated(EnumType.STRING)
    @Column(name = "nouveau_type", nullable = false, length = 30)
    private TypeVehicule nouveauType;

    @Column(name = "motif_changement", length = 1000)
    private String motifChangement;

    protected DemandeChangementVehicule() {
        // Constructeur JPA
    }

    public DemandeChangementVehicule(
            String reference,
            CanalInitiation canalInitiation,
            Client client,
            Utilisateur initieePar,
            Vehicule ancienVehicule,
            String nouvelleImmatriculation,
            String nouvelleMarque,
            String nouveauModele,
            String nouvelleCouleur,
            TypeVehicule nouveauType,
            String motifChangement
    ) {
        super(reference, canalInitiation, client, initieePar);

        verifierVehiculeDuClient(client, ancienVehicule);

        this.ancienVehicule = ancienVehicule;
        this.nouvelleImmatriculation =
                normaliserImmatriculation(nouvelleImmatriculation);
        this.nouvelleMarque = nettoyer(nouvelleMarque);
        this.nouveauModele = nettoyer(nouveauModele);
        this.nouvelleCouleur = nettoyer(nouvelleCouleur);
        this.nouveauType = exigerNonNull(
                nouveauType,
                "Le nouveau type de véhicule est obligatoire"
        );
        this.motifChangement = nettoyer(motifChangement);
    }

    public void modifierInformationsNouveauVehicule(
            String immatriculation,
            String marque,
            String modele,
            String couleur,
            TypeVehicule type
    ) {
        verifierDemandeNonSoumise();

        this.nouvelleImmatriculation =
                normaliserImmatriculation(immatriculation);
        this.nouvelleMarque = nettoyer(marque);
        this.nouveauModele = nettoyer(modele);
        this.nouvelleCouleur = nettoyer(couleur);
        this.nouveauType = exigerNonNull(
                type,
                "Le nouveau type de véhicule est obligatoire"
        );
    }

    public void associerNouveauVehicule(Vehicule vehicule) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de créer le nouveau véhicule"
            );
        }

        if (nouveauVehicule != null) {
            throw new IllegalStateException(
                    "Le nouveau véhicule a déjà été créé"
            );
        }

        Vehicule vehiculeValide = exigerNonNull(
                vehicule,
                "Le nouveau véhicule est obligatoire"
        );

        verifierVehiculeDuClient(getClient(), vehiculeValide);
        this.nouveauVehicule = vehiculeValide;
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (ancienVehicule == null) {
            throw new IllegalStateException(
                    "L'ancien véhicule est obligatoire"
            );
        }

        if (nouvelleImmatriculation == null
                || nouvelleImmatriculation.isBlank()) {
            throw new IllegalStateException(
                    "La nouvelle immatriculation est obligatoire"
            );
        }

        if (nouveauType == null) {
            throw new IllegalStateException(
                    "Le nouveau type de véhicule est obligatoire"
            );
        }
    }

    private void verifierVehiculeDuClient(
            Client client,
            Vehicule vehicule
    ) {
        Client clientValide = exigerNonNull(
                client,
                "Le client est obligatoire"
        );

        Vehicule vehiculeValide = exigerNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        Client proprietaire = vehiculeValide.getClient();

        boolean memeClient = clientValide == proprietaire
                || (
                clientValide.getId() != null
                        && proprietaire != null
                        && clientValide.getId().equals(proprietaire.getId())
        );

        if (!memeClient) {
            throw new IllegalArgumentException(
                    "Le véhicule n'appartient pas au client de la demande"
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

    private String normaliserImmatriculation(String valeur) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException(
                    "La nouvelle immatriculation est obligatoire"
            );
        }

        return valeur.trim().toUpperCase(Locale.ROOT);
    }

    private String nettoyer(String valeur) {
        if (valeur == null || valeur.isBlank()) {
            return null;
        }

        return valeur.trim();
    }

    private <T> T exigerNonNull(T valeur, String message) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public Vehicule getAncienVehicule() {
        return ancienVehicule;
    }

    public Vehicule getNouveauVehicule() {
        return nouveauVehicule;
    }

    public String getNouvelleImmatriculation() {
        return nouvelleImmatriculation;
    }

    public String getNouvelleMarque() {
        return nouvelleMarque;
    }

    public String getNouveauModele() {
        return nouveauModele;
    }

    public String getNouvelleCouleur() {
        return nouvelleCouleur;
    }

    public TypeVehicule getNouveauType() {
        return nouveauType;
    }

    public String getMotifChangement() {
        return motifChangement;
    }
}