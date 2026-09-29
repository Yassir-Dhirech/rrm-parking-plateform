package com.rrm.parking.parking.service;

import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.ForfaitRepository;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreationParkingService {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final Set<String> CATEGORIES = Set.of("PARTICULIER", "CORPORATE", "SPECIAL");
    private static final Set<String> EQUIPEMENTS = Set.of(
            "RFID", "LPR", "GUIDAGE_LED", "SURVEILLANCE_247", "EV_CHARGERS", "PMR_ACCESS");

    private final ParkingRepository parkings;
    private final UtilisateurRepository utilisateurs;
    private final AffectationAgentParkingRepository affectations;
    private final ForfaitRepository forfaits;
    private final TarifParkingRepository tarifs;

    public record PlanInitial(String libelle, String categorie, String plageHoraire,
                              Integer dureeMois, BigDecimal tarifTTC) {}

    public record Demande(String code, String nom, String adresse, String zone,
                          Integer capaciteTotale, Integer pourcentageTickets,
                          Integer pourcentageAbonnements, Integer pourcentageCorporate,
                          Integer pourcentageParticulier, Double latitude, Double longitude,
                          String typeOuvrage, Integer nombreNiveaux, String horairesOuverture,
                          List<String> equipements, Long agentAssigneId,
                          Long superviseurAssigneId, List<PlanInitial> plans) {}

    @Transactional
    public Parking creer(Demande demande) {
        if (demande == null) erreur("Les informations du parking sont obligatoires");
        String code = texte(demande.code(), 30, "Le code parking est obligatoire")
                .toUpperCase(Locale.ROOT);
        if (!code.matches("[A-Z0-9_-]+")) erreur("Le code parking contient des caractères invalides");
        if (parkings.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le code parking existe déjà");
        }
        String nom = texte(demande.nom(), 150, "Le nom du parking est obligatoire");
        String adresse = texte(demande.adresse(), 255, "L'adresse du parking est obligatoire");
        String zone = texte(demande.zone(), 100, "Le quartier est obligatoire");
        if (demande.capaciteTotale() == null || demande.capaciteTotale() <= 0) erreur("La capacité doit être positive");
        pourcentages(demande.pourcentageTickets(), demande.pourcentageAbonnements(), "Tickets et abonnements");
        pourcentages(demande.pourcentageCorporate(), demande.pourcentageParticulier(), "Corporate et particuliers");
        if (demande.latitude() == null || !Double.isFinite(demande.latitude())
                || demande.latitude() < -90 || demande.latitude() > 90
                || demande.longitude() == null || !Double.isFinite(demande.longitude())
                || demande.longitude() < -180 || demande.longitude() > 180) {
            erreur("Les coordonnées GPS sont invalides");
        }
        String type = texte(demande.typeOuvrage(), 100, "Le type d'ouvrage est obligatoire");
        String horaires = texte(demande.horairesOuverture(), 120, "Les horaires sont obligatoires");
        if (demande.nombreNiveaux() == null || demande.nombreNiveaux() < 1 || demande.nombreNiveaux() > 100) {
            erreur("Le nombre de niveaux doit être compris entre 1 et 100");
        }
        List<String> equipements = demande.equipements() == null ? List.of() : demande.equipements();
        if (!EQUIPEMENTS.containsAll(equipements)) erreur("Un équipement est inconnu");
        if (demande.agentAssigneId() == null) erreur("Un agent est obligatoire");
        if (demande.superviseurAssigneId() == null) erreur("Un superviseur est obligatoire");
        if (demande.agentAssigneId().equals(demande.superviseurAssigneId())) {
            erreur("L'agent et le superviseur doivent être deux comptes distincts");
        }
        Utilisateur agent = utilisateurs.findById(demande.agentAssigneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agent introuvable"));
        Utilisateur superviseur = utilisateurs.findById(demande.superviseurAssigneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Superviseur introuvable"));
        if (agent.getStatut() != StatutUtilisateur.ACTIF || superviseur.getStatut() != StatutUtilisateur.ACTIF) {
            erreur("Les deux comptes affectés doivent être actifs");
        }
        if (agent.getRoles().stream().noneMatch(r -> r.getCode() == CodeRole.AGENT_ADMINISTRATIF)) {
            erreur("Le compte agent doit avoir le rôle Agent administratif");
        }
        if (superviseur.getRoles().stream().noneMatch(r -> r.getCode() == CodeRole.SUPERVISEUR)) {
            erreur("Le compte superviseur doit avoir le rôle Superviseur");
        }
        if (affectations.existsByUtilisateurIdAndActiveTrue(agent.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cet agent est déjà affecté à un parking actif");
        }
        if (demande.plans() == null || demande.plans().isEmpty()) erreur("Au moins un forfait est obligatoire");
        // Valider la grille entière avant toute insertion.
        for (PlanInitial plan : demande.plans()) validerPlan(plan);

        int placesAbonnees = Math.round(demande.capaciteTotale() * demande.pourcentageAbonnements() / 100f);
        int quotaCorporate = Math.round(placesAbonnees * demande.pourcentageCorporate() / 100f);
        Parking parking = new Parking();
        parking.setCode(code);
        parking.setNom(nom);
        parking.setAdresse(adresse);
        parking.setZone(zone);
        parking.setLatitude(BigDecimal.valueOf(demande.latitude()));
        parking.setLongitude(BigDecimal.valueOf(demande.longitude()));
        parking.setCapaciteTotale(demande.capaciteTotale());
        parking.setCapaciteReserveeAbonnements(placesAbonnees);
        parking.setQuotaCorporate(quotaCorporate);
        parking.setTypeOuvrage(type);
        parking.setNombreNiveaux(demande.nombreNiveaux());
        parking.setHorairesOuverture(horaires);
        parking.setEquipements(String.join(",", equipements));
        parking = parkings.save(parking);

        affecter(agent, parking);
        affecter(superviseur, parking);

        for (PlanInitial plan : demande.plans()) {
            Forfait forfait = new Forfait();
            forfait.setCode(codeForfait(code));
            forfait.setLibelle(plan.libelle().trim());
            forfait.setDescription("Plage indicative : " + plan.plageHoraire().trim());
            forfait.setCategorie(plan.categorie());
            forfait.setPlaceReservee("CORPORATE".equals(plan.categorie()));
            forfait = forfaits.save(forfait);

            TarifParking tarif = new TarifParking();
            tarif.setParking(parking);
            tarif.setForfait(forfait);
            tarif.setDureeEnMois(plan.dureeMois());
            tarif.setPrixHT(plan.tarifTTC().divide(new BigDecimal("1.20"), 2, RoundingMode.HALF_UP));
            tarif.setTauxTVA(new BigDecimal("20.00"));
            tarif.setDateDebutValidite(LocalDate.now(ZONE_RRM));
            tarifs.save(tarif);
        }
        return parking;
    }

    private void affecter(Utilisateur utilisateur, Parking parking) {
        AffectationAgentParking affectation = new AffectationAgentParking();
        affectation.setUtilisateur(utilisateur);
        affectation.setParking(parking);
        affectation.setDateDebut(LocalDate.now(ZONE_RRM));
        affectation.setActive(true);
        affectations.save(affectation);
    }

    private static void validerPlan(PlanInitial plan) {
        if (plan == null) erreur("Un forfait est invalide");
        texte(plan.libelle(), 150, "Le nom du forfait est obligatoire");
        texte(plan.plageHoraire(), 80, "La plage horaire du forfait est obligatoire");
        if (!CATEGORIES.contains(plan.categorie())) erreur("La catégorie du forfait est inconnue");
        if (plan.dureeMois() == null || plan.dureeMois() < 1 || plan.dureeMois() > 240) {
            erreur("La durée du forfait doit être comprise entre 1 et 240 mois");
        }
        if (plan.tarifTTC() == null || plan.tarifTTC().signum() <= 0
                || plan.tarifTTC().scale() > 2 || plan.tarifTTC().compareTo(new BigDecimal("9999999.99")) > 0) {
            erreur("Le tarif mensuel TTC du forfait est invalide");
        }
    }

    private static void pourcentages(Integer a, Integer b, String libelle) {
        if (a == null || b == null || a < 0 || b < 0 || a > 100 || b > 100 || a + b != 100) {
            erreur("Les pourcentages " + libelle + " doivent totaliser 100 %");
        }
    }

    private static String texte(String valeur, int limite, String message) {
        if (valeur == null || valeur.isBlank() || valeur.trim().length() > limite) erreur(message);
        return valeur.trim();
    }

    private String codeForfait(String codeParking) {
        String prefixe = codeParking.replaceAll("[^A-Z0-9]", "");
        prefixe = prefixe.substring(0, Math.min(prefixe.length(), 12));
        String code;
        do {
            code = "P_" + prefixe + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        } while (forfaits.existsByCodeIgnoreCase(code));
        return code;
    }

    private static void erreur(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
