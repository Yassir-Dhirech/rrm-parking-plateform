package com.rrm.parking.demande.entity;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.parking.entity.Parking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "demande_perte_carte")
@PrimaryKeyJoinColumn(name = "id", foreignKey = @ForeignKey(name = "fk_perte_carte_demande"))
@Getter
@Setter
@NoArgsConstructor
public class DemandePerteCarte extends DemandeClient {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "abonnement_concerne_id", nullable = false)
    private AbonnementRegulier abonnementConcerne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carte_perdue_id", nullable = false)
    private CarteAcces cartePerdue;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement_souhaite", nullable = false, length = 20)
    private ModePaiement modePaiementSouhaite = ModePaiement.ESPECE;

    @Column(name = "motif_perte", length = 500)
    private String motifPerte = "Carte RFID déclarée perdue par l'abonné";

    @Column(name = "frais_carte_ttc", nullable = false, precision = 10, scale = 2)
    private BigDecimal fraisCarteTtc = new BigDecimal("50.00");

    public DemandePerteCarte(
            String reference,
            CanalInitiation canal,
            ClientParticulier client,
            AbonnementRegulier abonnement,
            CarteAcces cartePerdue,
            Parking parking,
            ModePaiement modePaiement
    ) {
        super(reference, canal, client, null);
        this.abonnementConcerne = abonnement;
        this.cartePerdue = cartePerdue;
        this.parking = parking;
        this.modePaiementSouhaite = modePaiement != null ? modePaiement : ModePaiement.ESPECE;
        this.fraisCarteTtc = new BigDecimal("50.00");
    }
}
