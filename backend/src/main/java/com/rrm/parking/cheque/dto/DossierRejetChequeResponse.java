package com.rrm.parking.cheque.dto;

import com.rrm.parking.cheque.entity.DossierRejetCheque;
import com.rrm.parking.cheque.enums.StatutRejetCheque;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.paiement.entity.Paiement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DossierRejetChequeResponse(
        Long id,
        StatutRejetCheque statut,
        Long paiementInitialId,
        String referencePaiement,
        String numeroCheque,
        Long abonnementId,
        String referenceAbonnement,
        String clientNom,
        Long clientId,
        String clientIdentifiant,
        String clientEmail,
        String clientTelephone,
        String parkingNom,
        String statutAbonnement,
        java.math.BigDecimal montantInitialTtc,
        BigDecimal montantAbonnementTtc,
        BigDecimal fraisCarteTtc,
        String factureInitialeNumero,
        String documentCorrectifReference,
        LocalDate dateLettreBanque,
        String constatComptable,
        LocalDateTime dateDeclaration,
        LocalDateTime dateDecision,
        LocalDateTime dateBlocageCartes,
        Long paiementRegularisationId,
        String referencePaiementRegularisation,
        String statutPaiementRegularisation,
        String modePaiementRegularisation,
        String numeroChequeRegularisation,
        String banqueChequeRegularisation,
        LocalDate dateEmissionChequeRegularisation,
        String agentRegularisation,
        LocalDateTime dateRegularisation,
        LocalDateTime dateValidationPaiement,
        String factureRegularisationNumero,
        LocalDateTime dateReactivation,
        LocalDateTime dateActivationCartes
) {
    public static DossierRejetChequeResponse depuis(DossierRejetCheque dossier,
                                                     String factureRegularisationNumero,
                                                     Facture factureInitiale) {
        Client client = (Client) org.hibernate.Hibernate.unproxy(dossier.getPaiementInitial().getDemande().getClient());
        String nom = client instanceof ClientParticulier particulier
                ? particulier.getNomComplet() : client instanceof ClientEntreprise entreprise
                ? entreprise.getRaisonSociale() : "Client inconnu";
        String identifiant = client instanceof ClientParticulier particulier ? particulier.getCin()
                : client instanceof ClientEntreprise entreprise ? entreprise.getIce() : null;
        Paiement nouveau = dossier.getPaiementRegularisation();
        BigDecimal abonnementTtc = totalPourType(factureInitiale, TypeLigneFacture.ABONNEMENT);
        BigDecimal carteTtc = totalPourType(factureInitiale, TypeLigneFacture.CARTE_ACCES);
        return new DossierRejetChequeResponse(
                dossier.getId(),
                dossier.getStatut(),
                dossier.getPaiementInitial().getId(),
                dossier.getPaiementInitial().getReference(),
                dossier.getPaiementInitial().getNumeroCheque(),
                dossier.getAbonnement().getId(),
                dossier.getAbonnement().getReference(),
                nom,
                client.getId(),
                identifiant,
                client.getEmail(),
                client.getTelephone(),
                parking(dossier),
                dossier.getAbonnement().getStatut().name(),
                dossier.getPaiementInitial().getMontant(),
                abonnementTtc,
                carteTtc,
                dossier.getFactureInitialeNumero(),
                dossier.getDocumentCorrectifReference(),
                dossier.getDateLettreBanque(),
                dossier.getConstatComptable(),
                dossier.getDateDeclaration(),
                dossier.getDateDecision(),
                dossier.getDateBlocageCartes(),
                nouveau == null ? null : nouveau.getId(),
                nouveau == null ? null : nouveau.getReference(),
                nouveau == null ? null : nouveau.getStatut().name(),
                nouveau == null ? null : nouveau.getModePaiement().name(),
                nouveau == null ? null : nouveau.getNumeroCheque(),
                nouveau == null ? null : nouveau.getBanqueCheque(),
                nouveau == null ? null : nouveau.getDateEmissionCheque(),
                dossier.getRegularisationEnregistreePar() == null ? null
                        : dossier.getRegularisationEnregistreePar().getPrenom() + " "
                        + dossier.getRegularisationEnregistreePar().getNom(),
                dossier.getDateRegularisation(),
                dossier.getDateValidationPaiement(),
                factureRegularisationNumero,
                dossier.getDateReactivation(),
                dossier.getDateActivationCartes()
        );
    }

    private static BigDecimal totalPourType(Facture facture, TypeLigneFacture type) {
        if (facture == null) return null;
        return facture.getLignes().stream()
                .filter(ligne -> ligne.getTypeLigne() == type)
                .map(ligne -> ligne.getMontantTtc())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static String parking(DossierRejetCheque dossier) {
        var demande = org.hibernate.Hibernate.unproxy(dossier.getPaiementInitial().getDemande());
        if (demande instanceof com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier reguliere) {
            return reguliere.getTarifParking().getParking().getNom();
        }
        if (demande instanceof com.rrm.parking.demande.entity.DemandeRenouvellementRegulier renouvellement) {
            return renouvellement.getTarifParking().getParking().getNom();
        }
        if (demande instanceof com.rrm.parking.demande.entity.DemandeNouveauContratCorporate corporate) {
            return corporate.getParking().getNom();
        }
        return "";
    }
}
