package com.rrm.parking.client.service;

import com.rrm.parking.client.dto.response.BaseClientsResponse;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.enums.StatutClient;
import com.rrm.parking.client.repository.ClientEntrepriseRepository;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BaseClientsSuperviseurService {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");

    private final AffectationAgentParkingRepository affectations;
    private final ClientParticulierRepository particuliers;
    private final ClientEntrepriseRepository entreprises;
    private final DemandeClientRepository demandes;
    private final BaseClientsResponsableService baseGlobale;

    public BaseClientsResponse.PageResult<BaseClientsResponse.ParticulierListe> particuliers(
            Long superviseurId, String recherche, StatutClient statut,
            LocalDate dateDebut, LocalDate dateFin, int page, int taille) {
        verifierDates(dateDebut, dateFin);
        Set<Long> parkingIds = parkingsAutorises(superviseurId);
        Page<ClientParticulier> resultat = parkingIds.isEmpty() ? Page.empty(pageRequest(page, taille))
                : particuliers.rechercherPourSuperviseur(motifRecherche(recherche), statut,
                        dateDebut == null ? null : dateDebut.atStartOfDay(),
                        dateFin == null ? null : dateFin.plusDays(1).atStartOfDay(),
                        parkingIds, pageRequest(page, taille));
        return new BaseClientsResponse.PageResult<>(resultat.getContent().stream().map(client ->
                new BaseClientsResponse.ParticulierListe(client.getId(), client.getNomComplet(),
                        client.getCin(), client.getEmail(), client.getTelephone(),
                        client.getStatut().name(), client.getDateCreation())).toList(),
                resultat.getTotalElements(), resultat.getNumber(), resultat.getSize());
    }

    public BaseClientsResponse.PageResult<BaseClientsResponse.EntrepriseListe> entreprises(
            Long superviseurId, String recherche, StatutClient statut,
            LocalDate dateDebut, LocalDate dateFin, int page, int taille) {
        verifierDates(dateDebut, dateFin);
        Set<Long> parkingIds = parkingsAutorises(superviseurId);
        Page<ClientEntreprise> resultat = parkingIds.isEmpty() ? Page.empty(pageRequest(page, taille))
                : entreprises.rechercherPourSuperviseur(motifRecherche(recherche), statut,
                        dateDebut == null ? null : dateDebut.atStartOfDay(),
                        dateFin == null ? null : dateFin.plusDays(1).atStartOfDay(),
                        parkingIds, pageRequest(page, taille));
        return new BaseClientsResponse.PageResult<>(resultat.getContent().stream().map(client ->
                new BaseClientsResponse.EntrepriseListe(client.getId(), client.getRaisonSociale(),
                        client.getIce(), client.getEmail(), client.getTelephone(),
                        client.getStatut().name(), client.getDateCreation())).toList(),
                resultat.getTotalElements(), resultat.getNumber(), resultat.getSize());
    }

    public BaseClientsResponse.ParticulierDetail particulier(Long superviseurId, Long clientId) {
        Set<Long> parkingIds = parkingsAutorises(superviseurId);
        if (parkingIds.isEmpty() || particuliers.compterClientPourParkings(clientId, parkingIds) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client régulier introuvable");
        }
        var detail = baseGlobale.particulier(clientId);
        List<DemandeClient> toutesDemandes = demandes.findByClientIdOrderByDateSoumissionDesc(clientId);
        List<DemandeClient> demandesAutorisees = toutesDemandes.stream()
                .filter(demande -> concerneParking(demande, parkingIds)).toList();
        Set<String> references = demandesAutorisees.stream().map(DemandeClient::getReference)
                .collect(Collectors.toSet());
        Set<Long> abonnementsAutorises = detail.abonnements().stream()
                .filter(abonnement -> abonnement.affectations().stream()
                        .anyMatch(a -> parkingIds.contains(a.parkingId())))
                .map(BaseClientsResponse.AbonnementInfo::id).collect(Collectors.toSet());
        Set<Long> vehicules = toutesDemandes.stream()
                .map(Hibernate::unproxy)
                .filter(DemandeNouvelAbonnementRegulier.class::isInstance)
                .map(DemandeNouvelAbonnementRegulier.class::cast)
                .filter(d -> concerneParking(d, parkingIds)
                        || (d.getAbonnementGenere() != null
                            && abonnementsAutorises.contains(d.getAbonnementGenere().getId())))
                .map(DemandeNouvelAbonnementRegulier::getVehicule)
                .filter(java.util.Objects::nonNull)
                .map(vehicule -> vehicule.getId()).collect(Collectors.toSet());
        return new BaseClientsResponse.ParticulierDetail(
                detail.id(), detail.nom(), detail.prenom(), detail.cin(), detail.email(),
                detail.telephone(), detail.statut(), detail.dateCreation(), detail.dateModification(),
                detail.vehicules().stream().filter(v -> vehicules.contains(v.id())).toList(),
                detail.abonnements().stream().filter(abonnement -> abonnement.affectations().stream()
                        .anyMatch(a -> parkingIds.contains(a.parkingId())))
                        .map(abonnement -> new BaseClientsResponse.AbonnementInfo(
                                abonnement.id(), abonnement.reference(), abonnement.statut(),
                                abonnement.dateCreation(),
                                abonnement.periodes().stream().filter(periode -> abonnement.affectations()
                                        .stream().filter(a -> parkingIds.contains(a.parkingId()))
                                        .anyMatch(a -> !periode.dateFin().isBefore(a.dateDebut())
                                                && (a.dateFin() == null || !periode.dateDebut().isAfter(a.dateFin()))))
                                        .toList(),
                                abonnement.affectations().stream()
                                        .filter(a -> parkingIds.contains(a.parkingId())).toList()))
                        .toList(),
                detail.demandes().stream().filter(d -> references.contains(d.reference())).toList());
    }

    public BaseClientsResponse.EntrepriseDetail entreprise(Long superviseurId, Long clientId) {
        Set<Long> parkingIds = parkingsAutorises(superviseurId);
        if (parkingIds.isEmpty() || entreprises.compterClientPourParkings(clientId, parkingIds) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entreprise introuvable");
        }
        var detail = baseGlobale.entreprise(clientId);
        List<DemandeNouveauContratCorporate> demandesAutorisees = demandes
                .findByClientIdOrderByDateSoumissionDesc(clientId).stream()
                .map(Hibernate::unproxy)
                .filter(DemandeNouveauContratCorporate.class::isInstance)
                .map(DemandeNouveauContratCorporate.class::cast)
                .filter(d -> parkingIds.contains(d.getParking().getId())).toList();
        Set<String> references = demandesAutorisees.stream().map(DemandeClient::getReference)
                .collect(Collectors.toSet());
        Set<Long> contratIds = demandesAutorisees.stream()
                .map(DemandeNouveauContratCorporate::getContratGenere)
                .filter(java.util.Objects::nonNull).map(contrat -> contrat.getId())
                .collect(Collectors.toSet());
        Set<Long> vehiculeIds = demandesAutorisees.stream()
                .flatMap(d -> d.getVehiculesSelectionnes().stream())
                .map(vehicule -> vehicule.getId()).collect(Collectors.toSet());
        return new BaseClientsResponse.EntrepriseDetail(
                detail.id(), detail.raisonSociale(), detail.ice(), detail.numeroRC(),
                detail.adresseSiege(), detail.nomContactPrincipal(), detail.prenomContactPrincipal(),
                detail.fonctionContactPrincipal(), detail.email(), detail.telephone(),
                detail.statut(), detail.dateCreation(), detail.dateModification(),
                detail.vehicules().stream().filter(v -> vehiculeIds.contains(v.id())).toList(),
                detail.contrats().stream().filter(c -> contratIds.contains(c.id())).toList(),
                detail.demandes().stream().filter(d -> references.contains(d.reference())).toList());
    }

    private boolean concerneParking(DemandeClient demande, Set<Long> parkingIds) {
        Object reel = Hibernate.unproxy(demande);
        if (reel instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            return nouvelle.getTarifParking() != null
                    && parkingIds.contains(nouvelle.getTarifParking().getParking().getId());
        }
        if (reel instanceof DemandeRenouvellementRegulier renouvellement) {
            return renouvellement.getTarifParking() != null
                    && parkingIds.contains(renouvellement.getTarifParking().getParking().getId());
        }
        return false;
    }

    private Set<Long> parkingsAutorises(Long superviseurId) {
        LocalDate maintenant = LocalDate.now(ZONE_RRM);
        return affectations.findAllByUtilisateurIdAndActiveTrue(superviseurId).stream()
                .filter(a -> a.getDateDebut() != null && !a.getDateDebut().isAfter(maintenant))
                .filter(a -> a.getDateFin() == null || !a.getDateFin().isBefore(maintenant))
                .map(a -> a.getParking().getId()).collect(Collectors.toSet());
    }

    private PageRequest pageRequest(int page, int taille) {
        return PageRequest.of(Math.max(0, page), Math.clamp(taille, 1, 50),
                Sort.by(Sort.Direction.DESC, "dateCreation", "id"));
    }

    private String motifRecherche(String recherche) {
        if (recherche == null || recherche.isBlank()) return null;
        String texte = recherche.trim().toLowerCase(Locale.ROOT);
        if (texte.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recherche trop longue");
        }
        return "%" + texte + "%";
    }

    private void verifierDates(LocalDate debut, LocalDate fin) {
        if (debut != null && fin != null && debut.isAfter(fin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de début doit précéder la date de fin");
        }
    }
}
