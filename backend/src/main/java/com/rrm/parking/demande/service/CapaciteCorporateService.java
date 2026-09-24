package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.EnumSet;

@Service
@RequiredArgsConstructor
public class CapaciteCorporateService {

    private static final EnumSet<StatutAbonnement> STATUTS_OCCUPANTS =
            EnumSet.of(
                    StatutAbonnement.EN_ATTENTE_ACTIVATION,
                    StatutAbonnement.ACTIF,
                    StatutAbonnement.SUSPENDU
            );

    private static final EnumSet<StatutDemande> STATUTS_RESERVANT =
            EnumSet.of(
                    StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE,
                    StatutDemande.EN_ATTENTE_PAIEMENT,
                    StatutDemande.PAYEE,
                    StatutDemande.VALIDEE
            );

    private final ParkingRepository parkingRepository;
    private final AffectationParkingRepository affectationParkingRepository;
    private final DemandeNouveauContratCorporateRepository corporateRepository;

    public Parking verrouillerEtVerifier(
            Long parkingId,
            int nombrePlaces
    ) {
        if (parkingId == null || parkingId <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant du parking est invalide"
            );
        }
        if (nombrePlaces <= 0) {
            throw new IllegalArgumentException(
                    "Le nombre de places doit être strictement positif"
            );
        }

        Parking parking = parkingRepository
                .findByIdPourMiseAJour(parkingId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Parking introuvable"
                ));

        if (parking.getStatut() != StatutParking.ACTIF) {
            throw new ConflitMetierException(
                    "Ce parking n'accepte pas de nouvelle souscription"
            );
        }

        long placesRegulieres = affectationParkingRepository
                .compterPlacesOccupees(
                        parkingId,
                        STATUTS_OCCUPANTS,
                        LocalDate.now()
                );
        long placesCorporate = corporateRepository
                .compterPlacesReservees(parkingId, STATUTS_RESERVANT);
        long capacite = parking.getCapaciteReserveeAbonnements() == null
                ? 0L
                : parking.getCapaciteReserveeAbonnements();

        if (placesRegulieres + placesCorporate + nombrePlaces > capacite) {
            long disponibles = Math.max(
                    0L,
                    capacite - placesRegulieres - placesCorporate
            );
            throw new ConflitMetierException(
                    "Capacité insuffisante : " + disponibles
                            + " place(s) disponible(s) pour les abonnements"
            );
        }

        return parking;
    }

    public Parking verrouillerEtVerifierPourValidation(
            Long demandeId,
            Long parkingId,
            int nombrePlaces
    ) {
        if (demandeId == null || demandeId <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant de la demande est invalide"
            );
        }
        if (parkingId == null || parkingId <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant du parking est invalide"
            );
        }
        if (nombrePlaces <= 0) {
            throw new IllegalArgumentException(
                    "Le nombre de places doit être strictement positif"
            );
        }

        Parking parking = parkingRepository
                .findByIdPourMiseAJour(parkingId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Parking introuvable"
                ));

        if (parking.getStatut() != StatutParking.ACTIF) {
            throw new ConflitMetierException(
                    "Ce parking n'accepte pas de nouvelle souscription"
            );
        }

        long placesRegulieres = affectationParkingRepository
                .compterPlacesOccupees(
                        parkingId,
                        STATUTS_OCCUPANTS,
                        LocalDate.now()
                );
        long autresPlacesCorporate = corporateRepository
                .compterPlacesReserveesHorsDemande(
                        parkingId,
                        STATUTS_RESERVANT,
                        demandeId
                );
        long capacite = parking.getCapaciteReserveeAbonnements() == null
                ? 0L
                : parking.getCapaciteReserveeAbonnements();

        if (placesRegulieres + autresPlacesCorporate + nombrePlaces > capacite) {
            long disponibles = Math.max(
                    0L,
                    capacite - placesRegulieres - autresPlacesCorporate
            );
            throw new ConflitMetierException(
                    "Capacité insuffisante au moment de la validation : "
                            + disponibles + " place(s) disponible(s)"
            );
        }

        return parking;
    }
}
