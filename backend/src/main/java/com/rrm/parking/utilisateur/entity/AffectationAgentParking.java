package com.rrm.parking.utilisateur.entity;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;

@Entity
@Table(
        name = "affectation_agent_parking",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_affectation_agent_parking_date",
                        columnNames = {
                                "utilisateur_id",
                                "parking_id",
                                "date_debut"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_affectation_agent_active",
                        columnList = "utilisateur_id, active"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AffectationAgentParking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_affectation_agent_utilisateur"
            )
    )
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "parking_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_affectation_agent_parking"
            )
    )
    private Parking parking;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(nullable = false)
    private boolean active = true;


}