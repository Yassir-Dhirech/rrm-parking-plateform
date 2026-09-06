package com.rrm.parking.parking.controller;

import com.rrm.parking.parking.dto.response.ParkingPublicResponse;
import com.rrm.parking.parking.service.ParkingPublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.rrm.parking.tarification.dto.response.TarifParkingPublicResponse;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/public/parkings")
@RequiredArgsConstructor
public class ParkingPublicController {

    private final ParkingPublicService parkingPublicService;

    @GetMapping
    public ResponseEntity<List<ParkingPublicResponse>>
    listerPourLaCarte() {

        return ResponseEntity.ok(
                parkingPublicService
                        .listerParkingsPourCarte()
        );
    }

    @GetMapping("/disponibles-abonnement")
    public ResponseEntity<List<ParkingPublicResponse>>
    listerPourSouscription() {

        return ResponseEntity.ok(
                parkingPublicService
                        .listerParkingsDisponiblesPourAbonnement()
        );
    }

    @GetMapping("/{parkingId}/tarifs")
    public ResponseEntity<List<TarifParkingPublicResponse>>
    listerTarifsDuParking(
            @PathVariable Long parkingId
    ) {
        return ResponseEntity.ok(
                parkingPublicService
                        .listerTarifsApplicables(
                                parkingId
                        )
        );
    }
}