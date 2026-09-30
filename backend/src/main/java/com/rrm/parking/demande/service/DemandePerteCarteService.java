package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.entity.AffectationParking;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.demande.entity.DemandePerteCarte;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandePerteCarteRepository;
import com.rrm.parking.demande.service.otp.OtpGenere;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.parking.entity.Parking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandePerteCarteService {

    private final ClientParticulierRepository clientParticulierRepository;
    private final AbonnementRegulierRepository abonnementRegulierRepository;
    private final CarteAccesRepository carteRepository;
    private final DemandeClientRepository demandeClientRepository;
    private final DemandePerteCarteRepository perteRepository;
    private final OtpEmissionService otpEmissionService;
    private final OtpValidationService otpValidationService;

    public record InfoCartePerdueDto(
            String clientNom,
            String cin,
            String telephoneMasque,
            String numeroCarte,
            String parkingNom,
            String dateFinAbonnement
    ) {}

    @Transactional(readOnly = true)
    public InfoCartePerdueDto rechercherParCin(String cin) {
        if (cin == null || cin.trim().isEmpty()) {
            throw new IllegalArgumentException("Le CIN est obligatoire");
        }
        String cinTrim = cin.trim().toUpperCase(Locale.ROOT);

        ClientParticulier client = clientParticulierRepository.findByCinIgnoreCase(cinTrim)
                .orElseThrow(() -> new RessourceIntrouvableException("Aucun client trouvé avec le CIN : " + cinTrim));

        List<AbonnementRegulier> abonnements = abonnementRegulierRepository.findAllByClientIdOrderByDateCreationDesc(client.getId());
        AbonnementRegulier abonnement = abonnements.stream()
                .filter(a -> a.getStatut() == StatutAbonnement.ACTIF)
                .findFirst()
                .orElseThrow(() -> new ConflitMetierException("Aucun abonnement actif trouvé pour ce client."));

        CarteAcces carte = carteRepository.findByAbonnementIdAndStatut(abonnement.getId(), StatutCarteAcces.ACTIVE)
                .orElseThrow(() -> new RessourceIntrouvableException("Aucune carte active trouvée pour cet abonnement."));

        AffectationParking aff = abonnement.getAffectationsParking().stream()
                .max(Comparator.comparing(AffectationParking::getDateDebut))
                .orElseThrow(() -> new ConflitMetierException("Aucune affectation parking trouvée."));

        String dateFin = abonnement.getPeriodes().stream()
                .max(Comparator.comparing(PeriodeAbonnement::getNumero))
                .map(p -> p.getDateFin().toString())
                .orElse("—");

        String tel = client.getTelephone();
        String telMasque = (tel != null && tel.length() > 6)
                ? tel.substring(0, 3) + "****" + tel.substring(tel.length() - 2)
                : "06******00";

        return new InfoCartePerdueDto(
                client.getNomComplet(),
                client.getCin(),
                telMasque,
                carte.getNumeroCarte(),
                aff.getParking().getNom(),
                dateFin
        );
    }

    @Transactional
    public DemandeAbonnementRegulierResponse declarerPerteEtEnvoyerOtp(String cin, ModePaiement modePaiement) {
        String cinTrim = cin.trim().toUpperCase(Locale.ROOT);

        ClientParticulier client = clientParticulierRepository.findByCinIgnoreCase(cinTrim)
                .orElseThrow(() -> new RessourceIntrouvableException("Client introuvable"));

        AbonnementRegulier abonnement = abonnementRegulierRepository.findAllByClientIdOrderByDateCreationDesc(client.getId())
                .stream()
                .filter(a -> a.getStatut() == StatutAbonnement.ACTIF)
                .findFirst()
                .orElseThrow(() -> new ConflitMetierException("Aucun abonnement actif trouvé"));

        CarteAcces carte = carteRepository.findByAbonnementIdAndStatut(abonnement.getId(), StatutCarteAcces.ACTIVE)
                .orElseThrow(() -> new RessourceIntrouvableException("Carte active introuvable"));

        AffectationParking aff = abonnement.getAffectationsParking().stream()
                .max(Comparator.comparing(AffectationParking::getDateDebut))
                .orElseThrow(() -> new ConflitMetierException("Aucune affectation parking trouvée"));
        Parking parking = aff.getParking();

        String ref = "DEM-PER-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);

        DemandePerteCarte demande = new DemandePerteCarte(
                ref,
                CanalInitiation.EN_LIGNE,
                client,
                abonnement,
                carte,
                parking,
                modePaiement != null ? modePaiement : ModePaiement.ESPECE
        );

        demande.soumettre();
        demandeClientRepository.saveAndFlush(demande);

        OtpGenere otp = otpEmissionService.emettre(
                demande,
                CanalOtp.SMS,
                client.getTelephone()
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
    public ValidationOtpResponse validerOtpEtSuspendreCarte(String reference, String codeOtp) {
        DemandePerteCarte demande = perteRepository.findByReference(reference)
                .orElseThrow(() -> new RessourceIntrouvableException("Demande introuvable : " + reference));

        // 1. Valider l'OTP via le service standard (ce qui passe la demande en EN_ATTENTE_PAIEMENT automatiquement)
        ValidationOtpRequest req = new ValidationOtpRequest(codeOtp);
        ValidationOtpResponse resp = otpValidationService.valider(reference, req);

        // 2. Mettre en opposition la carte perdue en base
        CarteAcces carte = demande.getCartePerdue();
        if (carte != null && carte.getStatut() == StatutCarteAcces.ACTIVE) {
            carte.suspendre("Carte déclarée perdue par l'abonné");
            carteRepository.save(carte);
        }

        return resp;
    }
}
