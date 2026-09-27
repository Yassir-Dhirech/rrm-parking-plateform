package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class AnalyseCaResponse {
    private AnalyseCaResponse() {}

    public record Parking(Long id, String nom) {}

    public record MontantParking(Long parkingId, BigDecimal montantHt) {}

    public record Periode(LocalDate dateDebut, LocalDate dateFin,
                          BigDecimal totalHt, List<Parking> parkings,
                          List<MontantParking> montants) {}

    public record Mois(int numero, String libelle, boolean aVenir,
                       BigDecimal totalHt, List<MontantParking> montants) {}

    public record Annee(int annee, List<Parking> parkings, List<Mois> mois) {}
}
