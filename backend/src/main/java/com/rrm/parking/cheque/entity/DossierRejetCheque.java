package com.rrm.parking.cheque.entity;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.cheque.enums.StatutRejetCheque;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dossier_rejet_cheque", uniqueConstraints = {
        @UniqueConstraint(name = "uk_rejet_cheque_paiement", columnNames = "paiement_initial_id")
}, indexes = {
        @Index(name = "idx_rejet_abonnement_statut", columnList = "abonnement_id,statut")
})
public class DossierRejetCheque {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paiement_initial_id", nullable = false)
    private Paiement paiementInitial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "abonnement_id", nullable = false)
    private Abonnement abonnement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private StatutRejetCheque statut;

    @Column(name = "date_lettre_banque", nullable = false)
    private LocalDate dateLettreBanque;

    @Column(name = "constat_comptable", nullable = false, length = 2000)
    private String constatComptable;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "declare_par_id", nullable = false)
    private Utilisateur declarePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decide_par_id")
    private Utilisateur decidePar;

    @Column(name = "date_declaration", nullable = false)
    private LocalDateTime dateDeclaration;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(name = "date_blocage_cartes")
    private LocalDateTime dateBlocageCartes;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_regularisation_id", unique = true)
    private Paiement paiementRegularisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regularisation_enregistree_par_id")
    private Utilisateur regularisationEnregistreePar;

    @Column(name = "date_regularisation")
    private LocalDateTime dateRegularisation;

    @Column(name = "date_validation_paiement")
    private LocalDateTime dateValidationPaiement;

    @Column(name = "date_reactivation")
    private LocalDateTime dateReactivation;

    @Column(name = "date_activation_cartes")
    private LocalDateTime dateActivationCartes;

    @Column(name = "document_correctif_reference", length = 60)
    private String documentCorrectifReference;

    @Column(name = "facture_initiale_numero", length = 60)
    private String factureInitialeNumero;

    @Column(name = "document_correctif_total_ht", precision = 12, scale = 2)
    private java.math.BigDecimal documentCorrectifTotalHt;

    @Column(name = "document_correctif_total_tva", precision = 12, scale = 2)
    private java.math.BigDecimal documentCorrectifTotalTva;

    @Column(name = "document_correctif_total_ttc", precision = 12, scale = 2)
    private java.math.BigDecimal documentCorrectifTotalTtc;

    @Version
    private Long version;

    protected DossierRejetCheque() {}

    public DossierRejetCheque(Paiement initial, Abonnement abonnement,
                              LocalDate dateLettre, String constat, Utilisateur comptable) {
        this.paiementInitial = java.util.Objects.requireNonNull(initial);
        this.abonnement = java.util.Objects.requireNonNull(abonnement);
        this.dateLettreBanque = java.util.Objects.requireNonNull(dateLettre);
        this.declarePar = java.util.Objects.requireNonNull(comptable);
        this.constatComptable = texte(constat);
        this.statut = StatutRejetCheque.EN_ATTENTE_VALIDATION;
        this.dateDeclaration = LocalDateTime.now();
    }

    public void valider(Utilisateur responsable) {
        exiger(StatutRejetCheque.EN_ATTENTE_VALIDATION);
        this.decidePar = java.util.Objects.requireNonNull(responsable);
        this.dateDecision = LocalDateTime.now();
        this.statut = StatutRejetCheque.BLOCAGE_EN_COURS;
    }

    public void enregistrerDocumentCorrectif(String reference,
                                              com.rrm.parking.facturation.entity.Facture facture) {
        exiger(StatutRejetCheque.BLOCAGE_EN_COURS);
        this.documentCorrectifReference = java.util.Objects.requireNonNull(reference);
        this.factureInitialeNumero = facture.getNumero();
        this.documentCorrectifTotalHt = facture.getTotalHt();
        this.documentCorrectifTotalTva = facture.getTotalTva();
        this.documentCorrectifTotalTtc = facture.getTotalTtc();
    }

    public void cartesBloquees() {
        exiger(StatutRejetCheque.BLOCAGE_EN_COURS);
        this.dateBlocageCartes = LocalDateTime.now();
        this.statut = StatutRejetCheque.BLOQUE;
    }

    public void regulariser(Paiement paiement, Utilisateur agent) {
        exiger(StatutRejetCheque.BLOQUE);
        this.paiementRegularisation = java.util.Objects.requireNonNull(paiement);
        this.regularisationEnregistreePar = java.util.Objects.requireNonNull(agent);
        this.dateRegularisation = LocalDateTime.now();
        this.statut = StatutRejetCheque.REGULARISATION_ENREGISTREE;
    }

    public void reactiver() {
        exiger(StatutRejetCheque.REGULARISATION_ENREGISTREE);
        this.dateValidationPaiement = LocalDateTime.now();
        this.dateReactivation = LocalDateTime.now();
        this.statut = StatutRejetCheque.REACTIVATION_EN_COURS;
    }

    public void cartesReactivees() {
        exiger(StatutRejetCheque.REACTIVATION_EN_COURS);
        this.dateActivationCartes = LocalDateTime.now();
        this.statut = StatutRejetCheque.TERMINE;
    }

    private void exiger(StatutRejetCheque attendu) {
        if (statut != attendu) {
            throw new IllegalStateException("Transition impossible depuis " + statut);
        }
    }

    private String texte(String valeur) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException("Un compte rendu est obligatoire");
        }
        return valeur.trim();
    }

    public Long getId() { return id; }
    public Paiement getPaiementInitial() { return paiementInitial; }
    public Abonnement getAbonnement() { return abonnement; }
    public StatutRejetCheque getStatut() { return statut; }
    public LocalDate getDateLettreBanque() { return dateLettreBanque; }
    public String getConstatComptable() { return constatComptable; }
    public Utilisateur getDeclarePar() { return declarePar; }
    public Utilisateur getDecidePar() { return decidePar; }
    public LocalDateTime getDateDeclaration() { return dateDeclaration; }
    public LocalDateTime getDateDecision() { return dateDecision; }
    public LocalDateTime getDateBlocageCartes() { return dateBlocageCartes; }
    public Paiement getPaiementRegularisation() { return paiementRegularisation; }
    public Utilisateur getRegularisationEnregistreePar() { return regularisationEnregistreePar; }
    public LocalDateTime getDateRegularisation() { return dateRegularisation; }
    public LocalDateTime getDateValidationPaiement() { return dateValidationPaiement; }
    public LocalDateTime getDateReactivation() { return dateReactivation; }
    public LocalDateTime getDateActivationCartes() { return dateActivationCartes; }
    public String getDocumentCorrectifReference() { return documentCorrectifReference; }
    public String getFactureInitialeNumero() { return factureInitialeNumero; }
    public java.math.BigDecimal getDocumentCorrectifTotalHt() { return documentCorrectifTotalHt; }
    public java.math.BigDecimal getDocumentCorrectifTotalTva() { return documentCorrectifTotalTva; }
    public java.math.BigDecimal getDocumentCorrectifTotalTtc() { return documentCorrectifTotalTtc; }
}
