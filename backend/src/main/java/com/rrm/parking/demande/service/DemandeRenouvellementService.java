package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.Abonnement;
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
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.DemandeRenouvellementRequest;
import com.rrm.parking.demande.dto.request.RechercheRenouvellementRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.dto.response.RenouvellementConsultationResponse;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.entity.VerificationOtp;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandeRenouvellementRegulierRepository;
import com.rrm.parking.demande.service.otp.OtpGenere;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeRenouvellementService {

    private static final List<StatutDemande> STATUTS_OUVERTS = List.of(
            StatutDemande.SOUMISE,
            StatutDemande.EN_ATTENTE_PAIEMENT,
            StatutDemande.PAYEE,
            StatutDemande.EN_ATTENTE_CORRECTION
    );

    private final CarteAccesRepository carteAccesRepository;
    private final PeriodeAbonnementRepository periodeAbonnementRepository;
    private final TarifParkingRepository tarifParkingRepository;
    private final DemandeClientRepository demandeClientRepository;
    private final DemandeRenouvellementRegulierRepository renouvellementRepository;
    private final OtpEmissionService otpEmissionService;

    @Transactional(readOnly = true)
    public RenouvellementConsultationResponse rechercher(
            RechercheRenouvellementRequest requete
    ) {
        Contexte contexte = chargerContexte(requete.numeroCarte(), requete.cin());
        verifierAbsenceDemandeOuverte(contexte.abonnement().getId());
        PeriodeAbonnement dernierePeriode = dernierePeriode(contexte.abonnement());
        AffectationParking affectation = derniereAffectation(contexte.abonnement());

        return new RenouvellementConsultationResponse(
                contexte.abonnement().getId(),
                contexte.abonnement().getReference(),
                contexte.abonnement().getStatut(),
                contexte.carte().getNumeroCarte(),
                contexte.carte().getStatut(),
                contexte.client().getNomComplet(),
                affectation.getParking().getId(),
                affectation.getParking().getNom(),
                dernierePeriode.getDateFin()
        );
    }

    @Transactional
    public DemandeAbonnementRegulierResponse creer(
            DemandeRenouvellementRequest requete
    ) {
        if (!requete.conditionsAcceptees()) {
            throw new IllegalArgumentException(
                    "Les conditions gÃ©nÃ©rales doivent Ãªtre acceptÃ©es"
            );
        }

        Contexte contexte = chargerContexte(requete.numeroCarte(), requete.cin());
        verifierAbsenceDemandeOuverte(contexte.abonnement().getId());
        TarifParking tarif = chargerTarifApplicable(requete.tarifParkingId());

        DemandeRenouvellementRegulier demande =
                new DemandeRenouvellementRegulier(
                        genererReferenceDemande(),
                        CanalInitiation.EN_LIGNE,
                        contexte.client(),
                        null,
                        contexte.abonnement(),
                        tarif
                );

        demande.choisirModePaiement(requete.modePaiement());
        demande.soumettre();
        demandeClientRepository.saveAndFlush(demande);

        String destination = switch (requete.canalOtp()) {
            case EMAIL -> contexte.client().getEmail();
            case SMS -> contexte.client().getTelephone();
            default -> throw new IllegalArgumentException(
                    "Le canal OTP doit Ãªtre EMAIL ou SMS"
            );
        };

        OtpGenere otp = otpEmissionService.emettre(
                demande,
                requete.canalOtp(),
                destination
        );

        return new DemandeAbonnementRegulierResponse(
                demande.getReference(),
                demande.getStatut(),
                demande.getDateSoumission(),
                otp.dateExpiration(),
                otp.tentativesRestantes(),
                otp.canal(),
                otp.destinationMasquee()
        );
    }

    @Transactional
    public DemandeAbonnementRegulierResponse renvoyerOtp(
            String reference
    ) {
        DemandeRenouvellementRegulier demande = renouvellementRepository
                .findByReference(reference.trim())
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande de renouvellement introuvable"
                ));

        if (demande.getStatut() != StatutDemande.SOUMISE) {
            throw new ConflitMetierException(
                    "L'OTP ne peut être renvoyé que pour une demande soumise"
            );
        }

        VerificationOtp derniereVerification = demande.getVerificationsOtp()
                .stream()
                .max(Comparator.comparing(VerificationOtp::getDateCreation))
                .orElseThrow(() -> new ConflitMetierException(
                        "Aucun OTP initial n'a été émis pour cette demande"
                ));

        if (derniereVerification.getDateCreation()
                .plusSeconds(60)
                .isAfter(LocalDateTime.now())) {
            throw new ConflitMetierException(
                    "Veuillez patienter 60 secondes avant de renvoyer l'OTP"
            );
        }

        ClientParticulier client = (ClientParticulier) Hibernate.unproxy(
                demande.getClient()
        );
        String destination = switch (derniereVerification.getCanal()) {
            case EMAIL -> client.getEmail();
            case SMS -> client.getTelephone();
            default -> throw new ConflitMetierException(
                    "Le canal OTP de la demande n'est pas pris en charge"
            );
        };

        OtpGenere otp = otpEmissionService.emettre(
                demande,
                derniereVerification.getCanal(),
                destination
        );

        return new DemandeAbonnementRegulierResponse(
                demande.getReference(), demande.getStatut(),
                demande.getDateSoumission(), otp.dateExpiration(),
                otp.tentativesRestantes(), otp.canal(),
                otp.destinationMasquee()
        );
    }

    private Contexte chargerContexte(String numeroCarte, String cin) {
        CarteAcces carte = carteAccesRepository
                .findByNumeroCarteIgnoreCase(numeroCarte.trim())
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Aucun abonnement renouvelable ne correspond aux informations fournies"
                ));

        Abonnement abonnementReel = (Abonnement) Hibernate.unproxy(carte.getAbonnement());
        if (!(abonnementReel instanceof AbonnementRegulier abonnement)) {
            throw new ConflitMetierException(
                    "Seul un abonnement rÃ©gulier peut Ãªtre renouvelÃ© en ligne"
            );
        }

        ClientParticulier client = abonnement.getClient();
        String cinNormalise = cin.trim().toUpperCase(Locale.ROOT);
        if (!client.getCin().equalsIgnoreCase(cinNormalise)) {
            throw new RessourceIntrouvableException(
                    "Aucun abonnement renouvelable ne correspond aux informations fournies"
            );
        }

        if (!abonnement.peutEtreRenouvele()) {
            throw new ConflitMetierException(
                    "L'abonnement ne peut pas Ãªtre renouvelÃ© dans son Ã©tat actuel"
            );
        }

        if (carte.getStatut() != StatutCarteAcces.ACTIVE
                && carte.getStatut() != StatutCarteAcces.EXPIREE) {
            throw new ConflitMetierException(
                    "La carte ne peut pas Ãªtre utilisÃ©e pour un renouvellement"
            );
        }

        dernierePeriode(abonnement);
        derniereAffectation(abonnement);
        return new Contexte(carte, abonnement, client);
    }

    private TarifParking chargerTarifApplicable(Long tarifId) {
        TarifParking tarif = tarifParkingRepository.findById(tarifId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Tarif parking introuvable"
                ));
        if (!tarif.estApplicableA(LocalDate.now())) {
            throw new ConflitMetierException(
                    "Le tarif sÃ©lectionnÃ© n'est plus applicable"
            );
        }
        return tarif;
    }

    private void verifierAbsenceDemandeOuverte(Long abonnementId) {
        if (renouvellementRepository
                .existsByAbonnementConcerneIdAndStatutIn(
                        abonnementId,
                        STATUTS_OUVERTS
                )) {
            throw new ConflitMetierException(
                    "Une demande de renouvellement est dÃ©jÃ  en cours pour cet abonnement"
            );
        }

        if (periodeAbonnementRepository.existsByAbonnementIdAndStatut(
                abonnementId,
                StatutPeriodeAbonnement.PLANIFIEE
        )) {
            throw new ConflitMetierException(
                    "Un renouvellement est déjà programmé pour cet abonnement. "
                            + "Vous pourrez effectuer un nouveau renouvellement "
                            + "après le début de la prochaine période"
            );
        }
    }

    private PeriodeAbonnement dernierePeriode(AbonnementRegulier abonnement) {
        return abonnement.getPeriodes().stream()
                .max(Comparator.comparing(PeriodeAbonnement::getNumero))
                .orElseThrow(() -> new ConflitMetierException(
                        "L'abonnement ne possÃ¨de aucune pÃ©riode"
                ));
    }

    private AffectationParking derniereAffectation(AbonnementRegulier abonnement) {
        return abonnement.getAffectationsParking().stream()
                .max(Comparator.comparing(AffectationParking::getDateDebut))
                .orElseThrow(() -> new ConflitMetierException(
                        "L'abonnement ne possÃ¨de aucune affectation parking"
                ));
    }

    private String genererReferenceDemande() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String reference;
        do {
            reference = "DEM-REN-" + date + "-"
                    + UUID.randomUUID().toString().substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (demandeClientRepository.existsByReference(reference));
        return reference;
    }

    private record Contexte(
            CarteAcces carte,
            AbonnementRegulier abonnement,
            ClientParticulier client
    ) {
    }
}
