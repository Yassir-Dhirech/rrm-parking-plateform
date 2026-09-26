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
import java.util.List;

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

        long demandesAEncaisser = demandeRepository
                .countNouvellesDemandesRegulieresParParkingEtStatut(
                        parkingId,
                        StatutDemande.EN_ATTENTE_PAIEMENT
                ) + demandeRepository.countRenouvellementsParParkingEtStatut(
                parkingId,
                StatutDemande.EN_ATTENTE_PAIEMENT
        );

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
                cartesARemettre
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
