package com.rrm.parking.utilisateur.entity;

import com.rrm.parking.security.entity.Role;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "utilisateur",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_utilisateur_email",
                        columnNames = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(name = "mot_de_passe_hash", nullable = false, length = 255)
    private String motDePasseHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutUtilisateur statut = StatutUtilisateur.ACTIF;

    @Column(name = "tentatives_connexion_echouees", nullable = false)
    private int tentativesConnexionEchouees = 0;

    @Column(name = "date_blocage")
    private LocalDateTime dateBlocage;

    @Column(name = "date_derniere_connexion")
    private LocalDateTime dateDerniereConnexion;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "utilisateur_role",
            joinColumns = @JoinColumn(
                    name = "utilisateur_id",
                    foreignKey = @ForeignKey(name = "fk_utilisateur_role_utilisateur")
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "role_id",
                    foreignKey = @ForeignKey(name = "fk_utilisateur_role_role")
            ),
            uniqueConstraints = {
                    @UniqueConstraint(
                            name = "uk_utilisateur_role",
                            columnNames = {"utilisateur_id", "role_id"}
                    )
            }
    )
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    void avantCreation() {
        normaliserEmail();
        dateCreation = LocalDateTime.now();
        dateModification = dateCreation;
    }

    @PreUpdate
    void avantModification() {
        normaliserEmail();
        dateModification = LocalDateTime.now();
    }

    private void normaliserEmail() {
        if (email != null) {
            email = email.trim().toLowerCase();
        }
    }

    public void ajouterRole(Role role) {
        roles.add(role);
    }

    public void retirerRole(Role role) {
        roles.remove(role);
    }
}