package com.rrm.parking.carte.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImpressionCarteRequest(
        @NotBlank(message = "Le numéro physique de la carte est obligatoire")
        @Size(max = 100, message = "Le numéro de carte ne doit pas dépasser 100 caractères")
        String numeroCarte
) {
}
