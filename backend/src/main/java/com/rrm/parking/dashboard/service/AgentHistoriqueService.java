package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.dashboard.dto.response.AgentHistoriqueResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentHistoriqueService {

    private final DemandeClientRepository demandeRepository;
    private final PaiementRepository paiementRepository;
    private final DemandeOperationnelleRepository operationRepository;
    private final AuditLogRepository auditRepository;

    @Transactional(readOnly = true)
    public AgentHistoriqueResponse charger(Long utilisateurId) {
        List<AgentHistoriqueResponse.DemandeCreee> demandes =
                demandeRepository
                        .findByInitieeParIdOrderByDateSoumissionDesc(utilisateurId)
                        .stream()
                        .map(this::versDemandeCreee)
                        .toList();

        List<AgentHistoriqueResponse.PaiementValide> paiements =
                paiementRepository
                        .findByTraiteParIdAndStatutOrderByDateConfirmationDesc(
                                utilisateurId,
                                StatutPaiement.CONFIRME
                        )
                        .stream()
                        .map(this::versPaiementValide)
                        .toList();

        List<AgentHistoriqueResponse.OperationCarte> impressions =
                chargerOperations(utilisateurId, TypeOperationCarte.IMPRESSION);
        List<AgentHistoriqueResponse.OperationCarte> remises =
                chargerOperations(utilisateurId, TypeOperationCarte.REMISE);
        List<AgentHistoriqueResponse.ModificationDemande> modifications =
                auditRepository
                        .findByActeurIdAndTypeActionAndTypeObjetOrderByDateEvenementDesc(
                                utilisateurId,
                                TypeActionAudit.MODIFICATION,
                                "DEMANDE_CLIENT"
                        )
                        .stream()
                        .map(audit -> new AgentHistoriqueResponse.ModificationDemande(
                                audit.getId(),
                                audit.getObjetId(),
                                audit.getReferenceObjet(),
                                audit.getParking() == null ? null : audit.getParking().getNom(),
                                audit.getMessage(),
                                audit.getDetailsTechniques(),
                                audit.getDateEvenement()
                        ))
                        .toList();

        return new AgentHistoriqueResponse(
                demandes,
                paiements,
                impressions,
                remises,
                modifications
        );
    }

    private List<AgentHistoriqueResponse.OperationCarte> chargerOperations(
            Long utilisateurId,
            TypeOperationCarte typeOperation
    ) {
        return operationRepository
                .findByExecuteeParIdAndTypeOperationAndStatutOrderByDateExecutionDesc(
                        utilisateurId,
                        typeOperation,
                        StatutDemandeOperationnelle.TERMINEE
                )
                .stream()
                .map(this::versOperation)
                .toList();
    }

    private AgentHistoriqueResponse.DemandeCreee versDemandeCreee(
            DemandeClient demandeBrute
    ) {
        DemandeClient demande = deproxifier(demandeBrute);
        return new AgentHistoriqueResponse.DemandeCreee(
                demande.getId(),
                demande.getReference(),
                typeDemande(demande),
                demande.getStatut().name(),
                nomClient(demande),
                parkingNom(demande),
                demande.getDateCreation()
        );
    }

    private AgentHistoriqueResponse.PaiementValide versPaiementValide(
            Paiement paiement
    ) {
        DemandeClient demande = deproxifier(paiement.getDemande());
        return new AgentHistoriqueResponse.PaiementValide(
                paiement.getId(),
                paiement.getReference(),
                demande.getReference(),
                nomClient(demande),
                parkingNom(demande),
                paiement.getModePaiement().name(),
                paiement.getMontant(),
                paiement.getDateConfirmation()
        );
    }

    private AgentHistoriqueResponse.OperationCarte versOperation(
            DemandeOperationnelle operation
    ) {
        DemandeClient demande = operation.getDemandeClientSource();
        if (demande == null) {
            demande = demandeRepository.findByAbonnementGenereId(
                    operation.getCarteAcces().getAbonnement().getId()
            ).orElse(null);
        }
        DemandeClient demandeReelle = demande == null ? null : deproxifier(demande);

        return new AgentHistoriqueResponse.OperationCarte(
                operation.getId(),
                operation.getReference(),
                demandeReelle == null ? null : demandeReelle.getReference(),
                demandeReelle == null ? null : nomClient(demandeReelle),
                demandeReelle == null ? null : parkingNom(demandeReelle),
                operation.getCarteAcces().getReference(),
                operation.getCarteAcces().getNumeroCarte(),
                operation.getDateExecution()
        );
    }

    private DemandeClient deproxifier(DemandeClient demande) {
        return (DemandeClient) Hibernate.unproxy(demande);
    }

    private String nomClient(DemandeClient demande) {
        Client client = (Client) Hibernate.unproxy(demande.getClient());
        if (client instanceof ClientParticulier particulier) {
            return particulier.getNomComplet();
        }
        if (client instanceof ClientEntreprise entreprise) {
            return entreprise.getRaisonSociale();
        }
        return "Client";
    }

    private String parkingNom(DemandeClient demande) {
        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            return nouvelle.getTarifParking().getParking().getNom();
        }
        if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            return renouvellement.getTarifParking().getParking().getNom();
        }
        if (demande instanceof DemandeNouveauContratCorporate corporate) {
            return corporate.getParking().getNom();
        }
        return null;
    }

    private String typeDemande(DemandeClient demande) {
        if (demande instanceof DemandeNouvelAbonnementRegulier) {
            return "NOUVEL_ABONNEMENT_REGULIER";
        }
        if (demande instanceof DemandeRenouvellementRegulier) {
            return "RENOUVELLEMENT_REGULIER";
        }
        if (demande instanceof DemandeNouveauContratCorporate) {
            return "NOUVEAU_CONTRAT_CORPORATE";
        }
        return demande.getClass().getSimpleName();
    }
}
