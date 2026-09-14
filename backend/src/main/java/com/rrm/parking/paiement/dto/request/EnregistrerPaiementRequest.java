package com.rrm.parking.paiement.dto.request;

import com.rrm.parking.paiement.enums.ModePaiement;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EnregistrerPaiementRequest(

        @NotNull(message = "Le mode de paiement est obligatoire")
        ModePaiement modePaiement,

        @Size(max = 80)
        String numeroCheque,

        @Size(max = 120)
        String banqueCheque,

        LocalDate dateEmissionCheque
) {

    @AssertTrue(
            message = "Les informations du chèque sont invalides"
    )
    public boolean isPaiementCoherent() {
        if (modePaiement == null) {
            return true;
        }

        if (modePaiement == ModePaiement.ESPECE) {
            return estVide(numeroCheque)
                    && estVide(banqueCheque)
                    && dateEmissionCheque == null;
        }

        return !estVide(numeroCheque)
                && !estVide(banqueCheque)
                && dateEmissionCheque != null;
    }

    private boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }
}