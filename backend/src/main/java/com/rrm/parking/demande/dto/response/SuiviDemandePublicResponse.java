package com.rrm.parking.demande.dto.response;

import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.vehicule.enums.TypeVehicule;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SuiviDemandePublicResponse(
        String reference, String typeDemande, StatutDemande statut,
        LocalDateTime dateCreation, String clientNom,
        String nom, String prenom, String cin, String email, String telephone,
        String immatriculation, String marque, String modele, String couleur,
        TypeVehicule typeVehicule, Long parkingId, String parkingNom,
        Long tarifParkingId, String forfaitNom, Integer dureeMois,
        BigDecimal montantTotalTTC, ModePaiement modePaiement,
        List<String> piecesJointes, boolean modifiable
) {
    public static SuiviDemandePublicResponse depuis(DemandeDetailResponse d) {
        return new SuiviDemandePublicResponse(d.reference(), d.typeDemande(), d.statut(),
                d.dateCreation(), d.clientNom(), d.nom(), d.prenom(), d.cin(), d.email(),
                d.telephone(), d.immatriculation(), d.marque(), d.modele(), d.couleur(),
                d.typeVehicule(), d.parkingId(), d.parkingNom(), d.tarifParkingId(),
                d.forfaitNom(), d.dureeMois(), d.montantTotalTTC(), d.modePaiementSouhaite(),
                d.piecesJointes().stream().map(DemandeDetailResponse.PieceJointeInfo::nomFichierOriginal).toList(),
                d.statut() == StatutDemande.EN_ATTENTE_PAIEMENT);
    }

    public static SuiviDemandePublicResponse depuis(DemandeRechercheResponse d, LocalDateTime dateCreation) {
        return new SuiviDemandePublicResponse(d.reference(), d.typeDemande(), d.statut(),
                dateCreation, d.nomClient(), null, null, null, d.email(), d.telephone(),
                null, null, null, null, null, null, d.parkingNom(), null,
                null, null, null, null, List.of(), false);
    }
}
