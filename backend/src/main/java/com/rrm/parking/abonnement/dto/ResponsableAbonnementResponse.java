package com.rrm.parking.abonnement.dto;

import com.rrm.parking.facturation.dto.response.FactureResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ResponsableAbonnementResponse(
        Long id, String reference, String type, String clientNom,
        String clientEmail, String entrepriseIce, String parkingNom,
        String statut, LocalDate dateDebut, LocalDate dateFin,
        String immatriculation, BigDecimal prixTtcPeriode,
        LocalDateTime dateCreation, List<FactureResponse> factures,
        List<Relance> relances, List<Carte> cartes
) {
    public record Relance(String type, String statut, String sujet,
                          String canal, String destination,
                          LocalDateTime datePrevue, LocalDateTime dateEnvoi,
                          String erreur) { }

    public record Carte(String reference, String numero, String statut,
                        String immatriculation) { }
}
