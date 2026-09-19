package com.rrm.parking.facturation.dto.response;

import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;

import java.math.BigDecimal;

public record FactureLigneResponse(
        Long id,
        TypeLigneFacture typeLigne,
        String description,
        Integer quantite,
        BigDecimal prixUnitaireHt,
        BigDecimal tauxTva,
        BigDecimal montantHt,
        BigDecimal montantTva,
        BigDecimal montantTtc
) {

    public static FactureLigneResponse depuis(LigneFacture ligne) {
        return new FactureLigneResponse(
                ligne.getId(),
                ligne.getTypeLigne(),
                ligne.getDescription(),
                ligne.getQuantite(),
                ligne.getPrixUnitaireHt(),
                ligne.getTauxTva(),
                ligne.getMontantHt(),
                ligne.getMontantTva(),
                ligne.getMontantTtc()
        );
    }
}
