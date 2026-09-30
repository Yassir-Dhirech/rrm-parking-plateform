package com.rrm.parking.carte.corporate;

import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "echeance_carte_corporate", uniqueConstraints =
        @UniqueConstraint(name = "uk_echeance_corporate_cycle", columnNames = {"carte_id", "activation_reference"}))
public class EcheanceCarteCorporate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carte_id", nullable = false)
    private CarteAcces carte;

    @Column(name = "activation_reference", nullable = false)
    private LocalDateTime activationReference;

    @Column(name = "date_echeance", nullable = false)
    private LocalDate dateEcheance;

    @Column(name = "date_rappel_anticipe")
    private LocalDateTime dateRappelAnticipe;

    @Column(name = "date_rappel_echeance")
    private LocalDateTime dateRappelEcheance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutEcheanceCorporate statut = StatutEcheanceCorporate.A_TRAITER;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_id", unique = true)
    private DemandeOperationnelle operation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandee_par_id")
    private Utilisateur demandeePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaree_par_id")
    private Utilisateur declareePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloturee_par_id")
    private Utilisateur clotureePar;

    private LocalDateTime dateDemande;
    private LocalDateTime dateDeclaration;
    private LocalDateTime dateCloture;

    @Version private Long version;

    protected EcheanceCarteCorporate() { }

    public EcheanceCarteCorporate(CarteAcces carte) {
        if (carte == null || carte.getDateActivation() == null) {
            throw new IllegalArgumentException("La carte corporate doit être activée");
        }
        this.carte = carte;
        this.activationReference = carte.getDateActivation();
        this.dateEcheance = activationReference.toLocalDate().plusMonths(24);
    }

    public void enregistrerRappels(LocalDate jour) {
        if (!jour.isBefore(dateEcheance.minusDays(2)) && dateRappelAnticipe == null) {
            dateRappelAnticipe = LocalDateTime.now();
        }
        if (!jour.isBefore(dateEcheance) && dateRappelEcheance == null) {
            dateRappelEcheance = LocalDateTime.now();
        }
    }

    public void demander(DemandeOperationnelle operation, Utilisateur responsable) {
        if (statut != StatutEcheanceCorporate.A_TRAITER || operation == null || responsable == null) {
            throw new IllegalStateException("La réactivation a déjà été demandée");
        }
        this.operation = operation;
        this.demandeePar = responsable;
        this.dateDemande = LocalDateTime.now();
        this.statut = StatutEcheanceCorporate.DEMANDEE;
    }

    public void declarer(Utilisateur superviseur) {
        if (statut != StatutEcheanceCorporate.DEMANDEE || superviseur == null) {
            throw new IllegalStateException("Cette réactivation n'attend pas de déclaration");
        }
        this.declareePar = superviseur;
        this.dateDeclaration = LocalDateTime.now();
        this.statut = StatutEcheanceCorporate.DECLAREE;
    }

    public void cloturer(Utilisateur responsable) {
        if (statut != StatutEcheanceCorporate.DECLAREE || responsable == null) {
            throw new IllegalStateException("La réactivation doit être déclarée avant clôture");
        }
        this.clotureePar = responsable;
        this.dateCloture = LocalDateTime.now();
        this.statut = StatutEcheanceCorporate.CLOTUREE;
    }

    public Long getId() { return id; }
    public CarteAcces getCarte() { return carte; }
    public LocalDateTime getActivationReference() { return activationReference; }
    public LocalDate getDateEcheance() { return dateEcheance; }
    public LocalDateTime getDateRappelAnticipe() { return dateRappelAnticipe; }
    public LocalDateTime getDateRappelEcheance() { return dateRappelEcheance; }
    public StatutEcheanceCorporate getStatut() { return statut; }
    public DemandeOperationnelle getOperation() { return operation; }
    public LocalDateTime getDateDemande() { return dateDemande; }
    public LocalDateTime getDateDeclaration() { return dateDeclaration; }
    public LocalDateTime getDateCloture() { return dateCloture; }
    public Utilisateur getDemandeePar() { return demandeePar; }
    public Utilisateur getDeclareePar() { return declareePar; }
    public Utilisateur getClotureePar() { return clotureePar; }
}
