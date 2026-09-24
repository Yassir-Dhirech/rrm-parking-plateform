package com.rrm.parking.demande.dto.response;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.StatutDemande;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DemandeCorporateDetailResponse(
        Long id,
        String reference,
        StatutDemande statut,
        LocalDateTime dateSoumission,
        LocalDateTime dateValidationOtp,
        LocalDateTime dateModification,
        String motifRefus,
        String raisonSociale,
        String ice,
        String numeroRc,
        String titreFoncier,
        String nomRepresentant,
        String prenomRepresentant,
        String cinRepresentant,
        String telephoneRepresentant,
        String emailRepresentant,
        String libelleProjet,
        String adresseProjet,
        String plageHoraire,
        Long parkingId,
        String parkingNom,
        Integer nombrePlaces,
        Integer dureeEnMois,
        BigDecimal prixMensuelUnitaireTtc,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCartesTtc,
        BigDecimal montantTotalTtc,
        List<String> immatriculations,
        Long contratId,
        String referenceContrat,
        String statutContrat
) {
    private static final int DUREE_MOIS = 240;

    public static DemandeCorporateDetailResponse depuis(
            DemandeNouveauContratCorporate demande
    ) {
        ClientEntreprise entreprise = (ClientEntreprise) Hibernate.unproxy(
                demande.getClient()
        );
        ContratCorporate contrat = demande.getContratGenere();

        return new DemandeCorporateDetailResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                demande.getDateSoumission(),
                demande.getDateValidationOtp(),
                demande.getDateModification(),
                demande.getMotifRefus(),
                entreprise.getRaisonSociale(),
                entreprise.getIce(),
                entreprise.getNumeroRC(),
                demande.getTitreFoncier(),
                entreprise.getNomContactPrincipal(),
                entreprise.getPrenomContactPrincipal(),
                demande.getCinRepresentant(),
                entreprise.getTelephone(),
                entreprise.getEmail(),
                demande.getLibelleProjet(),
                demande.getAdresseProjet(),
                demande.getPlageHoraire(),
                demande.getParking().getId(),
                demande.getParking().getNom(),
                demande.getNombrePlaces(),
                DUREE_MOIS,
                demande.getPrixMensuelUnitaireTtc(),
                demande.getMontantAbonnementTtc(),
                demande.getFraisCartesTtc(),
                demande.getMontantTotalTtc(),
                demande.getImmatriculationsDeclarees().stream().sorted().toList(),
                contrat == null ? null : contrat.getId(),
                contrat == null ? null : contrat.getReference(),
                contrat == null ? null : contrat.getStatut().name()
        );
    }
}
