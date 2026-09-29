package com.rrm.parking.recette.entity;

import com.rrm.parking.paiement.entity.Paiement;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ligne_recette", uniqueConstraints = @UniqueConstraint(name = "uk_ligne_recette_paiement", columnNames = "paiement_id"))
@Getter
@NoArgsConstructor
public class LigneRecette {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paiement_id", nullable = false)
    private Paiement paiement;
    @Column(name = "reference_paiement", nullable = false, length = 60)
    private String referencePaiement;
    @Column(name = "numero_facture", length = 80)
    private String numeroFacture;
    @Column(name = "reference_abonnement", length = 80)
    private String referenceAbonnement;
    @Column(name = "client_nom", nullable = false, length = 200)
    private String clientNom;
    @Column(name = "mode_paiement", nullable = false, length = 20)
    private String modePaiement;
    @Column(name = "numero_cheque", length = 80)
    private String numeroCheque;
    @Column(name = "banque_cheque", length = 120)
    private String banqueCheque;
    @Column(name = "type_abonnement", length = 200)
    private String typeAbonnement;
    @Column(name = "date_debut_abonnement")
    private LocalDate dateDebutAbonnement;
    @Column(name = "date_fin_abonnement")
    private LocalDate dateFinAbonnement;
    @Column(name = "vente_carte", nullable = false)
    private boolean venteCarte;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;
    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;
    @Column(length = 500)
    private String observation;

    public LigneRecette(Recette recette, Paiement paiement, String numeroFacture, String referenceAbonnement,
                        String clientNom, String typeAbonnement, LocalDate debut, LocalDate fin,
                        boolean venteCarte, String observation) {
        this.recette = recette;
        this.paiement = paiement;
        this.referencePaiement = paiement.getReference();
        this.numeroFacture = numeroFacture;
        this.referenceAbonnement = referenceAbonnement;
        this.clientNom = clientNom;
        this.modePaiement = paiement.getModePaiement().name();
        this.numeroCheque = paiement.getNumeroCheque();
        this.banqueCheque = paiement.getBanqueCheque();
        this.typeAbonnement = typeAbonnement;
        this.dateDebutAbonnement = debut;
        this.dateFinAbonnement = fin;
        this.venteCarte = venteCarte;
        this.montant = paiement.getMontant();
        this.datePaiement = paiement.getDateConfirmation();
        this.observation = observation;
    }
}
