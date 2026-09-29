package com.rrm.parking.parking.controller;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.enums.StatutParking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.parking.entity.ParkingPv;
import com.rrm.parking.parking.repository.ParkingPvRepository;
import com.rrm.parking.parking.service.CreationParkingService;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.tarification.dto.response.TarifParkingPublicResponse;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.tarification.service.GestionTarifsParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/admin/parkings")
@RequiredArgsConstructor
public class AdminParkingController {

    private final ParkingRepository parkingRepository;
    private final AuditLogRepository auditLogRepository;
    private final TarifParkingRepository tarifParkingRepository;
    private final GestionTarifsParkingService gestionTarifs;
    private final CreationParkingService creationParking;
    private final AffectationAgentParkingRepository affectations;
    private final ParkingPvRepository pvRepository;
    private final UtilisateurRepository utilisateurs;

    @GetMapping("/{id}/tarifs")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public List<TarifParkingPublicResponse> tarifsApplicables(@PathVariable Long id) {
        if (!parkingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable");
        }
        return tarifParkingRepository.trouverTarifsApplicables(
                        id, LocalDate.now(ZoneId.of("Africa/Casablanca")))
                .stream()
                .map(TarifParkingPublicResponse::depuis)
                .toList();
    }

    @PutMapping("/{id}/tarifs/{tarifId}")
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public TarifParkingPublicResponse reviserTarif(@PathVariable Long id,
            @PathVariable Long tarifId, @RequestBody RevisionTarifRequest requete) {
        return gestionTarifs.reviser(id, tarifId, requete.prixMensuelTtc());
    }

    @PostMapping("/{id}/tarifs")
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public TarifParkingPublicResponse ajouterForfait(@PathVariable Long id,
            @RequestBody NouveauForfaitRequest requete) {
        return gestionTarifs.ajouterForfait(id, requete.nom(), requete.description(),
                requete.placeReservee(), requete.dureeEnMois(),
                requete.prixMensuelTtc(), requete.tauxTva());
    }

    @DeleteMapping("/{id}/forfaits/{forfaitId}")
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<Void> retirerForfait(@PathVariable Long id,
            @PathVariable Long forfaitId) {
        gestionTarifs.retirerForfait(id, forfaitId);
        return ResponseEntity.noContent().build();
    }

    public record RevisionTarifRequest(BigDecimal prixMensuelTtc) {}

    public record NouveauForfaitRequest(String nom, String description,
            Boolean placeReservee, Integer dureeEnMois,
            BigDecimal prixMensuelTtc, BigDecimal tauxTva) {}

    // 1. Lister tous les parkings réels depuis MySQL
    @GetMapping
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public List<AdminParkingDto> listerTous() {
        return parkingRepository.findAll().stream().map(this::versDto).toList();
    }

    // 2. Créer un nouveau parking directement en base
    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> creer(
            @RequestBody CreationParkingService.Demande req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking sauve = creationParking.creer(req);

        // Audit log
        auditLogRepository.save(new AuditLog(
                    null,
                    jwt != null ? jwt.getSubject() : "Admin",
                    sauve,
                    TypeActionAudit.CREATION,
                    ResultatAudit.SUCCES,
                    "PARKING",
                    sauve.getId(),
                    sauve.getNom(),
                    "Création du parking " + sauve.getNom(),
                    "Capacité: " + sauve.getCapaciteTotale() + " places",
                    null, null, "POST", "/api/admin/parkings", null
            ));

        return ResponseEntity.ok(versDto(sauve));
    }

