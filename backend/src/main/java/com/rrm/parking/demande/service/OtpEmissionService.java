package com.rrm.parking.demande.service;

import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.VerificationOtp;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.repository.VerificationOtpRepository;
import com.rrm.parking.demande.service.otp.OtpEnvoiService;
import com.rrm.parking.demande.service.otp.OtpGenere;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OtpEmissionService {

    private static final long DUREE_VALIDITE_MINUTES = 10;
    private static final int NOMBRE_TENTATIVES = 3;

    private final OtpCodeService otpCodeService;

    private final OtpEnvoiService otpEnvoiService;

    private final VerificationOtpRepository
            verificationOtpRepository;

    @Transactional
    public OtpGenere emettre(
            DemandeClient demande,
            CanalOtp canal,
            String destination
    ) {
        Objects.requireNonNull(
                demande,
                "La demande est obligatoire"
        );

        verifierCanalPublic(canal);
        verifierDestination(destination);

        String code = otpCodeService.genererCode();
        String codeHash =
                otpCodeService.hacherCode(code);

        LocalDateTime dateExpiration =
                LocalDateTime.now().plusMinutes(
                        DUREE_VALIDITE_MINUTES
                );

        VerificationOtp verificationOtp =
                new VerificationOtp(
                        codeHash,
                        canal,
                        dateExpiration,
                        demande
                );

        demande.ajouterVerificationOtp(
                verificationOtp
        );

        verificationOtpRepository.save(
                verificationOtp
        );

        otpEnvoiService.envoyer(
                canal,
                destination,
                code
        );

        return new OtpGenere(
                canal,
                dateExpiration,
                NOMBRE_TENTATIVES,
                masquerDestination(destination)
        );
    }

    private void verifierCanalPublic(
            CanalOtp canal
    ) {
        if (canal != CanalOtp.SMS
                && canal != CanalOtp.WHATSAPP) {
            throw new IllegalArgumentException(
                    "Le canal OTP public doit être SMS ou WHATSAPP"
            );
        }
    }

    private void verifierDestination(
            String destination
    ) {
        if (destination == null
                || destination.isBlank()) {
            throw new IllegalArgumentException(
                    "Le numéro de téléphone destinataire est obligatoire"
            );
        }
    }

    private String masquerDestination(
            String destination
    ) {
        String valeur = destination.trim();

        if (valeur.length() <= 4) {
            return "****";
        }

        return valeur.substring(0, 2)
                + "*".repeat(valeur.length() - 4)
                + valeur.substring(
                valeur.length() - 2
        );
    }
}