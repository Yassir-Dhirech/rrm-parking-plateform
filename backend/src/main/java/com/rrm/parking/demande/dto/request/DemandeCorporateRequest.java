package com.rrm.parking.demande.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DemandeCorporateRequest(
        @NotBlank @Size(max = 200)
        String raisonSociale,

        @NotBlank
        @Pattern(
                regexp = "^[0-9]{15}$",
                message = "L'ICE doit contenir exactement 15 chiffres"
        )
        String ice,

        @NotBlank @Size(min = 2, max = 50)
        @Pattern(
                regexp = "^[\\p{L}0-9./\\- ]+$",
                message = "Le registre de commerce contient des caractères invalides"
        )
        String numeroRc,

        @NotBlank @Size(min = 2, max = 80)
        @Pattern(
                regexp = "^[\\p{L}0-9./\\- ]+$",
                message = "Le titre foncier contient des caractères invalides"
        )
        String titreFoncier,

        @NotBlank @Size(max = 100)
        String nomRepresentant,

        @NotBlank @Size(max = 100)
        String prenomRepresentant,

        @NotBlank
        @Pattern(
                regexp = "^[A-Za-z]{1,2}[0-9]{5,8}$",
                message = "Le CIN du représentant doit contenir une ou deux lettres suivies de 5 à 8 chiffres"
        )
        String cinRepresentant,

        @NotBlank
        @Pattern(
                regexp = "^(?:0?[67][0-9]{8}|\\+[1-9][0-9]{7,14})$",
                message = "Le téléphone du représentant est invalide"
        )
        String telephoneRepresentant,

        @NotBlank @Email @Size(max = 254)
        String emailRepresentant,

        @NotBlank @Size(max = 200)
        String libelleProjet,

        @NotBlank @Size(max = 500)
        String adresseProjet,

        @NotBlank @Size(max = 200)
        String plageHoraire,

        @NotNull @Positive
        Long parkingId,

        @NotNull @Positive @Max(1000)
        Integer nombrePlaces,

        @Size(max = 1000)
        List<@Size(max = 30) String> immatriculations,

        @AssertTrue(
                message = "Les conditions générales doivent être acceptées"
        )
        boolean conditionsAcceptees
) {
}
