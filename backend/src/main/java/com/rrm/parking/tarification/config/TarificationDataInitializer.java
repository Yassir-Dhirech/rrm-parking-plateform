package com.rrm.parking.tarification.config;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Order(20)
@Component
@RequiredArgsConstructor
public class TarificationDataInitializer implements ApplicationRunner {

    private static final String FICHIER = "data/forfaits-tarifs.csv";
    private static final String PROFIL_PAR_DEFAUT = "BAB_EL_HAD";
    private static final BigDecimal TAUX_TVA = new BigDecimal("20.00");
    private static final BigDecimal COEFFICIENT_TVA = new BigDecimal("1.20");
    private static final List<Integer> DUREES = List.of(3, 6, 9, 12);

    private final ParkingRepository parkingRepository;
    private final ForfaitRepository forfaitRepository;
    private final TarifParkingRepository tarifParkingRepository;

    @Value("${app.tarification.initialization.enabled:false}")
    private boolean enabled;

    @Value("${app.tarification.initialization.effective-date:2026-09-16}")
    private LocalDate datePriseEffet;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            return;
        }

        Map<String, List<LigneTarif>> profils = chargerProfilsTarifaires();
        List<LigneTarif> profilParDefaut = profils.get(PROFIL_PAR_DEFAUT);

        if (profilParDefaut == null || profilParDefaut.isEmpty()) {
            throw new IllegalStateException(
                    "Le profil tarifaire par défaut " + PROFIL_PAR_DEFAUT + " est absent"
            );
        }

        Map<String, Forfait> forfaits = synchroniserForfaits(profils);
        List<Parking> parkings = parkingRepository
                .findAllByStatutOrderByNomAsc(StatutParking.ACTIF);

        int nombreTarifs = 0;

        for (Parking parking : parkings) {
            String codeParking = normaliserCode(parking.getCode());
            List<LigneTarif> lignes = profils.getOrDefault(codeParking, profilParDefaut);

            cloturerAncienneGrille(parking, datePriseEffet.minusDays(1));

            for (LigneTarif ligne : lignes) {
                Forfait forfait = forfaits.get(ligne.forfaitCode());

                for (Integer duree : DUREES) {
                    synchroniserTarif(parking, forfait, duree, ligne.prixMensuelTTC());
                    nombreTarifs++;
                }
            }
        }

        log.info(
                "Grille tarifaire RRM synchronisée : {} tarifs pour {} parkings, prise d'effet {}",
                nombreTarifs,
                parkings.size(),
                datePriseEffet
        );
    }

    private Map<String, List<LigneTarif>> chargerProfilsTarifaires() throws Exception {
        Map<String, List<LigneTarif>> profils = new LinkedHashMap<>();
        Map<String, LigneTarif> lignesUniques = new LinkedHashMap<>();
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

                LigneTarif tarif = analyserLigne(ligne, numeroLigne);
                String cleUnique = tarif.parkingCode() + "|" + tarif.forfaitCode();

                if (lignesUniques.putIfAbsent(cleUnique, tarif) != null) {
                    throw new IllegalStateException(
                            "Tarif dupliqué à la ligne " + numeroLigne + " : " + cleUnique
                    );
                }

                profils.computeIfAbsent(tarif.parkingCode(), cle -> new ArrayList<>())
                        .add(tarif);
            }
        }

        return profils;
    }

    private LigneTarif analyserLigne(String ligne, int numeroLigne) {
        String[] colonnes = ligne.split(";", -1);

        if (colonnes.length != 5) {
            throw new IllegalStateException("Ligne CSV invalide : " + numeroLigne);
        }

        String parkingCode = normaliserCode(colonnes[0]);
        String forfaitCode = normaliserCode(colonnes[1]);
        String libelle = colonnes[2].trim();
        String placeReserveeTexte = colonnes[3].trim().toLowerCase(Locale.ROOT);

        if (parkingCode.isBlank() || forfaitCode.isBlank() || libelle.isBlank()) {
            throw new IllegalStateException("Valeur obligatoire absente à la ligne " + numeroLigne);
        }

        if (!placeReserveeTexte.equals("true") && !placeReserveeTexte.equals("false")) {
            throw new IllegalStateException("Valeur placeReservee invalide à la ligne " + numeroLigne);
        }

        BigDecimal prixMensuelTTC;

        try {
            prixMensuelTTC = new BigDecimal(colonnes[4].trim());
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("Montant TTC invalide à la ligne " + numeroLigne, exception);
        }

        if (prixMensuelTTC.signum() <= 0) {
            throw new IllegalStateException("Le montant TTC doit être positif à la ligne " + numeroLigne);
        }

        return new LigneTarif(
                parkingCode,
                forfaitCode,
                libelle,
                Boolean.parseBoolean(placeReserveeTexte),
                prixMensuelTTC.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private Map<String, Forfait> synchroniserForfaits(
            Map<String, List<LigneTarif>> profils
    ) {
        Map<String, Forfait> forfaits = new LinkedHashMap<>();

        profils.values().stream()
                .flatMap(List::stream)
                .forEach(ligne -> forfaits.computeIfAbsent(
                        ligne.forfaitCode(),
                        code -> obtenirOuCreerForfait(ligne)
                ));

        return forfaits;
    }

    private Forfait obtenirOuCreerForfait(LigneTarif ligne) {
        Forfait forfait = forfaitRepository
                .findByCodeIgnoreCase(ligne.forfaitCode())
                .orElseGet(Forfait::new);

        forfait.setCode(ligne.forfaitCode());
        forfait.setLibelle(ligne.libelle());
        forfait.setDescription(ligne.libelle());
        forfait.setPlaceReservee(ligne.placeReservee());
        forfait.setActif(true);

        return forfaitRepository.save(forfait);
    }

    private void cloturerAncienneGrille(Parking parking, LocalDate dateFin) {
        tarifParkingRepository
                .trouverTarifsApplicables(parking.getId(), datePriseEffet)
                .stream()
                .filter(tarif -> !datePriseEffet.equals(tarif.getDateDebutValidite()))
                .forEach(tarif -> tarif.cloturer(dateFin));
    }

    private void synchroniserTarif(
            Parking parking,
            Forfait forfait,
            Integer duree,
            BigDecimal prixMensuelTTC
    ) {
        TarifParking tarif = tarifParkingRepository
                .findByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
                        parking.getId(),
                        forfait.getId(),
                        duree,
                        datePriseEffet
                )
                .orElseGet(TarifParking::new);

        tarif.setParking(parking);
        tarif.setForfait(forfait);
        tarif.setDureeEnMois(duree);
        tarif.setPrixHT(prixMensuelTTC.divide(COEFFICIENT_TVA, 2, RoundingMode.HALF_UP));
        tarif.setTauxTVA(TAUX_TVA);
        tarif.setDateDebutValidite(datePriseEffet);
        tarif.setDateFinValidite(null);

        tarifParkingRepository.save(tarif);
    }

    private String normaliserCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }

    private record LigneTarif(
            String parkingCode,
            String forfaitCode,
            String libelle,
            boolean placeReservee,
            BigDecimal prixMensuelTTC
    ) {
    }
}
