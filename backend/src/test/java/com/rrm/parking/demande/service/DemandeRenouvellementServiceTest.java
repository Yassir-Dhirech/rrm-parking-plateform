package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import com.rrm.parking.abonnement.repository.PeriodeAbonnementRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.demande.dto.request.DemandeRenouvellementRequest;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandeRenouvellementRegulierRepository;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandeRenouvellementServiceTest {

    @Mock private CarteAccesRepository carteAccesRepository;
    @Mock private PeriodeAbonnementRepository periodeAbonnementRepository;
    @Mock private TarifParkingRepository tarifParkingRepository;
    @Mock private DemandeClientRepository demandeClientRepository;
    @Mock private DemandeRenouvellementRegulierRepository renouvellementRepository;
    @Mock private OtpEmissionService otpEmissionService;

    private DemandeRenouvellementService service;

    @BeforeEach
    void initialiser() {
        service = new DemandeRenouvellementService(
                carteAccesRepository,
                periodeAbonnementRepository,
                tarifParkingRepository,
                demandeClientRepository,
                renouvellementRepository,
                otpEmissionService
        );
    }

    @Test
    void doitRefuserUneNouvelleDemandeSiUnePeriodeEstDejaPlanifiee() {
        Long abonnementId = 12L;
        CarteAcces carte = org.mockito.Mockito.mock(CarteAcces.class);
        AbonnementRegulier abonnement =
                org.mockito.Mockito.mock(AbonnementRegulier.class);
        ClientParticulier client =
                org.mockito.Mockito.mock(ClientParticulier.class);
        PeriodeAbonnement periode =
                org.mockito.Mockito.mock(PeriodeAbonnement.class);
        AffectationParking affectation =
                org.mockito.Mockito.mock(AffectationParking.class);

        when(carteAccesRepository.findByNumeroCarteIgnoreCase("900001"))
                .thenReturn(Optional.of(carte));
        when(carte.getAbonnement()).thenReturn(abonnement);
        when(carte.getStatut()).thenReturn(StatutCarteAcces.ACTIVE);
        when(abonnement.getId()).thenReturn(abonnementId);
        when(abonnement.getClient()).thenReturn(client);
        when(abonnement.peutEtreRenouvele()).thenReturn(true);
        when(abonnement.getPeriodes()).thenReturn(List.of(periode));
        when(abonnement.getAffectationsParking())
                .thenReturn(List.of(affectation));
        when(client.getCin()).thenReturn("AB12345");
        when(renouvellementRepository
                .existsByAbonnementConcerneIdAndStatutIn(
                        org.mockito.ArgumentMatchers.eq(abonnementId),
                        anyCollection()
                )).thenReturn(false);
        when(periodeAbonnementRepository.existsByAbonnementIdAndStatut(
                abonnementId,
                StatutPeriodeAbonnement.PLANIFIEE
        )).thenReturn(true);

        DemandeRenouvellementRequest requete =
                new DemandeRenouvellementRequest(
                        "900001",
                        "AB12345",
                        25L,
                        ModePaiement.ESPECE,
                        CanalOtp.EMAIL,
                        true
                );

        ConflitMetierException exception = assertThrows(
                ConflitMetierException.class,
                () -> service.creer(requete)
        );

        assertEquals(
                "Un renouvellement est déjà programmé pour cet abonnement. "
                        + "Vous pourrez effectuer un nouveau renouvellement "
                        + "après le début de la prochaine période",
                exception.getMessage()
        );
        verify(tarifParkingRepository, never()).findById(25L);
        verify(demandeClientRepository, never()).saveAndFlush(
                org.mockito.ArgumentMatchers.any()
        );
    }
}
