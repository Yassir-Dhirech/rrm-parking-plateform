package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.enums.StatutDemande;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DemandeCorporateResponse(
        String reference,
        StatutDemande statut,
        LocalDateTime dateSoumission,
        LocalDateTime dateExpirationOtp,
        int tentativesRestantes,
        CanalOtp canalOtp,
        String destinationMasquee,
        String cinRepresentant,
        String plageHoraire,
        int nombrePlaces,
        int dureeEnMois,
        BigDecimal prixMensuelUnitaireTtc,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCartesTtc,
        BigDecimal montantTotalTtc
) {
}
