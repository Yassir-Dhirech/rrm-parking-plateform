package com.rrm.parking.demande.service;

import com.rrm.parking.common.exception.OtpExpireException;
import com.rrm.parking.common.exception.OtpInvalideException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.ValidationOtpRequest;
import com.rrm.parking.demande.dto.response.ValidationOtpResponse;
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

    private final VerificationOtpRepository
            verificationOtpRepository;

    private final OtpCodeService otpCodeService;

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

        return new ValidationOtpResponse(
                demande.getReference(),
                true,
                demande.getStatut(),
                verification.getTentativesRestantes(),
                verification.getDateValidation(),
                "Code OTP validé avec succès"
        );
    }
}