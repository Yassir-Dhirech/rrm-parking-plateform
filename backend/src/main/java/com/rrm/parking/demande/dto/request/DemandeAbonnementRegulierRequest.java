package com.rrm.parking.demande.dto.request;

import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import jakarta.validation.constraints.*;

public record DemandeAbonnementRegulierRequest(

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100)
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100)
        String prenom,

        @NotBlank(message = "La CIN est obligatoire")
        @Size(min = 5, max = 20)
        String cin,

        @NotBlank(message = "Le téléphone est obligatoire")
        @Pattern(
                regexp = "^(\\+212|0)[5-7][0-9]{8}$",
                message = "Le numéro de téléphone marocain est invalide"
        )
        String telephone,

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "L'adresse email est invalide")
        @Size(max = 254)
        String email,

        @NotBlank(message = "Le numéro d'immatriculation est obligatoire")
        @Pattern(
                regexp = "^[0-9]{3,6}$",
                message = "Le numéro d'immatriculation doit contenir entre 3 et 6 chiffres"
        )
        String numeroImmatriculation,

        @NotBlank(message = "La série d'immatriculation est obligatoire")
        @Size(max = 5)
        String serieImmatriculation,

        @NotBlank(message = "Le code région est obligatoire")
        @Pattern(
                regexp = "^[0-9]{1,3}$",
                message = "Le code région doit contenir entre 1 et 3 chiffres"
        )
        String codeRegion,

        @Size(max = 100)
        String marque,

        @Size(max = 100)
        String modele,

        @Size(max = 50)
        String couleur,

        @NotNull(message = "Le type de véhicule est obligatoire")
        TypeVehicule typeVehicule,

        @NotNull(message = "Le tarif est obligatoire")
        @Positive(message = "L'identifiant du tarif est invalide")
        Long tarifParkingId,

        @NotNull(message = "Le mode de paiement est obligatoire")
        ModePaiement modePaiement,

        @AssertTrue(
                message = "Les conditions générales doivent être acceptées"
        )
        boolean conditionsAcceptees
) {
}