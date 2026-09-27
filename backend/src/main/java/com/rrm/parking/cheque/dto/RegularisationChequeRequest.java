package com.rrm.parking.cheque.dto;

import com.rrm.parking.paiement.enums.ModePaiement;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RegularisationChequeRequest(
        @NotNull ModePaiement modePaiement,
        String numeroCheque,
        String banqueCheque,
        LocalDate dateEmissionCheque,
        Boolean chequeCertifie
) {}
