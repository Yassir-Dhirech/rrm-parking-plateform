package com.rrm.parking.parking.config;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Order(10)
@Component
@RequiredArgsConstructor
public class ParkingDataInitializer implements ApplicationRunner {

    private static final String FICHIER = "data/parkings-reference.csv";

    private final ParkingRepository parkingRepository;

    @Value("${app.parking-data.enabled:false}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            return;
        }

        List<LigneParking> lignes = chargerParkings();
        List<Parking> parkings = new ArrayList<>();
        int nombreCreations = 0;

        for (LigneParking ligne : lignes) {
            Parking parking = parkingRepository
                    .findByCodeIgnoreCase(ligne.code())
                    .orElseGet(Parking::new);

            if (parking.getId() == null) {
                nombreCreations++;
            }

            appliquer(ligne, parking);
            parkings.add(parking);
        }

        parkingRepository.saveAll(parkings);

        log.info(
                "Référentiel des parkings synchronisé : {} parkings, {} créations, {} mises à jour",
                parkings.size(),
                nombreCreations,
                parkings.size() - nombreCreations
        );
    }

    private List<LigneParking> chargerParkings() throws Exception {
        List<LigneParking> lignes = new ArrayList<>();
        Set<String> codes = new HashSet<>();
        ClassPathResource resource = new ClassPathResource(FICHIER);

        try (BufferedReader lecteur = new BufferedReader(new InputStreamReader(
                resource.getInputStream(),
                StandardCharsets.UTF_8
        ))) {
            String ligne;
            int numeroLigne = 0;

            while ((ligne = lecteur.readLine()) != null) {
                numeroLigne++;

                if (numeroLigne == 1 || ligne.isBlank()) {
                    continue;
                }

                LigneParking parking = analyserLigne(ligne, numeroLigne);

                if (!codes.add(parking.code())) {
                    throw new IllegalStateException(
                            "Code parking dupliqué à la ligne " + numeroLigne + " : " + parking.code()
                    );
                }

                lignes.add(parking);
            }
        }

        if (lignes.isEmpty()) {
            throw new IllegalStateException("Le référentiel des parkings est vide");
        }

        return lignes;
    }

    private LigneParking analyserLigne(String ligne, int numeroLigne) {
        String[] colonnes = ligne.split(";", -1);

        if (colonnes.length != 7) {
            throw new IllegalStateException("Ligne parking invalide : " + numeroLigne);
        }

        String code = normaliserCode(colonnes[0]);
        String nom = colonnes[1].trim();
        String adresse = colonnes[2].trim();

        if (code.isBlank() || nom.isBlank() || adresse.isBlank()) {
            throw new IllegalStateException("Valeur obligatoire absente à la ligne " + numeroLigne);
        }

        try {
            BigDecimal latitude = new BigDecimal(colonnes[3].trim());
            BigDecimal longitude = new BigDecimal(colonnes[4].trim());
            int capaciteTotale = Integer.parseInt(colonnes[5].trim());
            int capaciteReservee = Integer.parseInt(colonnes[6].trim());

            if (latitude.compareTo(new BigDecimal("-90")) < 0
                    || latitude.compareTo(new BigDecimal("90")) > 0
                    || longitude.compareTo(new BigDecimal("-180")) < 0
                    || longitude.compareTo(new BigDecimal("180")) > 0) {
                throw new IllegalStateException("Coordonnées invalides à la ligne " + numeroLigne);
            }

            if (capaciteTotale < 0 || capaciteReservee < 0 || capaciteReservee > capaciteTotale) {
                throw new IllegalStateException("Capacités invalides à la ligne " + numeroLigne);
            }

            return new LigneParking(
                    code,
                    nom,
                    adresse,
                    latitude,
                    longitude,
                    capaciteTotale,
                    capaciteReservee
            );
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("Valeur numérique invalide à la ligne " + numeroLigne, exception);
        }
    }

    private void appliquer(LigneParking ligne, Parking parking) {
        parking.setCode(ligne.code());
        parking.setNom(ligne.nom());
        parking.setAdresse(ligne.adresse());
        parking.setLatitude(ligne.latitude());
        parking.setLongitude(ligne.longitude());
        parking.modifierCapacites(ligne.capaciteTotale(), ligne.capaciteReservee());
        parking.activer();
    }

    private String normaliserCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }

    private record LigneParking(
            String code,
            String nom,
            String adresse,
            BigDecimal latitude,
            BigDecimal longitude,
            int capaciteTotale,
            int capaciteReservee
    ) {
    }
}
