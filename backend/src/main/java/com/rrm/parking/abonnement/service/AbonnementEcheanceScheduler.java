package com.rrm.parking.abonnement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
public class AbonnementEcheanceScheduler {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private final AbonnementEcheanceService service;

    @Scheduled(
            cron = "${app.abonnement.expiration.cron:0 0 0 * * *}",
            zone = "Africa/Casablanca"
    )
    public void executer() {
        service.traiterEcheances(LocalDate.now(ZONE_RRM));
    }
}
