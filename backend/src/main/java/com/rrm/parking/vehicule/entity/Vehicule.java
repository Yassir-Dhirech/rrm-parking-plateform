package com.rrm.parking.vehicule.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.vehicule.enums.StatutVehicule;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "vehicule",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_vehicule_immatriculation",
                        columnNames = "immatriculation"
                )
        }
)
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String immatriculation;

    @Column(length = 100)
    private String marque;

    @Column(length = 100)
    private String modele;

    @Column(length = 50)
    private String couleur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeVehicule type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutVehicule statut;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_vehicule_client")
    )
    private Client client;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private LocalDateTime dateModification;

    private LocalDateTime dateArchivage;

    protected Vehicule() {
    }

    public Vehicule(
            String immatriculation,
            TypeVehicule type,
            Client client
    ) {
        this.immatriculation = immatriculation;
        this.type = type;
        this.client = client;
    }

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        if (statut == null) {
            statut = StatutVehicule.ACTIF;
        }

        dateCreation = maintenant;
        dateModification = maintenant;
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void archiver() {
        statut = StatutVehicule.ARCHIVE;
        dateArchivage = LocalDateTime.now();
    }

    public void reactiver() {
        statut = StatutVehicule.ACTIF;
        dateArchivage = null;
    }

    public Long getId() {
        return id;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public TypeVehicule getType() {
        return type;
    }

    public void setType(TypeVehicule type) {
        this.type = type;
    }

    public StatutVehicule getStatut() {
        return statut;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public LocalDateTime getDateArchivage() {
        return dateArchivage;
    }
}