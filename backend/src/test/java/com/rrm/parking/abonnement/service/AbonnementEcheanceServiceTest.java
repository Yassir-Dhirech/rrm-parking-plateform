package com.rrm.parking.abonnement.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.enums.StatutPeriodeAbonnement;
import com.rrm.parking.abonnement.repository.PeriodeAbonnementRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.repository.NotificationRepository;
import com.rrm.parking.notification.service.EmailEnvoiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AbonnementEcheanceServiceTest {

    private PeriodeAbonnementRepository periodeRepository;
    private CarteAccesRepository carteRepository;
    private NotificationRepository notificationRepository;
    private AbonnementEcheanceService service;

    @BeforeEach
    void setUp() {
        periodeRepository = mock(PeriodeAbonnementRepository.class);
        carteRepository = mock(CarteAccesRepository.class);
        notificationRepository = mock(NotificationRepository.class);
        @SuppressWarnings("unchecked")
        ObjectProvider<EmailEnvoiService> emailProvider = mock(ObjectProvider.class);
        when(emailProvider.getIfAvailable()).thenReturn(null);
        service = new AbonnementEcheanceService(
                periodeRepository,
                carteRepository,
                notificationRepository,
                emailProvider
        );
        ReflectionTestUtils.setField(
                service,
                "renewalUrl",
                "http://localhost:5173/demande-publique?tab=RENEW"
        );
    }

    @Test
    void expireAbonnementEtCarteLeLendemainSansRenouvellement() {
        LocalDate dateTraitement = LocalDate.of(2026, 10, 1);
        Donnees donnees = donneesActives(
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 9, 30)
        );
        CarteAcces carte = mock(CarteAcces.class);
        when(carte.getStatut()).thenReturn(StatutCarteAcces.ACTIVE);

        when(periodeRepository.findByStatutAndDateFin(any(), any()))
                .thenReturn(List.of());
        when(periodeRepository.findByStatutAndDateFinBefore(
                StatutPeriodeAbonnement.ACTIVE, dateTraitement))
                .thenReturn(List.of(donnees.periode()));
        when(periodeRepository.findByAbonnementIdAndStatut(
                any(), eq(StatutPeriodeAbonnement.PLANIFIEE)))
                .thenReturn(Optional.empty());
        when(carteRepository.findByAbonnementId(any()))
                .thenReturn(List.of(carte));
        when(notificationRepository
                .findByReferenceMetierAndTypeNotification(any(), any()))
                .thenReturn(Optional.empty());
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.traiterEcheances(dateTraitement);

        assertThat(donnees.periode().getStatut())
                .isEqualTo(StatutPeriodeAbonnement.EXPIREE);
        assertThat(donnees.abonnement().getStatut())
                .isEqualTo(StatutAbonnement.EXPIRE);
        verify(carte).expirer();
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void activePeriodeSuivanteSansExpirerAbonnementNiCarte() {
        LocalDate dateTraitement = LocalDate.of(2026, 10, 1);
        Donnees donnees = donneesActives(
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 9, 30)
        );
        PeriodeAbonnement suivante = new PeriodeAbonnement(
                2,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 12, 31),
                new BigDecimal("900.00"),
                new BigDecimal("20.00"),
                donnees.abonnement()
        );
        donnees.abonnement().ajouterPeriode(suivante);

        when(periodeRepository.findByStatutAndDateFin(any(), any()))
                .thenReturn(List.of());
        when(periodeRepository.findByStatutAndDateFinBefore(
                StatutPeriodeAbonnement.ACTIVE, dateTraitement))
                .thenReturn(List.of(donnees.periode()));
        when(periodeRepository.findByAbonnementIdAndStatut(
                any(), eq(StatutPeriodeAbonnement.PLANIFIEE)))
                .thenReturn(Optional.of(suivante));

        service.traiterEcheances(dateTraitement);

        assertThat(donnees.periode().getStatut())
                .isEqualTo(StatutPeriodeAbonnement.EXPIREE);
        assertThat(suivante.getStatut())
                .isEqualTo(StatutPeriodeAbonnement.ACTIVE);
        assertThat(donnees.abonnement().getStatut())
                .isEqualTo(StatutAbonnement.ACTIF);
        verifyNoInteractions(carteRepository);
        verify(notificationRepository, never()).save(any());
    }

    private Donnees donneesActives(LocalDate debut, LocalDate fin) {
        ClientParticulier client = new ClientParticulier(
                "Client", "Test", "CIN123"
        );
        client.setEmail("client@example.com");
        AbonnementRegulier abonnement = new AbonnementRegulier(
                "ABO-TEST-001", client
        );
        PeriodeAbonnement periode = new PeriodeAbonnement(
                1, debut, fin,
                new BigDecimal("900.00"),
                new BigDecimal("20.00"),
                abonnement
        );
        abonnement.ajouterPeriode(periode);
        periode.activer();
        abonnement.activer();
        return new Donnees(abonnement, periode);
    }

    private record Donnees(
            AbonnementRegulier abonnement,
            PeriodeAbonnement periode
    ) {
    }
}
