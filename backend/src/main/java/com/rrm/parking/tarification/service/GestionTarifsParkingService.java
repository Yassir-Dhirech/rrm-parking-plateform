package com.rrm.parking.tarification.service;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.tarification.dto.response.TarifParkingPublicResponse;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GestionTarifsParkingService {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final BigDecimal CENT = new BigDecimal("100");

    private final ParkingRepository parkings;
    private final TarifParkingRepository tarifs;
    private final ForfaitRepository forfaits;

    @Transactional
    public void retirerForfait(Long parkingId, Long forfaitId) {
        chargerParking(parkingId);
        List<TarifParking> tarifsDuForfait = tarifs.trouverForfaitDuParkingPourRetrait(
                parkingId, forfaitId);
        if (tarifsDuForfait.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Ce forfait n'est pas proposé dans ce parking");
        }
        tarifsDuForfait.forEach(TarifParking::retirer);
        tarifs.saveAll(tarifsDuForfait);
    }

    @Transactional
    public TarifParkingPublicResponse reviser(Long parkingId, Long tarifId,
                                               BigDecimal prixMensuelTtc) {
        Parking parking = chargerParking(parkingId);
        TarifParking ancien = tarifs.findByIdPourMiseAJour(tarifId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tarif introuvable"));
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        if (!parkingId.equals(ancien.getParking().getId())
                || !Boolean.TRUE.equals(ancien.getForfait().getActif())
                || !ancien.estApplicableA(aujourdHui)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ce tarif n'est pas applicable à ce parking");
        }
        BigDecimal nouveauPrixHt = convertirTtcEnHt(prixMensuelTtc, ancien.getTauxTVA());
        if (ancien.getDateDebutValidite().equals(aujourdHui)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un tarif entré en vigueur aujourd'hui ne peut pas être révisé le même jour");
        }
        if (tarifs.existsByParkingIdAndForfaitIdAndDureeEnMoisAndDateDebutValidite(
                parkingId, ancien.getForfait().getId(), ancien.getDureeEnMois(), aujourdHui)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une révision existe déjà pour ce forfait et cette durée aujourd'hui");
        }

        ancien.cloturer(aujourdHui.minusDays(1));
        tarifs.save(ancien);

        TarifParking nouveau = new TarifParking();
        nouveau.setParking(parking);
        nouveau.setForfait(ancien.getForfait());
        nouveau.setDureeEnMois(ancien.getDureeEnMois());
        nouveau.setPrixHT(nouveauPrixHt);
        nouveau.setTauxTVA(ancien.getTauxTVA());
        nouveau.setDateDebutValidite(aujourdHui);
        return TarifParkingPublicResponse.depuis(tarifs.save(nouveau));
    }

    @Transactional
    public TarifParkingPublicResponse ajouterForfait(Long parkingId, String nom,
                                                       String description, Boolean placeReservee,
                                                       Integer dureeEnMois,
                                                       BigDecimal prixMensuelTtc,
                                                       BigDecimal tauxTva) {
        Parking parking = chargerParking(parkingId);
        String libelle = texte(nom, 150, "Le nom du forfait est obligatoire");
        String details = description == null || description.isBlank()
                ? null : texte(description, 500, "La description est trop longue");
        if (dureeEnMois == null || dureeEnMois < 1 || dureeEnMois > 240) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La durée doit être comprise entre 1 et 240 mois");
        }
        BigDecimal tva = tauxTva == null ? new BigDecimal("20.00") : tauxTva;
        if (tva.signum() < 0 || tva.compareTo(CENT) > 0 || tva.scale() > 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le taux de TVA doit être compris entre 0 et 100 %");
        }
        BigDecimal prixHt = convertirTtcEnHt(prixMensuelTtc, tva);

        Forfait forfait = new Forfait();
        forfait.setCode(genererCode(parking.getCode()));
        forfait.setLibelle(libelle);
        forfait.setDescription(details);
        forfait.setPlaceReservee(Boolean.TRUE.equals(placeReservee));
        forfait.setActif(true);
        forfait = forfaits.save(forfait);

        TarifParking tarif = new TarifParking();
        tarif.setParking(parking);
        tarif.setForfait(forfait);
        tarif.setDureeEnMois(dureeEnMois);
        tarif.setPrixHT(prixHt);
        tarif.setTauxTVA(tva);
        tarif.setDateDebutValidite(LocalDate.now(ZONE_RRM));
        return TarifParkingPublicResponse.depuis(tarifs.save(tarif));
    }

    private Parking chargerParking(Long id) {
        Parking parking = parkings.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable"));
        if (parking.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Les tarifs d'un parking archivé ne peuvent pas être modifiés");
        }
        return parking;
    }

    private BigDecimal convertirTtcEnHt(BigDecimal ttc, BigDecimal tva) {
        if (ttc == null || ttc.signum() <= 0 || ttc.scale() > 2
                || ttc.compareTo(new BigDecimal("9999999999.99")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le prix mensuel TTC doit être positif et comporter au plus deux décimales");
        }
        return ttc.divide(BigDecimal.ONE.add(tva.divide(CENT, 4, RoundingMode.HALF_UP)),
                2, RoundingMode.HALF_UP);
    }

    private String texte(String valeur, int maximum, String message) {
        if (valeur == null || valeur.isBlank() || valeur.trim().length() > maximum) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return valeur.trim();
    }

    private String genererCode(String codeParking) {
        String prefixe = codeParking == null ? "PARKING" : codeParking
                .toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
        prefixe = prefixe.substring(0, Math.min(prefixe.length(), 12));
        String code;
        do {
            code = "P_" + prefixe + "_" + UUID.randomUUID().toString()
                    .substring(0, 8).toUpperCase(Locale.ROOT);
        } while (forfaits.existsByCodeIgnoreCase(code));
        return code;
    }
}
