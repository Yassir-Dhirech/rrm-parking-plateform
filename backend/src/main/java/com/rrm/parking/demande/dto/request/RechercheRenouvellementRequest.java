package com.rrm.parking.demande.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RechercheRenouvellementRequest(
        @NotBlank(message = "Le numÃ©ro de carte est obligatoire")
        @Size(max = 100)
        String numeroCarte,

        @NotBlank(message = "La CIN est obligatoire")
        @Size(min = 5, max = 20)
        String cin
) {
}