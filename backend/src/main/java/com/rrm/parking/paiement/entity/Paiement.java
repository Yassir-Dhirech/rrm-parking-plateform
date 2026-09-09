package com.rrm.parking.paiement.entity;

import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutCheque;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "paiement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_paiement_reference",
                        columnNames = "reference"
                )
        },
        indexes = {
                @Index(
                        name = "idx_paiement_demande",
                        columnList = "demande_id"
                ),
                @Index(
                        name = "idx_paiement_statut",
                        columnList = "statut"
                )
        }
)
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "demande_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_paiement_demande")
    )
    private DemandeClient demande;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "periode_abonnement_id",
            unique = true,
            foreignKey = @ForeignKey(name = "fk_paiement_periode")
    )
    private PeriodeAbonnement periodeAbonnement;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false, length = 20)
    private ModePaiement modePaiement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutPaiement statut;

    @Column(name = "numero_cheque", length = 80)
    private String numeroCheque;

    @Column(name = "banque_cheque", length = 120)
    private String banqueCheque;

    @Column(name = "date_emission_cheque")
    private LocalDate dateEmissionCheque;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_cheque", length = 40)
    private StatutCheque statutCheque;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_confirmation")
    private LocalDateTime dateConfirmation;

    @Column(name = "date_rejet")
    private LocalDateTime dateRejet;

    @Column(name = "motif_rejet", length = 1000)
    private String motifRejet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "traite_par_utilisateur_id",
            foreignKey = @ForeignKey(name = "fk_paiement_utilisateur")
    )
    private Utilisateur traitePar;

    protected Paiement() {
        // Constructeur JPA
    }

    public static Paiement creerPaiementEspece(
            String reference,
            DemandeClient demande,
            BigDecimal montant
    ) {
        Paiement paiement = new Paiement();

        paiement.reference = normaliserReference(reference);
        paiement.demande = exigerNonNull(
                demande,
                "La demande est obligatoire"
        );
        paiement.montant = verifierMontant(montant);
        paiement.modePaiement = ModePaiement.ESPECE;
        paiement.statut = StatutPaiement.EN_ATTENTE;
        paiement.dateCreation = LocalDateTime.now();

        return paiement;
    }

    public static Paiement creerPaiementCheque(
            String reference,
            DemandeClient demande,
            BigDecimal montant,
            String numeroCheque,
            String banqueCheque,
            LocalDate dateEmissionCheque
    ) {
        Paiement paiement = new Paiement();

        paiement.reference = normaliserReference(reference);
        paiement.demande = exigerNonNull(
                demande,
                "La demande est obligatoire"
        );
        paiement.montant = verifierMontant(montant);
        paiement.modePaiement = ModePaiement.CHEQUE;
        paiement.statut = StatutPaiement.EN_ATTENTE;

        paiement.numeroCheque = exigerTexte(
                numeroCheque,
                "Le numéro du chèque est obligatoire"
        );

        paiement.banqueCheque = exigerTexte(
                banqueCheque,
                "La banque du chèque est obligatoire"
        );

        paiement.dateEmissionCheque = exigerNonNull(
                dateEmissionCheque,
                "La date d'émission du chèque est obligatoire"
        );

        paiement.statutCheque =
                StatutCheque.EN_ATTENTE_ENCAISSEMENT;

        paiement.dateCreation = LocalDateTime.now();

        return paiement;
    }

    public void confirmer(Utilisateur utilisateur) {
        verifierEnAttente();

        this.traitePar = exigerNonNull(
                utilisateur,
                "L'utilisateur qui confirme le paiement est obligatoire"
        );

        this.statut = StatutPaiement.CONFIRME;
        this.dateConfirmation = LocalDateTime.now();
        this.dateRejet = null;
        this.motifRejet = null;

        if (modePaiement == ModePaiement.CHEQUE) {
            this.statutCheque = StatutCheque.ENCAISSE;
        }
    }

    public void rejeterCheque(
            String motif,
            Utilisateur utilisateur
    ) {
        verifierEnAttente();

        if (modePaiement != ModePaiement.CHEQUE) {
            throw new IllegalStateException(
                    "Seul un paiement par chèque peut être rejeté par la banque"
            );
        }

        this.traitePar = exigerNonNull(
                utilisateur,
                "L'utilisateur qui traite le rejet est obligatoire"
        );

        this.motifRejet = exigerTexte(
                motif,
                "Le motif du rejet est obligatoire"
        );

        this.statut = StatutPaiement.REJETE;
        this.statutCheque = StatutCheque.REJETE;
        this.dateRejet = LocalDateTime.now();
        this.dateConfirmation = null;
    }

    public void annuler() {
        if (statut == StatutPaiement.CONFIRME) {
            throw new IllegalStateException(
                    "Un paiement confirmé ne peut pas être annulé directement"
            );
        }

        if (statut == StatutPaiement.ANNULE) {
            throw new IllegalStateException(
                    "Le paiement est déjà annulé"
            );
        }

        this.statut = StatutPaiement.ANNULE;
    }

    public void associerPeriodeAbonnement(
            PeriodeAbonnement periode
    ) {
        if (statut != StatutPaiement.CONFIRME) {
            throw new IllegalStateException(
                    "Seul un paiement confirmé peut être associé à une période"
            );
        }

        if (periodeAbonnement != null) {
            throw new IllegalStateException(
                    "Le paiement est déjà associé à une période"
            );
        }

        this.periodeAbonnement = exigerNonNull(
                periode,
                "La période d'abonnement est obligatoire"
        );
    }

    private void verifierEnAttente() {
        if (statut != StatutPaiement.EN_ATTENTE) {
            throw new IllegalStateException(
                    "Le paiement doit être en attente"
            );
        }
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        if (reference == null || reference.isBlank()) {
            throw new IllegalStateException(
                    "La référence du paiement est obligatoire"
            );
        }

        verifierMontant(montant);

        if (demande == null) {
            throw new IllegalStateException(
                    "La demande du paiement est obligatoire"
            );
        }

        if (modePaiement == null || statut == null) {
            throw new IllegalStateException(
                    "Le mode et le statut du paiement sont obligatoires"
            );
        }

        if (modePaiement == ModePaiement.ESPECE) {
            if (numeroCheque != null
                    || banqueCheque != null
                    || dateEmissionCheque != null
                    || statutCheque != null) {
                throw new IllegalStateException(
                        "Un paiement en espèces ne doit pas contenir d'informations de chèque"
                );
            }
        }

        if (modePaiement == ModePaiement.CHEQUE) {
            if (numeroCheque == null
                    || banqueCheque == null
                    || dateEmissionCheque == null
                    || statutCheque == null) {
                throw new IllegalStateException(
                        "Les informations du chèque sont obligatoires"
                );
            }
        }

        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }

    private static BigDecimal verifierMontant(BigDecimal montant) {
        if (montant == null || montant.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Le montant du paiement doit être strictement positif"
            );
        }

        return montant;
    }

    private static String normaliserReference(String reference) {
        return exigerTexte(
                reference,
                "La référence du paiement est obligatoire"
        ).toUpperCase(Locale.ROOT);
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

    public DemandeClient getDemande() {
        return demande;
    }

    public PeriodeAbonnement getPeriodeAbonnement() {
        return periodeAbonnement;
    }

    public BigDecimal getMontant() {
        return montant;
    }

    public ModePaiement getModePaiement() {
        return modePaiement;
    }

    public StatutPaiement getStatut() {
        return statut;
    }

    public String getNumeroCheque() {
        return numeroCheque;
    }

    public String getBanqueCheque() {
        return banqueCheque;
    }

    public LocalDate getDateEmissionCheque() {
        return dateEmissionCheque;
    }

    public StatutCheque getStatutCheque() {
        return statutCheque;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateConfirmation() {
        return dateConfirmation;
    }

    public LocalDateTime getDateRejet() {
        return dateRejet;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public Utilisateur getTraitePar() {
        return traitePar;
    }
}