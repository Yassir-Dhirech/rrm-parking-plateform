package com.rrm.parking.demande.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DemandeCorrectionRequest(
        @NotBlank(message = "Le motif de correction est obligatoire")
        @Size(max = 1000, message = "Le motif ne peut pas dépasser 1000 caractères")
        String motif
) {
}
