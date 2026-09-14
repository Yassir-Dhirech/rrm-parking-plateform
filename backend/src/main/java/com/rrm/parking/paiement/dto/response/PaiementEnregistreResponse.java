package com.rrm.parking.paiement.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutCheque;
import com.rrm.parking.paiement.enums.StatutPaiement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaiementEnregistreResponse(
        Long paiementId,
        String referencePaiement,
        StatutPaiement statutPaiement,
        StatutCheque statutCheque,
        BigDecimal montant,
        ModePaiement modePaiement,

        Long recuId,
        String numeroRecu,
        LocalDateTime dateGenerationRecu,

        Long demandeId,
        String referenceDemande,
        StatutDemande statutDemande
) {

    public static PaiementEnregistreResponse depuis(
            Paiement paiement,
            Recu recu
    ) {
        return new PaiementEnregistreResponse(
                paiement.getId(),
                paiement.getReference(),
                paiement.getStatut(),
                paiement.getStatutCheque(),
                paiement.getMontant(),
                paiement.getModePaiement(),

                recu.getId(),
                recu.getNumero(),
                recu.getDateGeneration(),

                paiement.getDemande().getId(),
                paiement.getDemande().getReference(),
                paiement.getDemande().getStatut()
        );
    }
}