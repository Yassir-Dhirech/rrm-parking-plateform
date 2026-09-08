package com.rrm.parking.parking.service;

import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.abonnement.repository.projection.OccupationParkingProjection;
import com.rrm.parking.parking.dto.response.ParkingPublicResponse;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.dto.response.TarifParkingPublicResponse;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingPublicService {

    private static final EnumSet<StatutAbonnement>
            STATUTS_OCCUPANT_UNE_PLACE = EnumSet.of(
            StatutAbonnement.EN_ATTENTE_ACTIVATION,
            StatutAbonnement.ACTIF,
            StatutAbonnement.SUSPENDU
    );

    private final TarifParkingRepository tarifParkingRepository;

    private final ParkingRepository parkingRepository;

    private final AffectationParkingRepository
            affectationParkingRepository;

    @Transactional(readOnly = true)
    public List<ParkingPublicResponse>
    listerParkingsPourCarte() {

        return construireReponses(
                EnumSet.of(
                        StatutParking.ACTIF,
                        StatutParking.SUSPENDU
                )
        );
    }

    @Transactional(readOnly = true)
    public List<ParkingPublicResponse>
    listerParkingsDisponiblesPourAbonnement() {

        return construireReponses(
                EnumSet.of(StatutParking.ACTIF)
        )
                .stream()
                .filter(
                        ParkingPublicResponse
                                ::souscriptionDisponible
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TarifParkingPublicResponse>
    listerTarifsApplicables(
            Long parkingId
    ) {
        if (parkingId == null || parkingId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "L'identifiant du parking est invalide"
            );
        }

        Parking parking = parkingRepository
                .findById(parkingId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Parking introuvable"
                        )
                );

        if (parking.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Parking introuvable"
            );
        }

        return tarifParkingRepository
                .trouverTarifsApplicables(
                        parkingId,
                        LocalDate.now()
                )
                .stream()
                .map(TarifParkingPublicResponse::depuis)
                .toList();
    }

    private List<ParkingPublicResponse>
    construireReponses(
            Collection<StatutParking> statutsParkings
    ) {
        Map<Long, Long> occupationsParParking =
                affectationParkingRepository
                        .compterPlacesOccupeesParParking(
                                STATUTS_OCCUPANT_UNE_PLACE,
                                LocalDate.now()
                        )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        OccupationParkingProjection
                                                ::getParkingId,
                                        OccupationParkingProjection
                                                ::getPlacesOccupees
                                )
                        );

        return parkingRepository
                .findAllByStatutInOrderByNomAsc(
                        statutsParkings
                )
                .stream()
                .map(parking ->
                        ParkingPublicResponse.depuis(
                                parking,
                                occupationsParParking
                                        .getOrDefault(
                                                parking.getId(),
                                                0L
                                        )
                        )
                )
                .toList();
    }


}