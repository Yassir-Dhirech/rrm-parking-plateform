package com.rrm.parking.client.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Données de consultation issues des entités persistées, sans valeurs simulées. */
public final class BaseClientsResponse {

    private BaseClientsResponse() {
    }

    public record PageResult<T>(
            List<T> content,
            long totalElements,
            int page,
            int size
    ) {
    }

    public record ParticulierListe(
            Long id,
            String nomComplet,
            String cin,
            String email,
            String telephone,
            String statut,
            LocalDateTime dateCreation
    ) {
    }

    public record EntrepriseListe(
            Long id,
            String raisonSociale,
            String ice,
            String email,
            String telephone,
            String statut,
            LocalDateTime dateCreation
    ) {
    }

    public record VehiculeInfo(
            Long id,
            String immatriculation,
            String marque,
            String modele,
            String couleur,
            String type,
            String statut
    ) {
    }

    public record PeriodeInfo(
            Integer numero,
            LocalDate dateDebut,
            LocalDate dateFin,
            String statut,
            BigDecimal prixHT
    ) {
    }

    public record AffectationInfo(
            Long parkingId,
            String parkingNom,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
    }

    public record AbonnementInfo(
            Long id,
            String reference,
            String statut,
            LocalDateTime dateCreation,
            List<PeriodeInfo> periodes,
            List<AffectationInfo> affectations
    ) {
    }

    public record DemandeInfo(
            String reference,
            String statut,
            String canalInitiation,
            LocalDateTime dateCreation,
            LocalDateTime dateSoumission
    ) {
    }

    public record ParticulierDetail(
            Long id,
            String nom,
            String prenom,
            String cin,
            String email,
            String telephone,
            String statut,
            LocalDateTime dateCreation,
            LocalDateTime dateModification,
            List<VehiculeInfo> vehicules,
            List<AbonnementInfo> abonnements,
            List<DemandeInfo> demandes
    ) {
    }

    public record ContratInfo(
            Long id,
            String reference,
            String statut,
            Integer nombrePlaces,
            LocalDateTime dateCreation,
            LocalDate dateDebut,
            LocalDate dateFin,
            String abonnementReference,
            String abonnementStatut
    ) {
    }

    public record EntrepriseDetail(
            Long id,
            String raisonSociale,
            String ice,
            String numeroRC,
            String adresseSiege,
            String nomContactPrincipal,
            String prenomContactPrincipal,
            String fonctionContactPrincipal,
            String email,
            String telephone,
            String statut,
            LocalDateTime dateCreation,
            LocalDateTime dateModification,
            List<VehiculeInfo> vehicules,
            List<ContratInfo> contrats,
            List<DemandeInfo> demandes
    ) {
    }
}
