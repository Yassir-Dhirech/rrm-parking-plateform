package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.contrat.repository.ContratCorporateRepository;
import com.rrm.parking.demande.dto.response.DecisionCorporateResponse;
import com.rrm.parking.demande.dto.response.DemandeCorporateDetailResponse;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.OrigineTransition;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.DemandeCorporateRefuseeEvent;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeCorporateResponsableService {

    private final DemandeNouveauContratCorporateRepository demandeRepository;
    private final ContratCorporateRepository contratRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CapaciteCorporateService capaciteCorporateService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> lister(
            String recherche,
            String ordre
    ) {
        boolean recentes = "RECENT".equalsIgnoreCase(
                ordre == null ? "" : ordre.trim()
        );
        List<DemandeNouveauContratCorporate> demandes = recentes
                ? demandeRepository.findByStatutOrderByDateSoumissionDesc(
                        StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE
                )
                : demandeRepository.findByStatutOrderByDateSoumissionAsc(
                        StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE
                );
        String terme = recherche == null
                ? ""
                : recherche.trim().toUpperCase(Locale.ROOT);

        return demandes.stream()
                .filter(demande -> correspond(demande, terme))
                .map(DemandeRechercheResponse::depuis)
                .toList();
    }

    @Transactional(readOnly = true)
    public DemandeCorporateDetailResponse consulter(Long demandeId) {
        DemandeNouveauContratCorporate demande = demandeRepository
                .findById(demandeId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande corporate introuvable"
                ));
        Hibernate.initialize(demande.getClient());
        Hibernate.initialize(demande.getParking());
        Hibernate.initialize(demande.getImmatriculationsDeclarees());
        Hibernate.initialize(demande.getContratGenere());
        return DemandeCorporateDetailResponse.depuis(demande);
    }

    @Transactional
    public DecisionCorporateResponse valider(
            Long demandeId,
            Long responsableId
    ) {
        DemandeNouveauContratCorporate demande = chargerPourDecision(demandeId);
        Utilisateur responsable = chargerResponsable(responsableId);

        verifierDonneesContractuelles(demande);

        capaciteCorporateService.verrouillerEtVerifierPourValidation(
                demande.getId(),
                demande.getParking().getId(),
                demande.getNombrePlaces()
        );

        demande.validerParResponsable(
                responsable,
                "Validation de la demande corporate par le responsable"
        );
        ContratCorporate contrat = contratRepository.save(
                new ContratCorporate(
                        genererReferenceContrat(),
                        demande.getNombrePlaces(),
                        (ClientEntreprise) Hibernate.unproxy(demande.getClient())
                )
        );
        demande.associerContratGenere(contrat);
        demandeRepository.save(demande);

        return new DecisionCorporateResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                contrat.getId(),
                contrat.getReference(),
                contrat.getStatut().name(),
                "Demande validée et contrat non signé généré"
        );
    }

    @Transactional
    public DecisionCorporateResponse refuser(
            Long demandeId,
            Long responsableId,
            String motif
    ) {
        DemandeNouveauContratCorporate demande = chargerPourDecision(demandeId);
        Utilisateur responsable = chargerResponsable(responsableId);
        ClientEntreprise entreprise = (ClientEntreprise) Hibernate.unproxy(
                demande.getClient()
        );
        String motifNormalise = motif == null ? "" : motif.trim();

        demande.refuser(
                motifNormalise,
                OrigineTransition.UTILISATEUR_INTERNE,
                responsable
        );
        demandeRepository.save(demande);

        eventPublisher.publishEvent(
                new DemandeCorporateRefuseeEvent(
                        demande.getReference(),
                        entreprise.getRaisonSociale(),
                        nomRepresentant(entreprise),
                        entreprise.getEmail(),
                        motifNormalise
                )
        );

        return new DecisionCorporateResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                null,
                null,
                null,
                "Demande refusée et client informé par e-mail"
        );
    }

    private DemandeNouveauContratCorporate chargerPourDecision(Long demandeId) {
        DemandeNouveauContratCorporate demande = demandeRepository
                .findByIdPourDecision(demandeId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande corporate introuvable"
                ));

        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE) {
            throw new ConflitMetierException(
                    "La demande corporate n'est plus en attente de décision"
            );
        }
        if (demande.getContratGenere() != null) {
            throw new ConflitMetierException(
                    "Un contrat a déjà été généré pour cette demande"
            );
        }
        return demande;
    }

    private Utilisateur chargerResponsable(Long responsableId) {
        return utilisateurRepository.findById(responsableId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Utilisateur responsable introuvable"
                ));
    }

    private void verifierDonneesContractuelles(
            DemandeNouveauContratCorporate demande
    ) {
        if (demande.getCinRepresentant() == null
                || demande.getCinRepresentant().isBlank()
                || demande.getPlageHoraire() == null
                || demande.getPlageHoraire().isBlank()) {
            throw new ConflitMetierException(
                    "Le CIN du représentant et la plage horaire doivent être renseignés avant validation"
            );
        }
    }

    private boolean correspond(
            DemandeNouveauContratCorporate demande,
            String terme
    ) {
        if (terme.isBlank()) {
            return true;
        }
        ClientEntreprise entreprise = (ClientEntreprise) Hibernate.unproxy(
                demande.getClient()
        );
        return contient(demande.getReference(), terme)
                || contient(entreprise.getRaisonSociale(), terme)
                || contient(entreprise.getIce(), terme);
    }

    private boolean contient(String valeur, String terme) {
        return valeur != null
                && valeur.toUpperCase(Locale.ROOT).contains(terme);
    }

    private String nomRepresentant(ClientEntreprise entreprise) {
        String prenom = entreprise.getPrenomContactPrincipal() == null
                ? ""
                : entreprise.getPrenomContactPrincipal().trim();
        String nom = entreprise.getNomContactPrincipal() == null
                ? ""
                : entreprise.getNomContactPrincipal().trim();
        return (prenom + " " + nom).trim();
    }

    private String genererReferenceContrat() {
        return "CTR-RRM-"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-"
                + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
    }
}
