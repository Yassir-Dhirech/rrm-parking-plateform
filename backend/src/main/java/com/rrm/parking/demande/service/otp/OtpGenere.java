package com.rrm.parking.demande.service.otp;

import com.rrm.parking.demande.enums.CanalOtp;

import java.time.LocalDateTime;

public record OtpGenere(
        CanalOtp canal,
        LocalDateTime dateExpiration,
        int tentativesRestantes,
        String destinationMasquee
) {
}