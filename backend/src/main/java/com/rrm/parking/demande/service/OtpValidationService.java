package com.rrm.parking.demande.service;

import com.rrm.parking.common.exception.OtpExpireException;
import com.rrm.parking.common.exception.OtpInvalideException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.event.RenouvellementOtpValideEvent;
import com.rrm.parking.demande.event.DemandeOtpValideeEvent;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
import org.springframework.context.ApplicationEventPublisher;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.VerificationOtp;
import com.rrm.parking.demande.enums.StatutOtp;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.VerificationOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OtpValidationService {

    private final DemandeClientRepository
            demandeClientRepository;

    private final ClientParticulierRepository
            clientParticulierRepository;

    private final VerificationOtpRepository
            verificationOtpRepository;

    private final OtpCodeService otpCodeService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(
            noRollbackFor = {
                    OtpInvalideException.class,
                    OtpExpireException.class
            }
    )
    public ValidationOtpResponse valider(
            String reference,
            ValidationOtpRequest request
    ) {
        DemandeClient demande =
                demandeClientRepository
                        .findByReference(reference)
                        .orElseThrow(() ->
                                new RessourceIntrouvableException(
                                        "Demande introuvable : "
                                                + reference
                                )
                        );

        VerificationOtp verification =
                verificationOtpRepository
                        .findFirstByDemandeIdAndStatutOrderByDateCreationDesc(
                                demande.getId(),
                                StatutOtp.EN_ATTENTE
                        )
                        .orElseThrow(() ->
                                new OtpInvalideException(
                                        "Aucun code OTP actif pour cette demande",
                                        0
                                )
                        );

        if (verification.estExpire()) {
            verification.marquerExpire();

            verificationOtpRepository.save(
                    verification
            );

            throw new OtpExpireException(
                    "Le code OTP a expiré"
            );
        }

        boolean codeCorrect =
                otpCodeService.correspond(
                        request.code(),
                        verification.getCodeHash()
                );

        if (!codeCorrect) {
            verification.enregistrerEchec();

            verificationOtpRepository.save(
                    verification
            );

            int tentativesRestantes =
                    verification.getTentativesRestantes();

            if (tentativesRestantes == 0) {
                throw new OtpInvalideException(
                        "Code OTP incorrect. La vérification est bloquée",
                        0
                );
            }

            throw new OtpInvalideException(
                    "Code OTP incorrect. Tentatives restantes : "
                            + tentativesRestantes,
                    tentativesRestantes
            );
        }

        verification.marquerValide();
        demande.confirmerOtp();

        verificationOtpRepository.save(
                verification
        );

        demandeClientRepository.save(
                demande
        );

        publierEvenementConfirmation(demande);

        return new ValidationOtpResponse(
                demande.getReference(),
                true,
                demande.getStatut(),
                verification.getTentativesRestantes(),
                verification.getDateValidation(),
                "Code OTP validé avec succès"
        );
    }
    private void publierEvenementConfirmation(
            DemandeClient demande
    ) {
        ClientParticulier client = clientParticulierRepository
                .findById(demande.getClient().getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Le client particulier de la demande est introuvable"
                ));

        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            TarifParking tarif = nouvelle.getTarifParking();
            DecompteNouvelAbonnement decompte =
                    DecompteNouvelAbonnement.depuis(tarif);

            eventPublisher.publishEvent(
                    new DemandeOtpValideeEvent(
                            client.getEmail(),
                            client.getNomComplet(),
                            demande.getReference(),
                            tarif.getParking().getNom(),
                            tarif.getParking().getAdresse(),
                            tarif.getForfait().getLibelle(),
                            tarif.getDureeEnMois(),
                            decompte.montantAbonnementTTC(),
                            decompte.fraisCarteTTC(),
                            decompte.montantTotalTTC(),
                            nouvelle.getModePaiementSouhaite().name(),
                            demande.getDateValidationOtp().toLocalDate().plusDays(7)
                    )
            );
            return;
        }

        if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            TarifParking tarif = renouvellement.getTarifParking();
            eventPublisher.publishEvent(
                    new RenouvellementOtpValideEvent(
                            client.getEmail(),
                            client.getNomComplet(),
                            demande.getReference(),
                            renouvellement.getAbonnementConcerne().getReference(),
                            tarif.getParking().getNom(),
                            tarif.getForfait().getLibelle(),
                            tarif.getDureeEnMois(),
                            tarif.calculerMontantTotalTTC(),
                            renouvellement.getModePaiementSouhaite().name(),
                            demande.getDateValidationOtp().toLocalDate().plusDays(7)
                    )
            );
            return;
        }

        throw new IllegalStateException(
                "Ce type de demande n'est pas pris en charge pour la confirmation OTP"
        );
    }
}