package com.rrm.parking.tarification.controller;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tarifs")
@RequiredArgsConstructor
public class AdminTarifController {

    private final TarifParkingRepository tarifParkingRepository;
    private final ForfaitRepository forfaitRepository;
    private final ParkingRepository parkingRepository;
    private final AuditLogRepository auditLogRepository; // Persistance de la traçabilité des motifs

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listerTousLesTarifs() {
        List<TarifParking> tarifsActifs = tarifParkingRepository
                .findAll(Sort.by("parking.nom").ascending().and(Sort.by("forfait.libelle").ascending()))
                .stream()
                .filter(t -> t.getDateFinValidite() == null)
                .toList();

        Map<String, Map<String, Object>> mapUniques = new java.util.LinkedHashMap<>();

        for (TarifParking t : tarifsActifs) {
            String cle = t.getParking().getId() + "_" + t.getForfait().getId();
            if (!mapUniques.containsKey(cle)) {
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
                mapUniques.put(cle, map);
            }
        }

        return new java.util.ArrayList<>(mapUniques.values());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> creerTarif(@RequestBody Map<String, Object> req) {
        if (!req.containsKey("parkingId") || !req.containsKey("tarifTTC")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parking et tarif TTC obligatoires"));
        }

        Long parkingId = Long.valueOf(req.get("parkingId").toString());
        Parking parking = parkingRepository.findById(parkingId).orElse(null);
        if (parking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parking introuvable"));
        }

        String typeAbonnement = req.getOrDefault("typeAbonnement", "H24_NON_RESERVEE").toString();
        String segment = req.getOrDefault("segment", "REGULIER").toString();
        if ("CORPORATE".equalsIgnoreCase(segment) && !typeAbonnement.startsWith("CORP") && !typeAbonnement.equals("TAJIR")) {
            typeAbonnement = "CORP_" + typeAbonnement;
        }

        String finalCode = typeAbonnement;
        Forfait forfait = forfaitRepository.findByCodeIgnoreCase(finalCode).orElseGet(() -> {
            Forfait f = new Forfait();
            f.setCode(finalCode);
            f.setLibelle(req.getOrDefault("libelle", finalCode).toString());
            f.setDescription(req.getOrDefault("plageHoraire", "24h / 7j").toString());
            f.setPlaceReservee(finalCode.contains("RESERVEE"));
            f.setActif(true);
            return forfaitRepository.save(f);
        });

        double ttc = Double.parseDouble(req.get("tarifTTC").toString());
        BigDecimal ht = BigDecimal.valueOf(ttc).divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);

        int[] durees = {1, 3, 6, 12};
        for (int d : durees) {
            TarifParking tp = new TarifParking();
            tp.setParking(parking);
            tp.setForfait(forfait);
            tp.setDureeEnMois(d);
            tp.setPrixHT(ht);
            tp.setTauxTVA(new BigDecimal("20.00"));
            tp.setDateDebutValidite(LocalDate.now());
            tarifParkingRepository.save(tp);
        }

        // Enregistrement du motif dans la table audit_log de MySQL
        try {
            String motif = req.getOrDefault("motifCreation", "Création homologuée de tarif").toString();
            auditLogRepository.save(new AuditLog(
                    null, "Admin", parking,
                    TypeActionAudit.CREATION, ResultatAudit.SUCCES,
                    "TARIF_PARKING", forfait.getId(), forfait.getLibelle(),
                    "Création tarif : " + forfait.getLibelle() + " (" + ttc + " MAD TTC)",
                    "Motif : " + motif,
                    null, null, "POST", "/api/admin/tarifs", null
            ));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("message", "Nouveau tarif créé et enregistré dans MySQL"));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> modifierTarif(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req
    ) {
        TarifParking tarif = tarifParkingRepository.findById(id).orElse(null);
        if (tarif == null) {
            return ResponseEntity.notFound().build();
        }

        double nouveauTTC = 0.0;
        // 1. Recalcul du prix HT depuis le TTC saisi (HT = TTC / 1.20)
        if (req.containsKey("tarifTTC") && req.get("tarifTTC") != null) {
            nouveauTTC = Double.parseDouble(req.get("tarifTTC").toString());
            BigDecimal ht = BigDecimal.valueOf(nouveauTTC).divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);
            
            // Mise à jour de toutes les durées (1, 3, 6, 12 mois) rattachées à ce forfait & parking
            List<TarifParking> variantes = tarifParkingRepository.findAll().stream()
                    .filter(t -> t.getParking().getId().equals(tarif.getParking().getId())
                              && t.getForfait().getId().equals(tarif.getForfait().getId()))
                    .toList();
            for (TarifParking v : variantes) {
                v.setPrixHT(ht);
            }
            tarifParkingRepository.saveAll(variantes);
        }

        // 2. Gestion sécurisée du Segment (Corporate vs Régulier)
        if (req.containsKey("segment") && req.get("segment") != null) {
            String segment = req.get("segment").toString();
            String currentCode = tarif.getForfait().getCode();
            String targetCode = currentCode;

            if ("CORPORATE".equalsIgnoreCase(segment)) {
                if (!currentCode.startsWith("CORP") && !currentCode.equals("TAJIR")) {
                    targetCode = "CORP_" + currentCode;
                }
            } else {
                if (currentCode.startsWith("CORP_")) {
                    targetCode = currentCode.replace("CORP_", "");
                }
            }

            if (!targetCode.equalsIgnoreCase(currentCode)) {
                final String codeToFind = targetCode;
                Forfait cible = forfaitRepository.findByCodeIgnoreCase(codeToFind).orElseGet(() -> {
                    Forfait f = new Forfait();
                    f.setCode(codeToFind);
                    f.setLibelle(req.containsKey("libelle") ? req.get("libelle").toString() : tarif.getForfait().getLibelle());
                    f.setDescription(req.containsKey("plageHoraire") ? req.get("plageHoraire").toString() : tarif.getForfait().getDescription());
                    f.setPlaceReservee(codeToFind.contains("RESERVEE"));
                    f.setActif(true);
                    return forfaitRepository.save(f);
                });

                List<TarifParking> variantes = tarifParkingRepository.findAll().stream()
                        .filter(t -> t.getParking().getId().equals(tarif.getParking().getId())
                                  && t.getForfait().getId().equals(tarif.getForfait().getId()))
                        .toList();
                for (TarifParking v : variantes) {
                    v.setForfait(cible);
                }
                tarifParkingRepository.saveAll(variantes);
            }
        }

        // 3. Mise à jour des informations d'affichage du Forfait
        if (req.containsKey("libelle") && req.get("libelle") != null) {
            tarif.getForfait().setLibelle(req.get("libelle").toString());
        }
        if (req.containsKey("plageHoraire") && req.get("plageHoraire") != null) {
            tarif.getForfait().setDescription(req.get("plageHoraire").toString());
        }
        forfaitRepository.save(tarif.getForfait());

        // 4. Enregistrement du Motif dans la table audit_log de MySQL
        try {
            String motif = req.getOrDefault("motifModification", "Révision tarifaire homologuée").toString();
            auditLogRepository.save(new AuditLog(
                    null, "Admin", tarif.getParking(),
                    TypeActionAudit.MODIFICATION, ResultatAudit.SUCCES,
                    "TARIF_PARKING", tarif.getForfait().getId(), tarif.getForfait().getLibelle(),
                    "Modification tarif : " + tarif.getForfait().getLibelle() + " (" + nouveauTTC + " MAD TTC)",
                    "Motif officiel : " + motif,
                    null, null, "PUT", "/api/admin/tarifs/" + id, null
            ));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("message", "Tarif mis à jour avec succès dans MySQL."));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> supprimerTarif(@PathVariable Long id) {
        if (!tarifParkingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            tarifParkingRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Tarif supprimé définitivement de la base de données."));
        } catch (Exception ex) {
            TarifParking tarif = tarifParkingRepository.findById(id).orElseThrow();
            tarif.cloturer(LocalDate.now());
            tarifParkingRepository.save(tarif);
            return ResponseEntity.ok(Map.of(
                    "warning", true,
                    "message", "Ce tarif étant rattaché à des dossiers existants, il a été clôturé et retiré des nouvelles souscriptions pour préserver l'historique comptable."
            ));
        }
    }
}
