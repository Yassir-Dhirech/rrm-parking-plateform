package com.rrm.parking.demande.service;

import tools.jackson.databind.ObjectMapper;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.dto.request.ModificationDemandeReguliereRequest;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.document.repository.PieceJointeRepository;
import com.rrm.parking.document.service.StockageDocumentService;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModificationDemandeAgentServiceTest {

    @Mock DemandeClientRepository demandeRepository;
    @Mock ClientParticulierRepository clientRepository;
    @Mock VehiculeRepository vehiculeRepository;
    @Mock TarifParkingRepository tarifRepository;
    @Mock PieceJointeRepository pieceRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock AuditLogRepository auditRepository;
    @Mock StockageDocumentService stockageDocumentService;
    @Mock ObjectMapper objectMapper;

    @InjectMocks ModificationDemandeAgentService service;

    @Test
    void refuseUneModificationApresLePaiement() {
        DemandeNouvelAbonnementRegulier demande =
                mock(DemandeNouvelAbonnementRegulier.class);
        when(demande.getStatut()).thenReturn(StatutDemande.PAYEE);
        when(demandeRepository.findByIdPourMiseAJour(42L))
                .thenReturn(Optional.of(demande));

        ModificationDemandeReguliereRequest requete =
                new ModificationDemandeReguliereRequest(
                        "Nom", "Prenom", "AB12345", "0612345678",
                        "client@example.ma", "12345|A|1",
                        "Marque", "Modele", "Noir",
                        TypeVehicule.VOITURE, 8L, ModePaiement.ESPECE
                );

        assertThatThrownBy(() -> service.modifier(42L, requete, Map.of(), 5L))
                .isInstanceOf(ConflitMetierException.class)
                .hasMessageContaining("attente de paiement");

        verifyNoInteractions(auditRepository, stockageDocumentService);
    }
}
