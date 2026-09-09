package com.rrm.parking.client.entity;

import com.rrm.parking.client.enums.StatutClient;
import jakarta.persistence.*;
import com.rrm.parking.vehicule.entity.Vehicule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import java.time.LocalDateTime;

@Entity
@Table(name = "client")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 254)
    private String email;

    @Column(length = 30)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutClient statut;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @OneToMany(
            mappedBy = "client",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    private List<Vehicule> vehicules = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dateModification;

    private LocalDateTime dateArchivage;

    protected Client() {
    }

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        if (statut == null) {
            statut = StatutClient.ACTIF;
        }

        dateCreation = maintenant;
        dateModification = maintenant;
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void archiver() {
        statut = StatutClient.ARCHIVE;
        dateArchivage = LocalDateTime.now();
    }

    public void reactiver() {
        statut = StatutClient.ACTIF;
        dateArchivage = null;
    }

    public boolean possedeMoyenContact() {
        return estRenseigne(email) || estRenseigne(telephone);
    }

    private boolean estRenseigne(String valeur) {
        return valeur != null && !valeur.isBlank();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public StatutClient getStatut() {
        return statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public List<Vehicule> getVehicules() {
        return Collections.unmodifiableList(vehicules);
    }

    public void ajouterVehicule(Vehicule vehicule) {
        Objects.requireNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        if (!vehicules.contains(vehicule)) {
            vehicules.add(vehicule);
            vehicule.setClient(this);
        }
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public LocalDateTime getDateArchivage() {
        return dateArchivage;
    }
}