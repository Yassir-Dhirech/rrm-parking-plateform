package com.rrm.parking.cheque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record DeclarationRejetChequeRequest(
        @NotNull Long paiementId,
        @NotNull @PastOrPresent LocalDate dateLettreBanque,
        @NotBlank @Size(max = 2000) String constatComptable
) {}
