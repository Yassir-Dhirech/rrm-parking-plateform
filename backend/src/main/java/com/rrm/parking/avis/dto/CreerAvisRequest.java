package com.rrm.parking.avis.dto;

import jakarta.validation.constraints.*;

public record CreerAvisRequest(
        @NotBlank String typeAvis,
        @NotNull @Min(1) @Max(5) Integer noteSatisfaction,
        Long parkingId,
        @NotBlank @Size(min = 10, max = 4000) String message,
        @Size(max = 150) String nomContact,
        @Size(max = 255) String contactInfo
) {}
