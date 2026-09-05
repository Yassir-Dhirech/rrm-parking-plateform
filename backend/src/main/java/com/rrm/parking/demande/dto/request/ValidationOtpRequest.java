package com.rrm.parking.demande.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ValidationOtpRequest(

        @NotBlank(message = "Le code OTP est obligatoire")
        @Pattern(
                regexp = "^[0-9]{6}$",
                message = "Le code OTP doit contenir exactement 6 chiffres"
        )
        String code
) {
}