package com.rrm.parking.carte.entity;

import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "demande_operationnelle",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_demande_operationnelle_reference",
                        columnNames = "reference"
                )
        },
        indexes = {
                @Index(
                        name = "idx_demande_operationnelle_carte",
                        columnList = "carte_acces_id"
                ),
                @Index(
                        name = "idx_demande_operationnelle_statut",
                        columnList = "statut"
                ),
                @Index(
                        name = "idx_demande_operationnelle_type",
                        columnList = "type_operation"
                )
        }
)
public class DemandeOperationnelle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "carte_acces_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_operationnelle_carte"
            )
    )
    private CarteAcces carteAcces;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_operation", nullable = false, length = 30)
    private TypeOperationCarte typeOperation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutDemandeOperationnelle statut;

    @Column(length = 1000)
    private String motif;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "creee_par_utilisateur_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_operationnelle_createur"
            )
    )
    private Utilisateur creeePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "affectee_a_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_demande_operationnelle_affectation"
            )
    )
    private Utilisateur affecteeA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "executee_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_demande_operationnelle_executeur"
            )
    )
    private Utilisateur executeePar;

    /*
     * Exemple :
     * une demande de suspension peut déclencher ensuite
     * une demande de désactivation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "demande_declencheuse_id",
            foreignKey = @ForeignKey(
                    name = "fk_demande_operationnelle_declencheuse"
            )
    )
    private DemandeOperationnelle demandeDeclencheuse;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_affectation")
    private LocalDateTime dateAffectation;

    @Column(name = "date_prise_en_charge")
    private LocalDateTime datePriseEnCharge;

    @Column(name = "date_execution")
    private LocalDateTime dateExecution;

    @Column(name = "date_rejet")
    private LocalDateTime dateRejet;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_rejet", length = 1000)
    private String motifRejet;

    @Column(name = "resultat_execution", length = 1000)
    private String resultatExecution;

    @Version
    @Column(nullable = false)
    private Long version;

    protected DemandeOperationnelle() {
        // Constructeur JPA
    }

    public DemandeOperationnelle(
            String reference,
            CarteAcces carteAcces,
            TypeOperationCarte typeOperation,
            String motif,
            Utilisateur creeePar
    ) {
        this.reference = normaliserReference(reference);
        this.carteAcces = exigerNonNull(
                carteAcces,
                "La carte d'accès est obligatoire"
        );
        this.typeOperation = exigerNonNull(
                typeOperation,
                "Le type d'opération est obligatoire"
        );
        this.creeePar = exigerNonNull(
                creeePar,
                "Le créateur de la demande est obligatoire"
        );

        this.motif = nettoyer(motif);
        verifierMotifOperation();

        this.statut = StatutDemandeOperationnelle.CREEE;
        this.dateCreation = LocalDateTime.now();

        preparerCarte();
    }

    public void definirDemandeDeclencheuse(
            DemandeOperationnelle demande
    ) {
        verifierModifiable();

        if (demande == null) {
            this.demandeDeclencheuse = null;
            return;
        }

        if (demande == this) {
            throw new IllegalArgumentException(
                    "Une demande ne peut pas se déclencher elle-même"
            );
        }

        if (id != null
                && demande.getId() != null
                && id.equals(demande.getId())) {
            throw new IllegalArgumentException(
                    "Une demande ne peut pas se déclencher elle-même"
            );
        }

        this.demandeDeclencheuse = demande;
    }

    public void affecterA(Utilisateur utilisateur) {
        if (statut != StatutDemandeOperationnelle.CREEE) {
            throw new IllegalStateException(
                    "Seule une demande créée peut être affectée"
            );
        }

        this.affecteeA = exigerNonNull(
                utilisateur,
                "L'utilisateur affecté est obligatoire"
        );
        this.statut = StatutDemandeOperationnelle.AFFECTEE;
        this.dateAffectation = LocalDateTime.now();
    }

    public void prendreEnCharge(Utilisateur utilisateur) {
        if (statut != StatutDemandeOperationnelle.CREEE
                && statut != StatutDemandeOperationnelle.AFFECTEE) {
            throw new IllegalStateException(
                    "La demande ne peut pas être prise en charge"
            );
        }

        Utilisateur executeur = exigerNonNull(
                utilisateur,
                "L'utilisateur est obligatoire"
        );

        if (affecteeA != null
                && !memeUtilisateur(affecteeA, executeur)) {
            throw new IllegalStateException(
                    "La demande est affectée à un autre utilisateur"
            );
        }

        if (affecteeA == null) {
            affecteeA = executeur;
            dateAffectation = LocalDateTime.now();
        }

        this.executeePar = executeur;
        this.statut = StatutDemandeOperationnelle.EN_COURS;
        this.datePriseEnCharge = LocalDateTime.now();
    }

    public void terminerImpression(
            Utilisateur utilisateur,
            String numeroCarte
    ) {
        verifierExecution(
                TypeOperationCarte.IMPRESSION,
                utilisateur
        );

        carteAcces.marquerCommeImprimee(numeroCarte);

        terminer(
                utilisateur,
                "Carte imprimée avec succès"
        );
    }

    public void terminerActivation(
            Utilisateur utilisateur
    ) {
        verifierExecution(
                TypeOperationCarte.ACTIVATION,
                utilisateur
        );

        carteAcces.activer();

        terminer(
                utilisateur,
                "Carte activée avec succès"
        );
    }

    public void terminerSuspension(
            Utilisateur utilisateur
    ) {
        verifierExecution(
                TypeOperationCarte.SUSPENSION,
                utilisateur
        );

        carteAcces.suspendre(motif);

        terminer(
                utilisateur,
                "Carte suspendue avec succès"
        );
    }

    public void terminerDesactivation(
            Utilisateur utilisateur
    ) {
        verifierExecution(
                TypeOperationCarte.DESACTIVATION,
                utilisateur
        );

        carteAcces.desactiver(motif);

        terminer(
                utilisateur,
                "Carte désactivée avec succès"
        );
    }

    public void refuser(
            String motifRejet,
            Utilisateur utilisateur
    ) {
        verifierNonTerminal();

        this.executeePar = exigerNonNull(
                utilisateur,
                "L'utilisateur qui refuse est obligatoire"
        );

        this.motifRejet = exigerTexte(
                motifRejet,
                "Le motif du refus est obligatoire"
        );

        this.statut = StatutDemandeOperationnelle.REFUSEE;
        this.dateRejet = LocalDateTime.now();
    }

    public void signalerEchec(
            String resultat,
            Utilisateur utilisateur
    ) {
        if (statut != StatutDemandeOperationnelle.EN_COURS) {
            throw new IllegalStateException(
                    "Seule une demande en cours peut échouer"
            );
        }

        this.executeePar = exigerNonNull(
                utilisateur,
                "L'utilisateur est obligatoire"
        );

        this.resultatExecution = exigerTexte(
                resultat,
                "La description de l'échec est obligatoire"
        );

        this.statut = StatutDemandeOperationnelle.ECHEC;
        this.dateExecution = LocalDateTime.now();
    }

    public void annuler(String motifAnnulation) {
        verifierNonTerminal();

        this.resultatExecution = exigerTexte(
                motifAnnulation,
                "Le motif d'annulation est obligatoire"
        );

        this.statut = StatutDemandeOperationnelle.ANNULEE;
        this.dateAnnulation = LocalDateTime.now();
    }

    private void terminer(
            Utilisateur utilisateur,
            String resultat
    ) {
        this.executeePar = utilisateur;
        this.resultatExecution = resultat;
        this.statut = StatutDemandeOperationnelle.TERMINEE;
        this.dateExecution = LocalDateTime.now();
    }

    private void verifierExecution(
            TypeOperationCarte typeAttendu,
            Utilisateur utilisateur
    ) {
        if (statut != StatutDemandeOperationnelle.EN_COURS) {
            throw new IllegalStateException(
                    "La demande doit être en cours"
            );
        }

        if (typeOperation != typeAttendu) {
            throw new IllegalStateException(
                    "Le type d'opération ne correspond pas"
            );
        }

        Utilisateur executeur = exigerNonNull(
                utilisateur,
                "L'utilisateur exécutant est obligatoire"
        );

        if (executeePar != null
                && !memeUtilisateur(executeePar, executeur)) {
            throw new IllegalStateException(
                    "La demande est prise en charge par un autre utilisateur"
            );
        }
    }

    private void preparerCarte() {
        switch (typeOperation) {
            case IMPRESSION ->
                    carteAcces.demanderImpression();

            case ACTIVATION ->
                    carteAcces.demanderActivation();

            case SUSPENSION, DESACTIVATION -> {
                // La carte changera d'état lors de l'exécution.
            }
        }
    }

    private void verifierMotifOperation() {
        if ((typeOperation == TypeOperationCarte.SUSPENSION
                || typeOperation
                == TypeOperationCarte.DESACTIVATION)
                && (motif == null || motif.isBlank())) {
            throw new IllegalArgumentException(
                    "Le motif est obligatoire pour cette opération"
            );
        }
    }

    private void verifierModifiable() {
        if (statut != StatutDemandeOperationnelle.CREEE) {
            throw new IllegalStateException(
                    "La demande n'est plus modifiable"
            );
        }
    }

    private void verifierNonTerminal() {
        if (statut == StatutDemandeOperationnelle.TERMINEE
                || statut == StatutDemandeOperationnelle.REFUSEE
                || statut == StatutDemandeOperationnelle.ECHEC
                || statut == StatutDemandeOperationnelle.ANNULEE) {
            throw new IllegalStateException(
                    "La demande est déjà terminée"
            );
        }
    }

    private boolean memeUtilisateur(
            Utilisateur premier,
            Utilisateur second
    ) {
        if (premier == second) {
            return true;
        }

        return premier != null
                && second != null
                && premier.getId() != null
                && premier.getId().equals(second.getId());
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        if (reference == null || reference.isBlank()) {
            throw new IllegalStateException(
                    "La référence est obligatoire"
            );
        }

        if (carteAcces == null
                || typeOperation == null
                || statut == null
                || creeePar == null) {
            throw new IllegalStateException(
                    "La demande opérationnelle est incomplète"
            );
        }

        verifierMotifOperation();

        if (demandeDeclencheuse == this) {
            throw new IllegalStateException(
                    "Une demande ne peut pas se déclencher elle-même"
            );
        }

        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }

    private static String normaliserReference(
            String reference
    ) {
        return exigerTexte(
                reference,
                "La référence est obligatoire"
        ).toUpperCase(Locale.ROOT);
    }

    private static String nettoyer(String valeur) {
        if (valeur == null || valeur.isBlank()) {
            return null;
        }

        return valeur.trim();
    }

    private static String exigerTexte(
            String valeur,
            String message
    ) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return valeur.trim();
    }

    private static <T> T exigerNonNull(
            T valeur,
            String message
    ) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public CarteAcces getCarteAcces() {
        return carteAcces;
    }

    public TypeOperationCarte getTypeOperation() {
        return typeOperation;
    }

    public StatutDemandeOperationnelle getStatut() {
        return statut;
    }

    public String getMotif() {
        return motif;
    }

    public Utilisateur getCreeePar() {
        return creeePar;
    }

    public Utilisateur getAffecteeA() {
        return affecteeA;
    }

    public Utilisateur getExecuteePar() {
        return executeePar;
    }

    public DemandeOperationnelle getDemandeDeclencheuse() {
        return demandeDeclencheuse;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateExecution() {
        return dateExecution;
    }

    public String getResultatExecution() {
        return resultatExecution;
    }

    public Long getVersion() {
        return version;
    }
}