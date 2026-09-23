package com.rrm.parking.demande.dto.request;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.paiement.enums.ModePaiement;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DemandeRenouvellementRequest(
        @NotBlank(message = "Le numÃ©ro de carte est obligatoire")
        @Size(max = 100)
        String numeroCarte,

        @NotBlank(message = "La CIN est obligatoire")
        @Size(min = 5, max = 20)
        String cin,

        @NotNull(message = "Le tarif est obligatoire")
        @Positive(message = "L'identifiant du tarif est invalide")
        Long tarifParkingId,

        @NotNull(message = "Le mode de paiement est obligatoire")
        ModePaiement modePaiement,

        @NotNull(message = "Le canal OTP est obligatoire")
        CanalOtp canalOtp,

        @AssertTrue(message = "Les conditions gÃ©nÃ©rales doivent Ãªtre acceptÃ©es")
        boolean conditionsAcceptees
) {
}