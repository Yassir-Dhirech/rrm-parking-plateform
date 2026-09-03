package com.rrm.parking.facturation.entity;

import com.rrm.parking.facturation.enums.TypeLigneFacture;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "ligne_facture")
public class LigneFacture {

    private static final BigDecimal CENT =
            new BigDecimal("100");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "facture_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_ligne_facture_facture"
            )
    )
    private Facture facture;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_ligne", nullable = false, length = 30)
    private TypeLigneFacture typeLigne;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false)
    private Integer quantite;

    @Column(
            name = "prix_unitaire_ht",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal prixUnitaireHt;

    @Column(
            name = "taux_tva",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal tauxTva;

    @Column(
            name = "montant_ht",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal montantHt;

    @Column(
            name = "montant_tva",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal montantTva;

    @Column(
            name = "montant_ttc",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal montantTtc;

    protected LigneFacture() {
        // Constructeur JPA
    }

    public LigneFacture(
            TypeLigneFacture typeLigne,
            String description,
            Integer quantite,
            BigDecimal prixUnitaireHt,
            BigDecimal tauxTva
    ) {
        this.typeLigne = exigerNonNull(
                typeLigne,
                "Le type de ligne est obligatoire"
        );

        this.description = exigerTexte(
                description,
                "La description est obligatoire"
        );

        this.quantite = verifierQuantite(quantite);
        this.prixUnitaireHt = verifierMontant(
                prixUnitaireHt,
                "Le prix unitaire HT"
        );

        this.tauxTva = verifierTauxTva(tauxTva);

        recalculer();
    }

    public void modifier(
            String description,
            Integer quantite,
            BigDecimal prixUnitaireHt,
            BigDecimal tauxTva
    ) {
        verifierFactureModifiable();

        this.description = exigerTexte(
                description,
                "La description est obligatoire"
        );
        this.quantite = verifierQuantite(quantite);
        this.prixUnitaireHt = verifierMontant(
                prixUnitaireHt,
                "Le prix unitaire HT"
        );
        this.tauxTva = verifierTauxTva(tauxTva);

        recalculer();

        if (facture != null) {
            facture.recalculerTotaux();
        }
    }

    void rattacherA(Facture facture) {
        if (this.facture != null && this.facture != facture) {
            throw new IllegalStateException(
                    "La ligne appartient déjà à une autre facture"
            );
        }

        this.facture = exigerNonNull(
                facture,
                "La facture est obligatoire"
        );
    }

    void detacher() {
        verifierFactureModifiable();
        this.facture = null;
    }

    private void verifierFactureModifiable() {
        if (facture != null) {
            facture.verifierModifiable();
        }
    }

    @PrePersist
    @PreUpdate
    private void verifierEtRecalculer() {
        if (facture == null) {
            throw new IllegalStateException(
                    "La ligne doit appartenir à une facture"
            );
        }

        if (typeLigne == null) {
            throw new IllegalStateException(
                    "Le type de ligne est obligatoire"
            );
        }

        recalculer();
    }

    private void recalculer() {
        montantHt = prixUnitaireHt
                .multiply(BigDecimal.valueOf(quantite))
                .setScale(2, RoundingMode.HALF_UP);

        montantTva = montantHt
                .multiply(tauxTva)
                .divide(CENT, 2, RoundingMode.HALF_UP);

        montantTtc = montantHt
                .add(montantTva)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static Integer verifierQuantite(Integer quantite) {
        if (quantite == null || quantite <= 0) {
            throw new IllegalArgumentException(
                    "La quantité doit être strictement positive"
            );
        }

        return quantite;
    }

    private static BigDecimal verifierMontant(
            BigDecimal montant,
            String nom
    ) {
        if (montant == null || montant.signum() < 0) {
            throw new IllegalArgumentException(
                    nom + " ne peut pas être négatif"
            );
        }

        return montant.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal verifierTauxTva(
            BigDecimal taux
    ) {
        if (taux == null
                || taux.signum() < 0
                || taux.compareTo(CENT) > 0) {
            throw new IllegalArgumentException(
                    "Le taux de TVA doit être compris entre 0 et 100"
            );
        }

        return taux.setScale(2, RoundingMode.HALF_UP);
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

    public Facture getFacture() {
        return facture;
    }

    public TypeLigneFacture getTypeLigne() {
        return typeLigne;
    }

    public String getDescription() {
        return description;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public BigDecimal getPrixUnitaireHt() {
        return prixUnitaireHt;
    }

    public BigDecimal getTauxTva() {
        return tauxTva;
    }

    public BigDecimal getMontantHt() {
        return montantHt;
    }

    public BigDecimal getMontantTva() {
        return montantTva;
    }

    public BigDecimal getMontantTtc() {
        return montantTtc;
    }
}