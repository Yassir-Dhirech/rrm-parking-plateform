package com.rrm.parking.cheque.dto;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;

public record OperationRejetChequeResponse(
        Long id, String reference, String carteReference,
        String numeroCarte, StatutDemandeOperationnelle statut
) {
    public static OperationRejetChequeResponse depuis(DemandeOperationnelle operation) {
        return new OperationRejetChequeResponse(operation.getId(), operation.getReference(),
                operation.getCarteAcces().getReference(),
                operation.getCarteAcces().getNumeroCarte(), operation.getStatut());
    }
}
