package com.rrm.parking.carte.config;

import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RemiseCarteDataInitializer implements ApplicationRunner {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private final DemandeOperationnelleRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        repository.findByTypeOperationAndStatutInOrderByDateCreationAsc(
                        TypeOperationCarte.ACTIVATION,
                        List.of(StatutDemandeOperationnelle.TERMINEE)
                )
                .stream()
                .filter(activation -> !repository
                        .existsByCarteAccesIdAndTypeOperation(
                                activation.getCarteAcces().getId(),
                                TypeOperationCarte.REMISE
                        ))
                .forEach(this::creerDemandeRemise);
    }

    private void creerDemandeRemise(DemandeOperationnelle activation) {
        var createur = activation.getExecuteePar() != null
                ? activation.getExecuteePar()
                : activation.getCreeePar();
        DemandeOperationnelle remise = new DemandeOperationnelle(
                genererReference(),
                activation.getCarteAcces(),
                TypeOperationCarte.REMISE,
                "Remise de la carte d'accès au client",
                createur
        );
        remise.definirDemandeDeclencheuse(activation);
        repository.save(remise);
    }

    private String genererReference() {
        String reference;
        String date = LocalDate.now(ZONE_RRM)
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        do {
            reference = "REM-" + date + "-"
                    + UUID.randomUUID().toString().substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (repository.existsByReference(reference));
        return reference;
    }
}
