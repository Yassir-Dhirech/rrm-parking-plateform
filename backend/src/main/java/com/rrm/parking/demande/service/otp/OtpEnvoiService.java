package com.rrm.parking.demande.service.otp;

import com.rrm.parking.demande.enums.CanalOtp;

public interface OtpEnvoiService {

    void envoyer(
            CanalOtp canal,
            String destination,
            String code
    );
}