    // 3. Modifier les caractéristiques d'un parking
    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody MajParkingRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable"));
        if (p.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un parking désactivé ne peut pas être modifié");
        }
        String motif = texteObligatoire(req.motifModification(), 500, "Le motif de modification est obligatoire");
        if (req.nom() != null) p.setNom(texteObligatoire(req.nom(), 150, "Le nom est obligatoire"));
        if (req.adresse() != null) p.setAdresse(texteObligatoire(req.adresse(), 255, "L'adresse est obligatoire"));
        if (req.zone() != null) p.setZone(texteObligatoire(req.zone(), 100, "Le quartier est obligatoire"));
        if (req.latitude() != null) {
            if (!Double.isFinite(req.latitude()) || req.latitude() < -90 || req.latitude() > 90) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude invalide");
            }
            p.setLatitude(BigDecimal.valueOf(req.latitude()));
        }
        if (req.longitude() != null) {
            if (!Double.isFinite(req.longitude()) || req.longitude() < -180 || req.longitude() > 180) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude invalide");
            }
            p.setLongitude(BigDecimal.valueOf(req.longitude()));
        }
        if (req.typeOuvrage() != null) p.setTypeOuvrage(texteObligatoire(req.typeOuvrage(), 100, "Type d'ouvrage invalide"));
        if (req.nombreNiveaux() != null) {
            if (req.nombreNiveaux() < 1 || req.nombreNiveaux() > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre de niveaux invalide");
            }
            p.setNombreNiveaux(req.nombreNiveaux());
        }
        if (req.horairesOuverture() != null) p.setHorairesOuverture(
                texteObligatoire(req.horairesOuverture(), 120, "Horaires invalides"));
        if (req.equipements() != null) {
            Set<String> connus = Set.of("RFID", "LPR", "GUIDAGE_LED", "SURVEILLANCE_247", "EV_CHARGERS", "PMR_ACCESS");
            if (!connus.containsAll(req.equipements())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Équipement inconnu");
            }
            p.setEquipements(String.join(",", req.equipements()));
        }
        if (req.capaciteTotale() != null || req.pourcentageAbonnements() != null
                || req.pourcentageCorporate() != null) {
            int capacite = req.capaciteTotale() != null ? req.capaciteTotale() : p.getCapaciteTotale();
            if (capacite <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacité invalide");
            int partAbonnes = req.pourcentageAbonnements() != null ? req.pourcentageAbonnements()
                    : Math.round(p.getCapaciteReserveeAbonnements() * 100f / p.getCapaciteTotale());
            int partCorporate = req.pourcentageCorporate() != null ? req.pourcentageCorporate()
                    : p.getQuotaCorporate() == null || p.getCapaciteReserveeAbonnements() == 0 ? 60
                    : Math.round(p.getQuotaCorporate() * 100f / p.getCapaciteReserveeAbonnements());
            if (partAbonnes < 0 || partAbonnes > 100 || partCorporate < 0 || partCorporate > 100
                    || (req.pourcentageTickets() != null && req.pourcentageTickets() + partAbonnes != 100)
                    || (req.pourcentageParticulier() != null && req.pourcentageParticulier() + partCorporate != 100)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les pourcentages doivent totaliser 100 %");
            }
            int abonnes = Math.round(capacite * partAbonnes / 100f);
            p.modifierCapacites(capacite, abonnes);
            p.setQuotaCorporate(Math.round(abonnes * partCorporate / 100f));
        }

        if (req.agentAssigneId() != null || req.superviseurAssigneId() != null) {
            modifierAffectations(p, req.agentAssigneId(), req.superviseurAssigneId());
        }

        Parking misAJour = parkingRepository.save(p);

        auditLogRepository.save(new AuditLog(
                    null,
                    jwt != null ? jwt.getSubject() : "Admin",
                    misAJour,
                    TypeActionAudit.MODIFICATION,
                    ResultatAudit.SUCCES,
                    "PARKING",
                    misAJour.getId(),
                    misAJour.getNom(),
                    "Modification du parking " + misAJour.getNom(),
                    "Motif: " + motif,
                    null, null, "PUT", "/api/admin/parkings/" + id, null
            ));

        return ResponseEntity.ok(versDto(misAJour));
    }

    // 4. Verrouiller / Déverrouiller (Mode Maintenance)
    @PatchMapping("/{id}/verrouiller")
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> toggleVerrouillage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable"));
        if (p.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un parking désactivé ne peut pas être verrouillé ou déverrouillé");
        }
        if (body == null || !(body.get("lock") instanceof Boolean verrouiller)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "État de maintenance manquant");
        }
        if (verrouiller) {
            p.setMotifMaintenance(texteObligatoire(body.get("reason") instanceof String raison ? raison : null,
                    500, "Le motif de maintenance est obligatoire"));
        } else {
            p.setMotifMaintenance(null);
        }
        p.setStatut(verrouiller ? StatutParking.SUSPENDU : StatutParking.ACTIF);
        parkingRepository.save(p);

        return ResponseEntity.ok(Map.of("message", "Statut maintenance mis à jour", "verrouille", verrouiller));
    }

    // 5. Désactiver un parking
    @PatchMapping("/{id}/desactiver")
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> desactiver(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Parking p = parkingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable"));
        if (p.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Parking déjà désactivé");
        }
        p.setMotifDesactivation(texteObligatoire(body == null ? null : body.get("reason"),
                500, "Le motif de désactivation est obligatoire"));
        p.archiver();
        parkingRepository.save(p);
        List<AffectationAgentParking> enCours = affectations.findAllByParkingIdAndActiveTrue(id);
        enCours.forEach(a -> {
            a.setActive(false);
            a.setDateFin(LocalDate.now(ZoneId.of("Africa/Casablanca")));
        });
        affectations.saveAll(enCours);

        return ResponseEntity.ok(Map.of("message", "Parking désactivé"));
    }

    // 6. Supprimer un parking
    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        parkingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Parking supprimé"));
    }

    @PostMapping(value = "/{id}/pv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<?> deposerPv(@PathVariable Long id, @RequestParam("file") MultipartFile fichier)
            throws IOException {
        Parking parking = parkingRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Parking introuvable"));
        if (parking.getStatut() == StatutParking.ARCHIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Parking désactivé");
        }
        if (fichier.isEmpty() || fichier.getSize() > 5_000_000L) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le PV doit peser entre 1 octet et 5 Mo");
        }
        String mime = fichier.getContentType();
        if (mime == null || !Set.of("application/pdf", "image/png", "image/jpeg").contains(mime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le PV doit être un PDF, PNG ou JPEG");
        }
        byte[] contenu = fichier.getBytes();
        boolean pdf = mime.equals("application/pdf") && contenu.length >= 4
                && contenu[0] == '%' && contenu[1] == 'P' && contenu[2] == 'D' && contenu[3] == 'F';
        boolean png = mime.equals("image/png") && contenu.length >= 4
                && (contenu[0] & 0xff) == 0x89 && contenu[1] == 'P'
                && contenu[2] == 'N' && contenu[3] == 'G';
        boolean jpeg = mime.equals("image/jpeg") && contenu.length >= 3
                && (contenu[0] & 0xff) == 0xff && (contenu[1] & 0xff) == 0xd8
                && (contenu[2] & 0xff) == 0xff;
        if (!pdf && !png && !jpeg) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le contenu du PV ne correspond pas au format annoncé");
        }
        String nom = fichier.getOriginalFilename() == null ? "pv" : fichier.getOriginalFilename()
                .replace('\\', '/');
        nom = nom.substring(nom.lastIndexOf('/') + 1);
        if (nom.isBlank() || nom.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide");
        }
        ParkingPv pv = new ParkingPv();
        pv.setParking(parking);
        pv.setNomFichier(nom);
        pv.setTypeMime(mime);
        pv.setContenu(contenu);
        pvRepository.save(pv);
        return ResponseEntity.ok(Map.of("nomFichier", nom));
    }

    @GetMapping("/{id}/pv")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('ROLE_RESPONSABLE_STATIONNEMENT', 'ROLE_ADMINISTRATEUR_SI')")
    public ResponseEntity<byte[]> dernierPv(@PathVariable Long id) {
        ParkingPv pv = pvRepository.findFirstByParkingIdOrderByDateDepotDescIdDesc(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun PV pour ce parking"));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(pv.getNomFichier(), StandardCharsets.UTF_8).build().toString())
                .contentType(MediaType.parseMediaType(pv.getTypeMime()))
                .body(pv.getContenu());
    }

    private AdminParkingDto versDto(Parking p) {
        int capTotale = p.getCapaciteTotale() != null ? p.getCapaciteTotale() : 0;
        int capAbos = p.getCapaciteReserveeAbonnements() != null ? p.getCapaciteReserveeAbonnements() : 0;
        int quotaTickets = Math.max(0, capTotale - capAbos);
        boolean actif = p.getStatut() == StatutParking.ACTIF || p.getStatut() == StatutParking.SUSPENDU;
        boolean verrouille = p.getStatut() == StatutParking.SUSPENDU;
        List<AffectationAgentParking> responsables = affectations.findAllByParkingIdAndActiveTrue(p.getId());
        Long agentId = responsables.stream().filter(a -> a.getUtilisateur().getRoles().stream()
                .anyMatch(r -> r.getCode() == CodeRole.AGENT_ADMINISTRATIF))
                .map(a -> a.getUtilisateur().getId()).findFirst().orElse(null);
        Long superviseurId = responsables.stream().filter(a -> a.getUtilisateur().getRoles().stream()
                .anyMatch(r -> r.getCode() == CodeRole.SUPERVISEUR))
                .map(a -> a.getUtilisateur().getId()).findFirst().orElse(null);

        return new AdminParkingDto(
                p.getId(),
                p.getCode(),
                p.getNom(),
                p.getAdresse(),
                capTotale,
                capAbos,
                quotaTickets,
                capAbos,
                p.getQuotaCorporate() != null ? p.getQuotaCorporate() : Math.round(capAbos * 0.6),
                capAbos - (p.getQuotaCorporate() != null ? p.getQuotaCorporate() : Math.round(capAbos * 0.6)),
                actif,
                verrouille,
                p.getLatitude() != null ? p.getLatitude().doubleValue() : 34.02088,
                p.getLongitude() != null ? p.getLongitude().doubleValue() : -6.84165,
                p.getStatut().name(),
                p.getZone(), p.getTypeOuvrage(), p.getNombreNiveaux(),
                p.getHorairesOuverture(), p.getEquipements(), agentId, superviseurId,
                p.getMotifMaintenance(), p.getMotifDesactivation(),
                pvRepository.findFirstByParkingIdOrderByDateDepotDescIdDesc(p.getId())
                        .map(ParkingPv::getNomFichier).orElse(null)
        );
    }

    public record AdminParkingDto(
            Long id,
            String code,
            String nom,
            String adresse,
            int capaciteTotale,
            int placesReserveesAbonnes,
            int quotaTickets,
            int quotaAbonnementsTotal,
            double quotaCorporate,
            double quotaParticulier,
            boolean actif,
            boolean verrouille,
            double latitude,
            double longitude,
            String statut,
            String zone,
            String typeOuvrage,
            Integer nombreNiveaux,
            String horairesOuverture,
            String equipements,
            Long agentAssigneId,
            Long superviseurAssigneId,
            String motifMaintenance,
            String motifDesactivation,
            String pvNom
    ) {}

    public record MajParkingRequest(
            String nom,
            String adresse,
            Integer capaciteTotale,
            Integer placesReserveesAbonnes,
            Double latitude,
            Double longitude,
            String motifModification,
            String zone,
            Integer pourcentageTickets,
            Integer pourcentageAbonnements,
            Integer pourcentageCorporate,
            Integer pourcentageParticulier,
            String typeOuvrage,
            Integer nombreNiveaux,
            String horairesOuverture,
            List<String> equipements,
            Long agentAssigneId,
            Long superviseurAssigneId
    ) {}

    private void modifierAffectations(Parking parking, Long agentId, Long superviseurId) {
        List<AffectationAgentParking> actives = affectations.findAllByParkingIdAndActiveTrue(parking.getId());
        if (agentId != null) changerAffectation(parking, actives, agentId, CodeRole.AGENT_ADMINISTRATIF);
        if (superviseurId != null) changerAffectation(parking, actives, superviseurId, CodeRole.SUPERVISEUR);
    }

    private void changerAffectation(Parking parking, List<AffectationAgentParking> actives,
                                    Long utilisateurId, CodeRole role) {
        AffectationAgentParking precedente = actives.stream()
                .filter(a -> a.getUtilisateur().getRoles().stream().anyMatch(r -> r.getCode() == role))
                .findFirst().orElse(null);
        if (precedente != null && precedente.getUtilisateur().getId().equals(utilisateurId)) return;
        Utilisateur nouveau = utilisateurs.findById(utilisateurId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Collaborateur introuvable"));
        if (nouveau.getStatut() != StatutUtilisateur.ACTIF || nouveau.getRoles().stream()
                .noneMatch(r -> r.getCode() == role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le collaborateur doit être actif et avoir le rôle " + role);
        }
        if (role == CodeRole.AGENT_ADMINISTRATIF
                && affectations.existsByUtilisateurIdAndActiveTrue(utilisateurId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cet agent est déjà affecté à un parking actif");
        }
        LocalDate aujourdHui = LocalDate.now(ZoneId.of("Africa/Casablanca"));
        if (precedente != null) {
            precedente.setActive(false);
            precedente.setDateFin(aujourdHui);
            affectations.save(precedente);
        }
        AffectationAgentParking aReutiliser = affectations.findAllByUtilisateurIdOrderByDateDebutDesc(utilisateurId)
                .stream().filter(a -> a.getParking().getId().equals(parking.getId())
                        && a.getDateDebut().equals(aujourdHui)).findFirst().orElse(null);
        if (aReutiliser != null) {
            aReutiliser.setActive(true);
            aReutiliser.setDateFin(null);
            affectations.save(aReutiliser);
        } else {
            AffectationAgentParking nouvelle = new AffectationAgentParking();
            nouvelle.setUtilisateur(nouveau);
            nouvelle.setParking(parking);
            nouvelle.setDateDebut(aujourdHui);
            nouvelle.setActive(true);
            affectations.save(nouvelle);
        }
    }

    private static String texteObligatoire(String valeur, int max, String message) {
        if (valeur == null || valeur.isBlank() || valeur.trim().length() > max) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return valeur.trim();
    }
}
