package com.rrm.parking.demande.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefusDemandeCorporateRequest(
        @NotBlank(message = "Le motif de refus est obligatoire")
        @Size(max = 1000, message = "Le motif de refus ne peut pas dépasser 1000 caractères")
        String motif
) {
}
