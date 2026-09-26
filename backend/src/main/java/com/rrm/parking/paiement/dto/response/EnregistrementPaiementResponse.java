package com.rrm.parking.paiement.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EnregistrementPaiementResponse(

        Long id,

        String reference,

        Long demandeId,

        String referenceDemande,

        BigDecimal montant,

        ModePaiement modePaiement,

        StatutPaiement statutPaiement,

        StatutDemande statutDemande,

        LocalDateTime dateConfirmation,

        Long recuId,

        String numeroRecu

) {

    public static EnregistrementPaiementResponse depuis(
            Paiement paiement,
            Recu recu
    ) {
        return new EnregistrementPaiementResponse(
                paiement.getId(),
                paiement.getReference(),
                paiement.getDemande().getId(),
                paiement.getDemande().getReference(),
                paiement.getMontant(),
                paiement.getModePaiement(),
                paiement.getStatut(),
                paiement.getDemande().getStatut(),
                paiement.getDateConfirmation(),
                recu.getId(),
                recu.getNumero()
        );
    }
}
