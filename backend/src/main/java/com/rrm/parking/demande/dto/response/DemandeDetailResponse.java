package com.rrm.parking.demande.dto.response;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.document.entity.PieceJointe;
import com.rrm.parking.document.enums.StatutPieceJointe;
import com.rrm.parking.document.enums.TypePieceJointe;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.model.DecomptePaiementDemande;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.Forfait;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DemandeDetailResponse(

        Long id,
        String reference,
        String typeDemande,
        StatutDemande statut,
        CanalInitiation canalInitiation,

        LocalDateTime dateCreation,
        LocalDateTime dateSoumission,
        LocalDateTime dateValidationOtp,
        LocalDateTime dateModification,
        String motifRefus,

        Long clientId,
        String typeClient,
        String clientNom,
        String cin,
        String email,
        String telephone,

        Long vehiculeId,
        String immatriculation,
        String marque,
        String modele,
        String couleur,
        TypeVehicule typeVehicule,

        Long tarifParkingId,
        Long parkingId,
        String parkingNom,
        Long forfaitId,
        String forfaitNom,
        Integer dureeMois,
        BigDecimal prixHT,
        BigDecimal tauxTVA,
        BigDecimal montantAbonnementTTC,
        BigDecimal fraisCarteTTC,
        BigDecimal montantTotalTTC,
        ModePaiement modePaiementSouhaite,

        List<PieceJointeInfo> piecesJointes

) {

    public static DemandeDetailResponse depuis(
            DemandeNouvelAbonnementRegulier demande,
            List<PieceJointe> pieces
    ) {
        ClientParticulier client =
                (ClientParticulier) Hibernate.unproxy(
                        demande.getClient()
                );

        Vehicule vehicule = demande.getVehicule();
        TarifParking tarif = demande.getTarifParking();
        Parking parking = tarif.getParking();
        Forfait forfait = tarif.getForfait();
        DecompteNouvelAbonnement decompte =
                DecompteNouvelAbonnement.depuis(tarif);

        return new DemandeDetailResponse(
                demande.getId(),
                demande.getReference(),
                "NOUVEL_ABONNEMENT_REGULIER",
                demande.getStatut(),
                demande.getCanalInitiation(),

                demande.getDateCreation(),
                demande.getDateSoumission(),
                demande.getDateValidationOtp(),
                demande.getDateModification(),
                demande.getMotifRefus(),

                client.getId(),
                "PARTICULIER",
                client.getNomComplet(),
                client.getCin(),
                client.getEmail(),
                client.getTelephone(),

                vehicule.getId(),
                vehicule.getImmatriculation(),
                vehicule.getMarque(),
                vehicule.getModele(),
                vehicule.getCouleur(),
                vehicule.getType(),

                tarif.getId(),
                parking.getId(),
                parking.getNom(),
                forfait.getId(),
                forfait.getLibelle(),
                tarif.getDureeEnMois(),
                tarif.getPrixHT(),
                tarif.getTauxTVA(),
                decompte.montantAbonnementTTC(),
                decompte.fraisCarteTTC(),
                decompte.montantTotalTTC(),
                demande.getModePaiementSouhaite(),

                pieces.stream()
                        .map(PieceJointeInfo::depuis)
                        .toList()
        );
    }

    public static DemandeDetailResponse depuis(
            DemandeRenouvellementRegulier demande,
            Vehicule vehicule,
            List<PieceJointe> pieces
    ) {
        ClientParticulier client =
                (ClientParticulier) Hibernate.unproxy(
                        demande.getClient()
                );

        TarifParking tarif = demande.getTarifParking();
        Parking parking = tarif.getParking();
        Forfait forfait = tarif.getForfait();
        DecomptePaiementDemande decompte =
                DecomptePaiementDemande.depuis(demande);

        return new DemandeDetailResponse(
                demande.getId(),
                demande.getReference(),
                "RENOUVELLEMENT_REGULIER",
                demande.getStatut(),
                demande.getCanalInitiation(),

                demande.getDateCreation(),
                demande.getDateSoumission(),
                demande.getDateValidationOtp(),
                demande.getDateModification(),
                demande.getMotifRefus(),

                client.getId(),
                "PARTICULIER",
                client.getNomComplet(),
                client.getCin(),
                client.getEmail(),
                client.getTelephone(),

                vehicule.getId(),
                vehicule.getImmatriculation(),
                vehicule.getMarque(),
                vehicule.getModele(),
                vehicule.getCouleur(),
                vehicule.getType(),

                tarif.getId(),
                parking.getId(),
                parking.getNom(),
                forfait.getId(),
                forfait.getLibelle(),
                tarif.getDureeEnMois(),
                tarif.getPrixHT(),
                tarif.getTauxTVA(),
                decompte.montantAbonnementTTC(),
                decompte.fraisCarteTTC(),
                decompte.montantTotalTTC(),
                demande.getModePaiementSouhaite(),

                pieces.stream()
                        .map(PieceJointeInfo::depuis)
                        .toList()
        );
    }

    public record PieceJointeInfo(
            Long id,
            String reference,
            TypePieceJointe typePiece,
            StatutPieceJointe statut,
            String nomFichierOriginal,
            String typeMime,
            Long tailleOctets,
            LocalDateTime dateDepot,
            String contenuUrl
    ) {
        public static PieceJointeInfo depuis(
                PieceJointe piece
        ) {
            return new PieceJointeInfo(
                    piece.getId(),
                    piece.getReference(),
                    piece.getTypePiece(),
                    piece.getStatut(),
                    piece.getNomFichierOriginal(),
                    piece.getTypeMime(),
                    piece.getTailleOctets(),
                    piece.getDateDepot(),
                    "/api/pieces-jointes/"
                            + piece.getId()
                            + "/contenu"
            );
        }
    }
}
