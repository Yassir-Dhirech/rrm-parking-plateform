package com.rrm.parking.dashboard.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SuperviseurDashboardResponse(
        LocalDate dateDebut,
        LocalDate dateFin,
        LocalDateTime actualiseLe,
        long actionsCartesEnAttente,
        long arretesEffectues,
        long demandesAValider,
        long parkingsAffectes,
        long abonnementsReguliersActifs,
        long contratsCorporateActifs,
        long placesCorporateReservees,
        List<Parking> parkings,
        List<Arrete> arretes,
        List<Action> actions
) {
    public record Parking(Long id, String code, String nom, String adresse,
                          String latitude, String longitude, String statut,
                          int quotaAbonnements, long placesOccupees, long placesLibres,
                          long abonnementsReguliersActifs, long contratsCorporateActifs,
                          long placesCorporateReservees, long actionsCartesEnAttente,
                          long demandesAValider) {}

    public record Arrete(Long id, String reference, Long parkingId, String parkingNom,
                         LocalDate dateArret, String statut, int nombrePaiements) {}

    public record Action(String type, Long id, String reference, Long parkingId, String parkingNom,
                         LocalDateTime depuis, String libelle, String chemin) {}
}
