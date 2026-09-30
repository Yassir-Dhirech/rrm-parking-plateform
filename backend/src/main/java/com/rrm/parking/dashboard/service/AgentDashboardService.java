package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.dashboard.dto.response.AgentDashboardKpiResponse;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgentDashboardService {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final List<StatutDemandeOperationnelle> STATUTS_OUVERTS =
            List.of(
                    StatutDemandeOperationnelle.CREEE,
                    StatutDemandeOperationnelle.AFFECTEE,
                    StatutDemandeOperationnelle.EN_COURS
            );

    private final AffectationAgentParkingRepository affectationRepository;
    private final DemandeClientRepository demandeRepository;
    private final PaiementRepository paiementRepository;
    private final DemandeOperationnelleRepository operationRepository;

    @Transactional(readOnly = true)
    public AgentDashboardKpiResponse chargerKpis(Long utilisateurId) {
        AffectationAgentParking affectation = affectationRepository
                .findByUtilisateurIdAndActiveTrue(utilisateurId)
                .orElseThrow(() -> new ConflitMetierException(
                        "Aucun parking actif n'est affecté à cet agent"
                ));

        Long parkingId = affectation.getParking().getId();
        LocalDate dateReference = LocalDate.now(ZONE_RRM);
        LocalDateTime debutJour = dateReference.atStartOfDay();
        LocalDateTime finJour = dateReference.plusDays(1).atStartOfDay();

        AgentDashboardKpiResponse.RepartitionDossiersDto repartition =
                calculerRepartitionDossiers(parkingId);

        long demandesAEncaisser = repartition.enAttentePaiement();
        if (demandesAEncaisser == 0 && repartition.total() == 0) {
            demandesAEncaisser = demandeRepository
                    .countNouvellesDemandesRegulieresParParkingEtStatut(
                            parkingId,
                            StatutDemande.EN_ATTENTE_PAIEMENT
                    ) + demandeRepository.countRenouvellementsParParkingEtStatut(
                    parkingId,
                    StatutDemande.EN_ATTENTE_PAIEMENT
            );
        }

        BigDecimal encaissementsJour = paiementRepository
                .sumMontantConfirmeParUtilisateurEntre(
                        utilisateurId,
                        StatutPaiement.CONFIRME,
                        debutJour,
                        finJour
                );

        long nombreEncaissements = paiementRepository
                .countConfirmesParUtilisateurEntre(
                        utilisateurId,
                        StatutPaiement.CONFIRME,
                        debutJour,
                        finJour
                );

        long cartesAImprimer = compterOperations(
                TypeOperationCarte.IMPRESSION,
                parkingId,
                dateReference
        );
        long cartesARemettre = compterOperations(
                TypeOperationCarte.REMISE,
                parkingId,
                dateReference
        );

        return new AgentDashboardKpiResponse(
                parkingId,
                affectation.getParking().getNom(),
                dateReference,
                demandesAEncaisser,
                encaissementsJour == null ? BigDecimal.ZERO : encaissementsJour,
                nombreEncaissements,
                cartesAImprimer,
                cartesARemettre,
                repartition
        );
    }

    private AgentDashboardKpiResponse.RepartitionDossiersDto calculerRepartitionDossiers(Long parkingId) {
        Map<String, Long> statuts = new HashMap<>();
        List<Object[]> lignesStatuts = demandeRepository.compterDemandesParStatutEtParking(parkingId);
        if (lignesStatuts != null) {
            for (Object[] ligne : lignesStatuts) {
                if (ligne != null && ligne.length >= 2 && ligne[0] != null && ligne[1] != null) {
                    String statutStr = String.valueOf(ligne[0]);
                    long nombre = ((Number) ligne[1]).longValue();
                    statuts.put(statutStr, nombre);
                }
            }
        }

        long enAttentePaiement = statuts.getOrDefault(StatutDemande.EN_ATTENTE_PAIEMENT.name(), 0L)
                + statuts.getOrDefault(StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE.name(), 0L);
        long payees = statuts.getOrDefault(StatutDemande.PAYEE.name(), 0L)
                + statuts.getOrDefault(StatutDemande.EN_ATTENTE_CORRECTION.name(), 0L);
        long validees = statuts.getOrDefault(StatutDemande.VALIDEE.name(), 0L)
                + statuts.getOrDefault(StatutDemande.EN_PREPARATION_CARTES.name(), 0L)
                + statuts.getOrDefault(StatutDemande.PRETE_A_FINALISER.name(), 0L);
        long finalisees = statuts.getOrDefault(StatutDemande.FINALISEE.name(), 0L);

        long total = statuts.values().stream().mapToLong(Long::longValue).sum();
        long autres = Math.max(0L, total - (enAttentePaiement + payees + validees + finalisees));

        int pctEnAttentePaiement = total > 0 ? (int) Math.round((enAttentePaiement * 100.0) / total) : 0;
        int pctPayees = total > 0 ? (int) Math.round((payees * 100.0) / total) : 0;
        int pctValidees = total > 0 ? (int) Math.round((validees * 100.0) / total) : 0;
        int pctFinalisees = total > 0 ? (int) Math.round((finalisees * 100.0) / total) : 0;
        int pctAutres = total > 0 ? (int) Math.round((autres * 100.0) / total) : 0;

        return new AgentDashboardKpiResponse.RepartitionDossiersDto(
                total,
                enAttentePaiement,
                payees,
                validees,
                finalisees,
                autres,
                pctEnAttentePaiement,
                pctPayees,
                pctValidees,
                pctFinalisees,
                pctAutres
        );
    }

    private long compterOperations(
            TypeOperationCarte typeOperation,
            Long parkingId,
            LocalDate dateReference
    ) {
        return operationRepository.countOuvertesParTypeEtParking(
                typeOperation,
                STATUTS_OUVERTS,
                parkingId,
                dateReference
        );
    }
}
