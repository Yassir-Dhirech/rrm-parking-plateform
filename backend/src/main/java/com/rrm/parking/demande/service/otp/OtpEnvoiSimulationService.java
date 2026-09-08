package com.rrm.parking.demande.service.otp;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.rrm.parking.demande.enums.CanalOtp;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;



@Slf4j
@Service
@Profile("!prod")
@ConditionalOnProperty(
        prefix = "app.otp",
        name = "provider",
        havingValue = "simulation",
        matchIfMissing = true
)
public class OtpEnvoiSimulationService
        implements OtpEnvoiService {

    @Override
    public void envoyer(
            CanalOtp canal,
            String destination,
            String code
    ) {
        log.warn(
                "SIMULATION OTP - canal={}, destination={}, code={}",
                canal,
                masquerDestination(destination),
                code
        );
    }

    private String masquerDestination(
            String destination
    ) {
        if (destination == null
                || destination.length() <= 4) {
            return "****";
        }

        return destination.substring(0, 2)
                + "*".repeat(destination.length() - 4)
                + destination.substring(
                destination.length() - 2
        );
    }
}