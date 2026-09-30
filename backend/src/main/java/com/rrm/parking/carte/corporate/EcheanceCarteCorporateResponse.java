package com.rrm.parking.carte.corporate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record EcheanceCarteCorporateResponse(
        List<Carte> cartes, List<Dossier> historique
) {
    public record Carte(Long id, String reference, String numero, String immatriculation,
                        String abonnementReference, String entrepriseNom, String parkingNom,
                        LocalDateTime dateActivation, LocalDate dateRappelAnticipe,
                        LocalDate dateEcheance, LocalDateTime rappelAnticipeEnvoye,
                        LocalDateTime rappelEcheanceEnvoye, Long dossierId,
                        StatutEcheanceCorporate statutDossier) { }

    public record Dossier(Long id, Long carteId, String carteReference, String entrepriseNom,
                          String parkingNom, LocalDateTime activationReference,
                          LocalDate dateEcheance, StatutEcheanceCorporate statut,
                          Long operationId, String operationReference,
                          LocalDateTime dateDemande, LocalDateTime dateDeclaration,
                          LocalDateTime dateCloture, String demandeur,
                          String superviseur, String clotureur) { }
}
