package com.rrm.parking.recette.entity;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recette", uniqueConstraints = @UniqueConstraint(name = "uk_recette_reference", columnNames = "reference"))
@Getter
@NoArgsConstructor
public class Recette {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 60)
    private String reference;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "superviseur_id", nullable = false)
    private Utilisateur superviseur;
    @Column(name = "date_arret", nullable = false)
    private LocalDate dateArret;
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;
    @Column(name = "date_transmission")
    private LocalDateTime dateTransmission;
    @Column(name = "date_reception")
    private LocalDateTime dateReception;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comptable_id")
    private Utilisateur comptable;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutRecette statut;
    @Column(name = "total_especes", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalEspeces = BigDecimal.ZERO;
    @Column(name = "total_cheques", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCheques = BigDecimal.ZERO;
    @Column(name = "montant_especes_recu", precision = 14, scale = 2)
    private BigDecimal montantEspecesRecu;
    @Column(name = "montant_cheques_recu", precision = 14, scale = 2)
    private BigDecimal montantChequesRecu;
    @Column(name = "nombre_cheques_recus")
    private Integer nombreChequesRecus;
    @Column(name = "observation_reception", length = 2000)
    private String observationReception;
    @Column(name = "accuse_numero", unique = true, length = 60)
    private String accuseNumero;
    @OneToMany(mappedBy = "recette", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<LigneRecette> lignes = new ArrayList<>();

    public Recette(String reference, Parking parking, Utilisateur superviseur, LocalDate dateArret) {
        this.reference = reference;
        this.parking = parking;
        this.superviseur = superviseur;
        this.dateArret = dateArret;
        this.dateCreation = LocalDateTime.now();
        this.statut = StatutRecette.BROUILLON;
    }

    public void ajouter(LigneRecette ligne) {
        if (statut != StatutRecette.BROUILLON) throw new IllegalStateException("Arrêté déjà transmis");
        lignes.add(ligne);
        if (ligne.getModePaiement().equals("ESPECE")) totalEspeces = totalEspeces.add(ligne.getMontant());
        else totalCheques = totalCheques.add(ligne.getMontant());
    }

    public void transmettre() {
        if (statut != StatutRecette.BROUILLON || lignes.isEmpty()) throw new IllegalStateException("Arrêté non transmissible");
        statut = StatutRecette.TRANSMISE;
        dateTransmission = LocalDateTime.now();
    }

    public void annuler() {
        if (statut != StatutRecette.BROUILLON) throw new IllegalStateException("Seul un brouillon peut être annulé");
        lignes.clear();
        totalEspeces = BigDecimal.ZERO;
        totalCheques = BigDecimal.ZERO;
        statut = StatutRecette.ANNULEE;
    }

    public void receptionner(Utilisateur comptable, BigDecimal especes, BigDecimal cheques,
                             int nombreCheques, String observation, String numero) {
        if (statut != StatutRecette.TRANSMISE) throw new IllegalStateException("La recette doit être transmise");
        if (especes == null || cheques == null || especes.signum() < 0 || cheques.signum() < 0 || nombreCheques < 0)
            throw new IllegalArgumentException("Montants ou nombre de chèques invalides");
        boolean conforme = totalEspeces.compareTo(especes) == 0 && totalCheques.compareTo(cheques) == 0
                && (int) lignes.stream().filter(l -> l.getModePaiement().equals("CHEQUE")).count() == nombreCheques;
        if (!conforme && (observation == null || observation.isBlank()))
            throw new IllegalArgumentException("Une observation est obligatoire en cas d'écart");
        this.comptable = comptable;
        this.montantEspecesRecu = especes;
        this.montantChequesRecu = cheques;
        this.nombreChequesRecus = nombreCheques;
        this.observationReception = observation == null ? "" : observation.trim();
        this.accuseNumero = numero;
        this.dateReception = LocalDateTime.now();
        statut = conforme ? StatutRecette.RECUE : StatutRecette.RECUE_AVEC_RESERVES;
    }
}
