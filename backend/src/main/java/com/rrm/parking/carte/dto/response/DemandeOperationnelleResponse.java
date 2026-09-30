package com.rrm.parking.carte.dto.response;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;

public record DemandeOperationnelleResponse(
        Long id,
        String reference,
        TypeOperationCarte typeOperation,
        StatutDemandeOperationnelle statut,
        LocalDateTime dateCreation,
        LocalDateTime dateExecution,
        Long carteId,
        String referenceCarte,
        String numeroCarte,
        StatutCarteAcces statutCarte,
        String referenceAbonnement,
        Long demandeClientId,
        String referenceDemandeClient,
        String nomClient,
        String cin,
        String email,
        String immatriculation,
        String parkingNom,
        Long factureId,
        String numeroFacture,
        LocalDate dateDebutAbonnement,
        LocalDate dateFinAbonnement
) {
    public static DemandeOperationnelleResponse depuis(
            DemandeOperationnelle operation,
            Long demandeClientId,
            String referenceDemandeClient,
            String nomClient,
            String cin,
            String email,
            String immatriculation,
            String parkingNom,
            Long factureId,
            String numeroFacture
    ) {
        var carte = operation.getCarteAcces();
        var periode = carte.getAbonnement().getPeriodes().stream()
                .filter(p -> p.getStatut() != StatutPeriodeAbonnement.ANNULEE)
                .max(Comparator.comparing(PeriodeAbonnement::getNumero))
                .orElse(null);
        return new DemandeOperationnelleResponse(
                operation.getId(), operation.getReference(),
                operation.getTypeOperation(), operation.getStatut(),
                operation.getDateCreation(), operation.getDateExecution(),
                carte.getId(), carte.getReference(), carte.getNumeroCarte(),
                carte.getStatut(), carte.getAbonnement().getReference(),
                demandeClientId, referenceDemandeClient, nomClient, cin,
                email, immatriculation, parkingNom, factureId, numeroFacture,
                periode == null ? null : periode.getDateDebut(),
                periode == null ? null : periode.getDateFin()
        );
    }
}
