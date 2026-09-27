package com.rrm.parking.facturation.dto.response;

import org.springframework.data.domain.Page;

public record FacturesComptableResponse(
        Page<FactureResponse> factures,
        long totalFactures,
        long nombreCheques,
        long nombreEspeces
) {
}
