package com.rrm.parking.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ChiffreAffairesDashboardResponse(
        FiltresAppliques filtres,
        Synthese synthese,
        List<ChiffreAffairesMensuel> douzeDerniersMois,
        List<ChiffreAffairesParking> repartitionParParking
) {
    public record FiltresAppliques(
            LocalDate dateDebut,
            LocalDate dateFin,
            LocalDate dateDebutPrecedente,
            LocalDate dateFinPrecedente,
            Integer annee,
            Integer mois,
            Long parkingId,
            String typeAbonnement
    ) {
    }

    public record Synthese(
            BigDecimal caActuelHt,
            BigDecimal caPrecedentHt,
            BigDecimal evolutionPourcentage,
            BigDecimal caAnnuelHt,
            BigDecimal caRegulierHt,
            BigDecimal caCorporateHt,
            BigDecimal totalGeneralHt,
            BigDecimal partRegulierPourcentage,
            BigDecimal partCorporatePourcentage
    ) {
    }

    public record ChiffreAffairesMensuel(
            int annee,
            int mois,
            String libelle,
            LocalDate dateDebut,
            LocalDate dateFin,
            BigDecimal chiffreAffairesHt
    ) {
    }

    public record ChiffreAffairesParking(
            Long parkingId,
            String parkingNom,
            BigDecimal chiffreAffairesHt,
            BigDecimal partPourcentage
    ) {
    }
}
