package com.rrm.parking.facturation.dto.response;

public record RecuEmailResponse(
        Long recuId,
        String numeroRecu,
        String destinataire,
        String statut,
        String message
) {
}