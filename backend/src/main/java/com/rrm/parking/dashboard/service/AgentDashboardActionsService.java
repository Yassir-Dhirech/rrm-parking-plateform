package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.dto.response.CarteAgentResponse;
import com.rrm.parking.carte.dto.response.DemandeOperationnelleResponse;
import com.rrm.parking.carte.service.OperationCarteService;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.dashboard.dto.response.AgentDashboardActionsResponse;
import com.rrm.parking.dashboard.dto.response.AgentDashboardRechercheResponse;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AgentDashboardActionsService {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final int LIMITE = 8;
    // Seuils de signalement opérationnel (heures), sans effet sur le statut métier.
    private static final long RETARD_PAIEMENT = 48;
    private static final long RETARD_IMPRESSION = 24;
    private static final long RETARD_REMISE = 72;

    private final AffectationAgentParkingRepository affectationRepository;
    private final DemandeClientRepository demandeRepository;
    private final OperationCarteService operationCarteService;
    private final AgentParkingRegistreService registreService;

    @Transactional(readOnly = true)
    public AgentDashboardActionsResponse actions(Long agentId) {
        Long parkingId = parkingAgent(agentId);
        LocalDateTime maintenant = LocalDateTime.now(ZONE_RRM);
        List<AgentDashboardActionsResponse.Action> actions = new ArrayList<>();
        var limite = PageRequest.of(0, LIMITE);
        List<DemandeClient> demandes = new ArrayList<>(demandeRepository
                .prochainesNouvellesDemandes(parkingId, StatutDemande.EN_ATTENTE_PAIEMENT, limite));
        demandes.addAll(demandeRepository.prochainsRenouvellements(
                parkingId, StatutDemande.EN_ATTENTE_PAIEMENT, limite));
        for (DemandeClient demande : demandes) {
            DemandeRechercheResponse detail = DemandeRechercheResponse.depuis(demande);
            LocalDateTime depuis = demande.getDateValidationOtp() != null
                    ? demande.getDateValidationOtp() : demande.getDateSoumission();
            actions.add(new AgentDashboardActionsResponse.Action(
                    "PAIEMENT", demande.getId(), demande.getReference(),
                    detail.nomClient(), detail.identifiantClient(), depuis,
                    anciennete(depuis, maintenant), anciennete(depuis, maintenant) >= RETARD_PAIEMENT,
                    "/agent/demandes/" + demande.getId()));
        }
        ajouterOperations(actions, operationCarteService.listerImpressions(agentId),
                "IMPRESSION", RETARD_IMPRESSION, "/agent/impressions-cartes", maintenant);
        ajouterOperations(actions, operationCarteService.listerRemises(agentId),
                "REMISE", RETARD_REMISE, "/agent/remises-cartes", maintenant);
        // Le compteur couvre aussi les demandes qui ne tiennent pas dans l'aperçu.
        long alertes = demandeRepository.countNouvellesEnRetard(parkingId,
                StatutDemande.EN_ATTENTE_PAIEMENT, maintenant.minusHours(RETARD_PAIEMENT))
                + demandeRepository.countRenouvellementsEnRetard(parkingId,
                StatutDemande.EN_ATTENTE_PAIEMENT, maintenant.minusHours(RETARD_PAIEMENT))
                + actions.stream().filter(a -> !"PAIEMENT".equals(a.type()) && a.enRetard()).count();
        return new AgentDashboardActionsResponse(actions.stream()
                .sorted(Comparator.comparing(AgentDashboardActionsResponse.Action::depuis,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(LIMITE).toList(), alertes);
    }

    @Transactional(readOnly = true)
    public AgentDashboardRechercheResponse rechercher(Long agentId, String recherche) {
        parkingAgent(agentId);
        String terme = recherche == null ? "" : recherche.trim();
        if (terme.length() < 2 || terme.length() > 100) {
            throw new IllegalArgumentException("Saisissez entre 2 et 100 caractères");
        }
        String filtre = "%" + terme.toLowerCase(Locale.ROOT)
                .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        List<AgentDashboardRechercheResponse.Resultat> resultat = new ArrayList<>();
        for (Long id : demandeRepository.rechercherIdsReguliers(filtre)) {
            demandeRepository.findById(id).ifPresent(demande -> {
                DemandeRechercheResponse d = DemandeRechercheResponse.depuis(demande);
                resultat.add(new AgentDashboardRechercheResponse.Resultat(
                        "DEMANDE", d.id(), d.reference(), d.nomClient(),
                        d.identifiantClient(), d.statut().name(), d.parkingNom(),
                        "/agent/demandes/" + d.id()));
            });
        }
        for (CarteAgentResponse carte : registreService.cartes(agentId, terme, null, null)
                .stream().limit(10).toList()) {
            resultat.add(new AgentDashboardRechercheResponse.Resultat(
                    "CARTE", carte.id(), carte.reference(), carte.clientNom(),
                    carte.numeroCarte(), carte.statut().name(), carte.parkingNom(),
                    "/agent/cartes?recherche="
                            + java.net.URLEncoder.encode(terme, java.nio.charset.StandardCharsets.UTF_8)));
        }
        return new AgentDashboardRechercheResponse(resultat);
    }

    private void ajouterOperations(List<AgentDashboardActionsResponse.Action> actions,
            List<DemandeOperationnelleResponse> operations, String type, long seuil,
            String chemin, LocalDateTime maintenant) {
        for (DemandeOperationnelleResponse operation : operations) {
            LocalDateTime depuis = operation.dateCreation();
            long heures = anciennete(depuis, maintenant);
            actions.add(new AgentDashboardActionsResponse.Action(
                    type, operation.id(), operation.reference(), operation.nomClient(),
                    operation.cin(), depuis, heures, heures >= seuil,
                    chemin + "?operationId=" + operation.id()));
        }
    }

    private long anciennete(LocalDateTime depuis, LocalDateTime maintenant) {
        return depuis == null ? 0 : Math.max(0, Duration.between(depuis, maintenant).toHours());
    }

    private Long parkingAgent(Long agentId) {
        LocalDate date = LocalDate.now(ZONE_RRM);
        return affectationRepository.findByUtilisateurIdAndActiveTrue(agentId)
                .filter(a -> a.getDateDebut() != null && !a.getDateDebut().isAfter(date))
                .filter(a -> a.getDateFin() == null || !a.getDateFin().isBefore(date))
                .map(AffectationAgentParking::getParking)
                .map(parking -> parking.getId())
                .orElseThrow(() -> new ConflitMetierException(
                        "L'agent ne possède pas d'affectation active à un parking"));
    }

}
