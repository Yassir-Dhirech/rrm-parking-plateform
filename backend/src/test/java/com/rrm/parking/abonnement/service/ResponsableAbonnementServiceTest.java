package com.rrm.parking.abonnement.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResponsableAbonnementServiceTest {
    @Mock AbonnementRepository abonnements;
    @Mock CarteAccesRepository cartes;
    @Mock FactureRepository factures;
    @Mock NotificationRepository notifications;
    @Mock AuditLogRepository audit;
    ResponsableAbonnementService service;

    @BeforeEach
    void preparer() {
        service = new ResponsableAbonnementService(abonnements, cartes, factures, notifications, audit);
    }

    @Test
    void suspendUnAbonnementActifEtJournaliseMotif() {
        ClientParticulier client = mock(ClientParticulier.class);
        when(client.getNomComplet()).thenReturn("Client réel");
        AbonnementRegulier abonnement = new AbonnementRegulier("ABO-1", client);
        ReflectionTestUtils.setField(abonnement, "id", 7L);
        abonnement.activer();
        when(abonnements.findByIdForUpdate(7L)).thenReturn(Optional.of(abonnement));
        when(cartes.findByAbonnementIdOrderByIdAsc(7L)).thenReturn(List.of());
        when(factures.findToutesParAbonnement(7L)).thenReturn(List.of());

        var resultat = service.suspendre(7L, "Motif réel", "responsable@rrm.ma");

        assertEquals("SUSPENDU", resultat.statut());
        verify(audit).save(argThat(log -> log.getDetailsTechniques().equals("Motif réel")));
    }

    @Test
    void refuseSuspensionDejaSuspendue() {
        AbonnementRegulier abonnement = new AbonnementRegulier("ABO-1", mock(ClientParticulier.class));
        abonnement.activer();
        abonnement.suspendre("Premier motif");
        when(abonnements.findByIdForUpdate(7L)).thenReturn(Optional.of(abonnement));

        assertThrows(ConflitMetierException.class,
                () -> service.suspendre(7L, "Second motif", "responsable@rrm.ma"));
        verifyNoInteractions(cartes, audit);
    }
}
