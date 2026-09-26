package com.rrm.parking.paiement.dto.request;

import java.time.LocalDate;

public record EnregistrementPaiementRequest(

        String numeroCheque,

        String banqueCheque,

        LocalDate dateEmissionCheque

) {
}