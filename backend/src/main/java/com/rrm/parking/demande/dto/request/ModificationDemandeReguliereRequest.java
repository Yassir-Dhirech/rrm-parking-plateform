package com.rrm.parking.demande.dto.request;

import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ModificationDemandeReguliereRequest(
        @NotBlank @Size(max = 100) String nom,
        @NotBlank @Size(max = 100) String prenom,
        @NotBlank @Size(min = 5, max = 20) String cin,
        @NotBlank @Pattern(regexp = "^(?:0?[67][0-9]{8}|\\+[1-9][0-9]{7,14})$") String telephone,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank
        @Pattern(regexp = "^[0-9]{3,7}\\|\\p{L}\\|[0-9]{1,2}$")
        String immatriculation,
        @Size(max = 100) String marque,
        @Size(max = 100) String modele,
        @Size(max = 50) String couleur,
        @NotNull TypeVehicule typeVehicule,
        @NotNull @Positive Long tarifParkingId,
        @NotNull ModePaiement modePaiement
) {
}
