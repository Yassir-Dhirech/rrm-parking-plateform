package com.rrm.parking.demande.entity;

import com.rrm.parking.demande.enums.OrigineTransition;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "historique_statut_demande",
        indexes = {
                @Index(
                        name = "idx_historique_demande",
                        columnList = "demande_id"
                ),
                @Index(
                        name = "idx_historique_date",
                        columnList = "date_changement"
                )
        }
)
public class HistoriqueStatutDemande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatutDemande ancienStatut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatutDemande nouveauStatut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrigineTransition origine;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateChangement;

    @Column(length = 1000)
    private String motif;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "demande_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_historique_statut_demande"
            )
    )
    private DemandeClient demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "effectue_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_historique_statut_utilisateur"
            )
    )
    private Utilisateur effectuePar;

    protected HistoriqueStatutDemande() {
    }

    HistoriqueStatutDemande(
            DemandeClient demande,
            StatutDemande ancienStatut,
            StatutDemande nouveauStatut,
            OrigineTransition origine,
            Utilisateur effectuePar,
            String motif
    ) {
        this.demande = Objects.requireNonNull(
                demande,
                "La demande est obligatoire"
        );

        this.nouveauStatut = Objects.requireNonNull(
                nouveauStatut,
                "Le nouveau statut est obligatoire"
        );

        this.origine = Objects.requireNonNull(
                origine,
                "L'origine de la transition est obligatoire"
        );

        verifierUtilisateur(origine, effectuePar);

        this.ancienStatut = ancienStatut;
        this.effectuePar = effectuePar;
        this.motif = motif;
        this.dateChangement = LocalDateTime.now();
    }

    private void verifierUtilisateur(
            OrigineTransition origine,
            Utilisateur utilisateur
    ) {
        if (origine == OrigineTransition.UTILISATEUR_INTERNE
                && utilisateur == null) {
            throw new IllegalArgumentException(
                    "L'utilisateur interne est obligatoire"
            );
        }

        if (origine != OrigineTransition.UTILISATEUR_INTERNE
                && utilisateur != null) {
            throw new IllegalArgumentException(
                    "Seule une transition interne peut avoir un utilisateur"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public StatutDemande getAncienStatut() {
        return ancienStatut;
    }

    public StatutDemande getNouveauStatut() {
        return nouveauStatut;
    }

    public OrigineTransition getOrigine() {
        return origine;
    }

    public LocalDateTime getDateChangement() {
        return dateChangement;
    }

    public String getMotif() {
        return motif;
    }

    public DemandeClient getDemande() {
        return demande;
    }

    public Utilisateur getEffectuePar() {
        return effectuePar;
    }
}