package com.rrm.parking.dashboard.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChiffreAffairesProrataTest {

    private static final List<Cas> ECHANTILLON_BADR = List.of(
            cas("2026-03-19", "2026-06-18", "1375.0"),
            cas("2026-03-19", "2026-06-18", "1625.0"),
            cas("2026-03-19", "2026-06-18", "1375.0"),
            cas("2026-04-13", "2026-07-12", "1375.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-03-30", "2026-06-29", "1250.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-04-01", "2026-06-30", "1250.0"),
            cas("2026-04-03", "2026-07-02", "1250.0"),
            cas("2026-04-03", "2026-07-02", "1250.0"),
            cas("2026-04-06", "2026-07-05", "1375.0"),
            cas("2026-04-08", "2026-07-07", "2500.0"),
            cas("2026-04-08", "2026-07-07", "1250.0"),
            cas("2026-04-09", "2026-07-08", "1625.0"),
            cas("2026-04-19", "2026-07-18", "1625.0"),
            cas("2026-04-23", "2026-07-22", "1250.0"),
            cas("2026-04-27", "2026-07-26", "1625.0"),
            cas("2026-04-28", "2026-07-27", "2500.0"),
            cas("2026-04-28", "2026-07-27", "2500.0"),
            cas("2026-04-28", "2026-07-27", "2500.0"),
            cas("2026-04-01", "2043-08-02", "281755.64681724843"),
            cas("2026-04-22", "2044-10-16", "540794.661190965"),
            cas("2026-04-23", "2043-10-02", "261683.778234086"),
            cas("2026-04-28", "2026-07-27", "1625.0"),
            cas("2026-05-07", "2026-08-06", "1250.0"),
            cas("2026-05-07", "2026-08-06", "1625.0"),
            cas("2026-05-19", "2026-08-18", "1625.0"),
            cas("2026-05-21", "2026-08-20", "2500.0"),
            cas("2026-06-01", "2026-08-31", "2500.0"),
            cas("2026-05-25", "2046-05-24", "200000.0"),
            cas("2026-05-15", "2046-05-14", "400000.0"),
            cas("2026-06-01", "2026-08-31", "1625.0")
    );

    @Test
    void doitReproduireLesTotauxMensuelsDeLEchantillonBadr() {
        assertEquals(
                new BigDecimal("645.38"),
                total("2026-03-01", "2026-03-31")
        );
        assertEquals(
                new BigDecimal("10146.79"),
                total("2026-04-01", "2026-04-30")
        );
        assertEquals(
                new BigDecimal("19544.55"),
                total("2026-05-01", "2026-05-30")
        );
        assertEquals(
                new BigDecimal("20278.46"),
                total("2026-05-01", "2026-05-31")
        );
    }

    @Test
    void doitCompterLesBornesDeDatesCommeInclusives() {
        BigDecimal resultat = ChiffreAffairesProrata.calculer(
                new BigDecimal("1250.00"),
                LocalDate.parse("2026-04-01"),
                LocalDate.parse("2026-06-30"),
                LocalDate.parse("2026-05-01"),
                LocalDate.parse("2026-05-30")
        );

        assertEquals(
                new BigDecimal("412.09"),
                resultat.setScale(2, RoundingMode.HALF_UP)
        );
    }

    @Test
    void doitRetournerZeroQuandLaPeriodeNeRecouvrePasLaFenetre() {
        BigDecimal resultat = ChiffreAffairesProrata.calculer(
                new BigDecimal("2500.00"),
                LocalDate.parse("2026-06-01"),
                LocalDate.parse("2026-08-31"),
                LocalDate.parse("2026-05-01"),
                LocalDate.parse("2026-05-31")
        );

        assertEquals(BigDecimal.ZERO, resultat);
    }

    private BigDecimal total(String debut, String fin) {
        LocalDate dateDebut = LocalDate.parse(debut);
        LocalDate dateFin = LocalDate.parse(fin);

        return ECHANTILLON_BADR.stream()
                .map(cas -> ChiffreAffairesProrata.calculer(
                        cas.montantHt(),
                        cas.dateDebut(),
                        cas.dateFin(),
                        dateDebut,
                        dateFin
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static Cas cas(
            String dateDebut,
            String dateFin,
            String montantHt
    ) {
        return new Cas(
                LocalDate.parse(dateDebut),
                LocalDate.parse(dateFin),
                new BigDecimal(montantHt)
        );
    }

    private record Cas(
            LocalDate dateDebut,
            LocalDate dateFin,
            BigDecimal montantHt
    ) {
    }
}
