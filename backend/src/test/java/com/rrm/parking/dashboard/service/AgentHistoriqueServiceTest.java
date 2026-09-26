package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.dashboard.dto.response.AgentHistoriqueResponse;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentHistoriqueServiceTest {

    @Mock
    private DemandeClientRepository demandeRepository;
    @Mock
    private PaiementRepository paiementRepository;
    @Mock
    private DemandeOperationnelleRepository operationRepository;
    @Mock
    private AuditLogRepository auditRepository;

    private AgentHistoriqueService service;

    @BeforeEach
    void initialiser() {
        service = new AgentHistoriqueService(
                demandeRepository,
                paiementRepository,
                operationRepository,
                auditRepository
        );
    }

    @Test
    void doitChargerUniquementLesActionsDeLagentConnecte() {
        Long agentId = 5L;
        when(demandeRepository
                .findByInitieeParIdOrderByDateSoumissionDesc(agentId))
                .thenReturn(List.of());
        when(paiementRepository
                .findByTraiteParIdAndStatutOrderByDateConfirmationDesc(
                        agentId,
                        StatutPaiement.CONFIRME
                )).thenReturn(List.of());
        when(operationRepository
                .findByExecuteeParIdAndTypeOperationAndStatutOrderByDateExecutionDesc(
                        agentId,
                        TypeOperationCarte.IMPRESSION,
                        StatutDemandeOperationnelle.TERMINEE
                )).thenReturn(List.of());
        when(auditRepository
                .findByActeurIdAndTypeActionAndTypeObjetOrderByDateEvenementDesc(
                        agentId,
                        TypeActionAudit.MODIFICATION,
                        "DEMANDE_CLIENT"
                )).thenReturn(List.of());
        when(operationRepository
                .findByExecuteeParIdAndTypeOperationAndStatutOrderByDateExecutionDesc(
                        agentId,
                        TypeOperationCarte.REMISE,
                        StatutDemandeOperationnelle.TERMINEE
                )).thenReturn(List.of());

        AgentHistoriqueResponse resultat = service.charger(agentId);

        assertThat(resultat.demandesCreees()).isEmpty();
        assertThat(resultat.paiementsValides()).isEmpty();
        assertThat(resultat.impressionsDeclarees()).isEmpty();
        assertThat(resultat.remisesDeclarees()).isEmpty();
        assertThat(resultat.modificationsDemandes()).isEmpty();

        verify(demandeRepository)
                .findByInitieeParIdOrderByDateSoumissionDesc(agentId);
    }
}
