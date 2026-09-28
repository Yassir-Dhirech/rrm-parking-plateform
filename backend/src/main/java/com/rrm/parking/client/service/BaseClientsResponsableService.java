package com.rrm.parking.client.service;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.abonnement.entity.AbonnementRegulier;
import com.rrm.parking.abonnement.repository.AbonnementEntrepriseRepository;
import com.rrm.parking.abonnement.repository.AbonnementRegulierRepository;
import com.rrm.parking.client.dto.response.BaseClientsResponse;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.enums.StatutClient;
import com.rrm.parking.client.repository.ClientEntrepriseRepository;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.contrat.repository.ContratCorporateRepository;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BaseClientsResponsableService {

    private final ClientParticulierRepository particuliers;
    private final ClientEntrepriseRepository entreprises;
    private final VehiculeRepository vehicules;
    private final AbonnementRegulierRepository abonnementsReguliers;
    private final AbonnementEntrepriseRepository abonnementsEntreprises;
    private final ContratCorporateRepository contrats;
    private final DemandeClientRepository demandes;

    public BaseClientsResponse.PageResult<BaseClientsResponse.ParticulierListe> particuliers(
            String recherche, StatutClient statut, LocalDate dateDebut,
            LocalDate dateFin, int page, int taille
    ) {
        verifierDates(dateDebut, dateFin);
        Page<ClientParticulier> resultat = particuliers.rechercherPourBaseClients(
                motifRecherche(recherche), statut,
                dateDebut == null ? null : dateDebut.atStartOfDay(),
                dateFin == null ? null : dateFin.plusDays(1).atStartOfDay(),
                pageRequest(page, taille)
        );
        return new BaseClientsResponse.PageResult<>(
                resultat.getContent().stream().map(client ->
                        new BaseClientsResponse.ParticulierListe(
                                client.getId(), client.getNomComplet(), client.getCin(),
                                client.getEmail(), client.getTelephone(),
                                client.getStatut().name(), client.getDateCreation()
                        )).toList(),
                resultat.getTotalElements(), resultat.getNumber(), resultat.getSize()
        );
    }

    public BaseClientsResponse.PageResult<BaseClientsResponse.EntrepriseListe> entreprises(
            String recherche, StatutClient statut, LocalDate dateDebut,
            LocalDate dateFin, int page, int taille
    ) {
        verifierDates(dateDebut, dateFin);
        Page<ClientEntreprise> resultat = entreprises.rechercherPourBaseClients(
                motifRecherche(recherche), statut,
                dateDebut == null ? null : dateDebut.atStartOfDay(),
                dateFin == null ? null : dateFin.plusDays(1).atStartOfDay(),
                pageRequest(page, taille)
        );
        return new BaseClientsResponse.PageResult<>(
                resultat.getContent().stream().map(client ->
                        new BaseClientsResponse.EntrepriseListe(
                                client.getId(), client.getRaisonSociale(), client.getIce(),
                                client.getEmail(), client.getTelephone(),
                                client.getStatut().name(), client.getDateCreation()
                        )).toList(),
                resultat.getTotalElements(), resultat.getNumber(), resultat.getSize()
        );
    }

    public BaseClientsResponse.ParticulierDetail particulier(Long id) {
        ClientParticulier client = particuliers.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Client régulier introuvable"));

        List<BaseClientsResponse.AbonnementInfo> historique = abonnementsReguliers
                .findAllByClientIdOrderByDateCreationDesc(id)
                .stream().map(this::abonnement).toList();

        return new BaseClientsResponse.ParticulierDetail(
                client.getId(), client.getNom(), client.getPrenom(), client.getCin(),
                client.getEmail(), client.getTelephone(), client.getStatut().name(),
                client.getDateCreation(), client.getDateModification(),
                vehicules.findAllByClientIdOrderByDateCreationDesc(id)
                        .stream().map(this::vehicule).toList(),
                historique,
                demandes.findByClientIdOrderByDateSoumissionDesc(id)
                        .stream().map(this::demande).toList()
        );
    }

    public BaseClientsResponse.EntrepriseDetail entreprise(Long id) {
        ClientEntreprise client = entreprises.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Entreprise introuvable"));

        Map<Long, AbonnementEntreprise> abonnementsParContrat = abonnementsEntreprises
                .findAllByContratClientEntrepriseIdOrderByDateCreationDesc(id)
                .stream().collect(Collectors.toMap(
                        abonnement -> abonnement.getContrat().getId(),
                        Function.identity(), (premier, second) -> premier
                ));

        List<BaseClientsResponse.ContratInfo> historique = contrats
                .findAllByClientEntrepriseIdOrderByDateCreationDesc(id)
                .stream().map(contrat -> {
                    AbonnementEntreprise abonnement = abonnementsParContrat.get(contrat.getId());
                    return new BaseClientsResponse.ContratInfo(
                            contrat.getId(), contrat.getReference(), contrat.getStatut().name(),
                            contrat.getNombrePlacesContractuelles(), contrat.getDateCreation(),
                            contrat.getDateDebut(), contrat.getDateFin(),
                            abonnement == null ? null : abonnement.getReference(),
                            abonnement == null ? null : abonnement.getStatut().name()
                    );
                }).toList();

        return new BaseClientsResponse.EntrepriseDetail(
                client.getId(), client.getRaisonSociale(), client.getIce(),
                client.getNumeroRC(), client.getAdresseSiege(),
                client.getNomContactPrincipal(), client.getPrenomContactPrincipal(),
                client.getFonctionContactPrincipal(), client.getEmail(),
                client.getTelephone(), client.getStatut().name(),
                client.getDateCreation(), client.getDateModification(),
                vehicules.findAllByClientIdOrderByDateCreationDesc(id)
                        .stream().map(this::vehicule).toList(),
                historique,
                demandes.findByClientIdOrderByDateSoumissionDesc(id)
                        .stream().map(this::demande).toList()
        );
    }

    private BaseClientsResponse.AbonnementInfo abonnement(AbonnementRegulier abonnement) {
        return new BaseClientsResponse.AbonnementInfo(
                abonnement.getId(), abonnement.getReference(), abonnement.getStatut().name(),
                abonnement.getDateCreation(),
                abonnement.getPeriodes().stream().map(periode ->
                        new BaseClientsResponse.PeriodeInfo(
                                periode.getNumero(), periode.getDateDebut(),
                                periode.getDateFin(), periode.getStatut().name(),
                                periode.getPrixHTApplique()
                        )).toList(),
                abonnement.getAffectationsParking().stream().map(affectation ->
                        new BaseClientsResponse.AffectationInfo(
                                affectation.getParking().getId(),
                                affectation.getParking().getNom(),
                                affectation.getDateDebut(), affectation.getDateFin()
                        )).toList()
        );
    }

    private BaseClientsResponse.VehiculeInfo vehicule(Vehicule vehicule) {
        return new BaseClientsResponse.VehiculeInfo(
                vehicule.getId(), vehicule.getImmatriculation(), vehicule.getMarque(),
                vehicule.getModele(), vehicule.getCouleur(),
                vehicule.getType().name(), vehicule.getStatut().name()
        );
    }

    private BaseClientsResponse.DemandeInfo demande(DemandeClient demande) {
        return new BaseClientsResponse.DemandeInfo(
                demande.getReference(), demande.getStatut().name(),
                demande.getCanalInitiation().name(), demande.getDateCreation(),
                demande.getDateSoumission()
        );
    }

    private PageRequest pageRequest(int page, int taille) {
        return PageRequest.of(Math.max(0, page), Math.clamp(taille, 1, 50),
                Sort.by(Sort.Direction.DESC, "dateCreation", "id"));
    }

    private String motifRecherche(String recherche) {
        if (recherche == null || recherche.isBlank()) {
            return null;
        }
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
