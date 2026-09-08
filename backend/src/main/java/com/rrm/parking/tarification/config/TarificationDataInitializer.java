package com.rrm.parking.tarification.config;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TarificationDataInitializer
        implements ApplicationRunner {

    private static final String FICHIER =
            "data/forfaits-tarifs.csv";

    private static final LocalDate DATE_DEBUT_VALIDITE =
            LocalDate.of(2026, 1, 1);

    private static final BigDecimal TAUX_TVA =
            new BigDecimal("20.00");

    private static final List<Integer> DUREES =
            List.of(3, 6, 9, 12);

    private final ParkingRepository parkingRepository;
    private final ForfaitRepository forfaitRepository;
    private final TarifParkingRepository tarifParkingRepository;

    @Value("${app.tarification.initialization.enabled:false}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args)
            throws Exception {

        if (!enabled) {
            return;
        }

        ClassPathResource resource =
                new ClassPathResource(FICHIER);

        try (
                BufferedReader lecteur =
                        new BufferedReader(
                                new InputStreamReader(
                                        resource.getInputStream(),
                                        StandardCharsets.UTF_8
                                )
                        )
        ) {
            String ligne;
            int numeroLigne = 0;

            while ((ligne = lecteur.readLine()) != null) {
                numeroLigne++;

                if (numeroLigne == 1
                        || ligne.isBlank()) {
                    continue;
                }

                importerLigne(ligne, numeroLigne);
            }
        }
    }

    private void importerLigne(
            String ligne,
            int numeroLigne
    ) {
        String[] colonnes = ligne.split(";", -1);

        if (colonnes.length != 5) {
            throw new IllegalStateException(
                    "Ligne CSV invalide : " + numeroLigne
            );
        }

        String parkingCode = colonnes[0].trim();
        String forfaitCode = colonnes[1].trim();
        String libelle = colonnes[2].trim();

        boolean placeReservee =
                Boolean.parseBoolean(
                        colonnes[3].trim()
                );

        BigDecimal prixMensuelHT =
                new BigDecimal(
                        colonnes[4].trim()
                );

        Parking parking = parkingRepository
                .findByCodeIgnoreCase(parkingCode)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Parking introuvable à la ligne "
                                        + numeroLigne
                                        + " : "
                                        + parkingCode
                        )
                );

        Forfait forfait = forfaitRepository
                .findByCodeIgnoreCase(forfaitCode)
                .orElseGet(() ->
                        creerForfait(
                                forfaitCode,
                                libelle,
                                placeReservee
                        )
                );

        DUREES.forEach(duree ->
                creerTarifSiAbsent(
                        parking,
                        forfait,
                        duree,
                        prixMensuelHT
                )
        );
    }

    private Forfait creerForfait(
            String code,
            String libelle,
            boolean placeReservee
    ) {
        Forfait forfait = new Forfait();

        forfait.setCode(code);
        forfait.setLibelle(libelle);
        forfait.setDescription(libelle);
        forfait.setPlaceReservee(placeReservee);
        forfait.setActif(true);

        return forfaitRepository.save(forfait);
    }

    private void creerTarifSiAbsent(
            Parking parking,
            Forfait forfait,
            Integer duree,
            BigDecimal prixMensuelHT
    ) {
        boolean existe =
                tarifParkingRepository
                        .existsByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
                                parking.getId(),
                                forfait.getId(),
                                duree,
                                DATE_DEBUT_VALIDITE
                        );

        if (existe) {
            return;
        }

        TarifParking tarif = new TarifParking();

        tarif.setParking(parking);
        tarif.setForfait(forfait);
        tarif.setDureeEnMois(duree);
        tarif.setPrixHT(prixMensuelHT);
        tarif.setTauxTVA(TAUX_TVA);
        tarif.setDateDebutValidite(
                DATE_DEBUT_VALIDITE
        );

        tarifParkingRepository.save(tarif);
    }
}