package com.rrm.parking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "L'adresse e-mail est obligatoire")
        @Email(message = "Le format de l'adresse e-mail est invalide")
        @Size(
                max = 254,
                message = "L'adresse e-mail est trop longue"
        )
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(
                max = 128,
                message = "Le mot de passe est trop long"
        )
        String motDePasse

) {
}