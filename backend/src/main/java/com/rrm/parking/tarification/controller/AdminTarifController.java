package com.rrm.parking.tarification.controller;

import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tarifs")
@RequiredArgsConstructor
public class AdminTarifController {

    private final TarifParkingRepository tarifParkingRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listerTousLesTarifs() {
        return tarifParkingRepository
                .findAll(Sort.by("parking.nom").ascending().and(Sort.by("forfait.libelle").ascending()))
                .stream()
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", t.getId());
                    map.put("libelle", t.getForfait().getLibelle());
                    map.put("typeAbonnement", t.getForfait().getCode());
                    map.put("plageHoraire", t.getForfait().getDescription() != null ? t.getForfait().getDescription() : "24h / 7j");
                    map.put("dureeMois", t.getDureeEnMois());
                    map.put("tarifHT", t.getPrixHT().doubleValue());
                    
                    BigDecimal coef = BigDecimal.ONE.add(t.getTauxTVA().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                    BigDecimal ttc = t.getPrixHT().multiply(coef).setScale(2, RoundingMode.HALF_UP);
                    map.put("tarifTTC", ttc.doubleValue());
                    
                    map.put("parkingId", t.getParking().getId());
                    map.put("parkingNom", t.getParking().getNom());
                    map.put("actif", t.getForfait().getActif());
                    return map;
                })
                .toList();
    }

        @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> supprimerTarif(@PathVariable Long id) {
        if (!tarifParkingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            // Tentative de suppression physique définitive dans MySQL
            tarifParkingRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Tarif supprimé définitivement de la base de données."));
        } catch (Exception ex) {
            // Si le tarif est déjà lié à des abonnements/demandes existantes, on le clôture en toute sécurité
            TarifParking tarif = tarifParkingRepository.findById(id).orElseThrow();
            tarif.cloturer(java.time.LocalDate.now());
            tarifParkingRepository.save(tarif);
            return ResponseEntity.ok(Map.of(
                    "warning", true,
                    "message", "Ce tarif étant rattaché à des dossiers existants, il a été clôturé et retiré des nouvelles souscriptions pour préserver l'historique comptable."
            ));
        }
    }

}
