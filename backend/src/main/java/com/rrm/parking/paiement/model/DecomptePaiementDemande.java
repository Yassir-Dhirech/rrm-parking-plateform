package com.rrm.parking.paiement.model;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record DecomptePaiementDemande(
        ModePaiement modePaiement,
        TarifParking tarifParking,
        BigDecimal montantAbonnementTTC,
        BigDecimal fraisCarteTTC,
        BigDecimal montantTotalTTC
) {

    private static final BigDecimal ZERO_MONTANT =
            BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    public static DecomptePaiementDemande depuis(
            DemandeClient demande
    ) {
        if (demande == null) {
            throw new IllegalArgumentException(
                    "La demande est obligatoire"
            );
        }

        DemandeClient demandeReelle =
                (DemandeClient) Hibernate.unproxy(demande);

        if (demandeReelle instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            DecompteNouvelAbonnement decompte =
                    DecompteNouvelAbonnement.depuis(
                            nouvelle.getTarifParking()
                    );

            return new DecomptePaiementDemande(
                    nouvelle.getModePaiementSouhaite(),
                    nouvelle.getTarifParking(),
                    decompte.montantAbonnementTTC(),
                    decompte.fraisCarteTTC(),
                    decompte.montantTotalTTC()
            );
        }

        if (demandeReelle instanceof DemandeRenouvellementRegulier renouvellement) {
            TarifParking tarif = renouvellement.getTarifParking();
            BigDecimal montantAbonnement = tarif
                    .calculerMontantTotalTTC()
                    .setScale(2, RoundingMode.HALF_UP);

            return new DecomptePaiementDemande(
                    renouvellement.getModePaiementSouhaite(),
                    tarif,
                    montantAbonnement,
                    ZERO_MONTANT,
                    montantAbonnement
            );
        }

        throw new ConflitMetierException(
                "Ce type de demande n'est pas pris en charge pour le paiement"
        );
    }
}
