package com.rrm.parking.demande.service;


import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.rrm.parking.demande.dto.response.DemandeDetailResponse;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandePerteCarte;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.document.repository.PieceJointeRepository;
import org.hibernate.Hibernate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DemandeRechercheService {

    private final DemandeClientRepository
            demandeClientRepository;

    
            

    private final PieceJointeRepository
            pieceJointeRepository;

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> rechercher(
            String reference,
            String cin,
            String terme
    ) {

        String query = estRenseignee(terme) ? terme : (estRenseignee(reference) ? reference : cin);
       if (!estRenseignee(query)) {
            return listerToutesLesDemandes();
        }

        return rechercherGlobale(query);
    }

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> rechercher(
            String reference,
            String cin
    ) {
        return rechercher(reference, cin, null);
    }

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> listerToutesLesDemandes() {
        return demandeClientRepository.findAll()
                .stream()
                .sorted((a, b) -> {
                    var dateA = a.getDateSoumission() != null ? a.getDateSoumission() : a.getDateCreation();
                    var dateB = b.getDateSoumission() != null ? b.getDateSoumission() : b.getDateCreation();
                    if (dateA == null && dateB == null) return 0;
                    if (dateA == null) return 1;
                    if (dateB == null) return -1;
                    return dateB.compareTo(dateA);
                })
                .map(DemandeRechercheResponse::depuis)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> rechercherGlobale(String terme) {
        if (!estRenseignee(terme)) {
            return listerToutesLesDemandes();
        }

        String termeNormalise = normaliserTexte(terme);

        return listerToutesLesDemandes().stream()
                .filter(d -> correspondAuTerme(d, termeNormalise))
                .toList();
    }

     

    

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse>
    listerDemandesEnAttentePaiement() {

        return demandeClientRepository
                .findByStatutOrderByDateValidationOtpAsc(
                        StatutDemande.EN_ATTENTE_PAIEMENT
                )
                .stream()
                .map(DemandeRechercheResponse::depuis)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> listerDemandesAValider(
            String recherche,
            String ordre
    ) {
        boolean plusRecent = "RECENT".equalsIgnoreCase(
                ordre == null ? "" : ordre.trim()
        );

        List<DemandeClient> demandes = plusRecent
                ? demandeClientRepository
                .findByStatutOrderByDateSoumissionDesc(
                        StatutDemande.PAYEE
                )
                : demandeClientRepository
                .findByStatutOrderByDateSoumissionAsc(
                        StatutDemande.PAYEE
                );

        String terme = normaliserTexte(recherche);

        return demandes.stream()
                .map(DemandeRechercheResponse::depuis)
                .filter(demande ->
                        terme.isBlank()
                                || contient(demande.reference(), terme)
                                || contient(demande.identifiantClient(), terme)
                                || contient(demande.nomClient(), terme)
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public DemandeDetailResponse obtenirDetail(
            Long id
    ) {
        DemandeClient demande =
                demandeClientRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Demande introuvable"
                                )
                        );

        DemandeClient demandeReelle =
                (DemandeClient) Hibernate.unproxy(demande);

        if (demandeReelle instanceof DemandeNouvelAbonnementRegulier reguliere) {
            return DemandeDetailResponse.depuis(
                    reguliere,
                    pieceJointeRepository
                            .findByDemandeIdOrderByDateDepotDesc(id)
            );
        }

        if (demandeReelle instanceof DemandeRenouvellementRegulier renouvellement) {
            DemandeClient demandeInitiale = demandeClientRepository
                    .findByAbonnementGenereId(
                            renouvellement.getAbonnementConcerne().getId()
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "La demande initiale de l'abonnement est introuvable"
                    ));

            DemandeClient demandeInitialeReelle =
                    (DemandeClient) Hibernate.unproxy(demandeInitiale);

            if (!(demandeInitialeReelle
                    instanceof DemandeNouvelAbonnementRegulier initiale)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La demande d'origine de l'abonnement est invalide"
                );
            }

            return DemandeDetailResponse.depuis(
                    renouvellement,
                    initiale.getVehicule(),
                    pieceJointeRepository
                            .findByDemandeIdOrderByDateDepotDesc(initiale.getId())
            );
        }

        if (demandeReelle instanceof DemandePerteCarte perte) {
            return DemandeDetailResponse.depuis(perte);
        }

        throw new ResponseStatusException(
                HttpStatus.NOT_IMPLEMENTED,
                "Le détail de ce type de demande n’est pas encore disponible"
        );
    }

    private boolean correspondAuTerme(DemandeRechercheResponse d, String termeNormalise) {
        if (termeNormalise == null || termeNormalise.isBlank()) {
            return true;
        }

        return contient(d.reference(), termeNormalise)
                || contient(d.nomClient(), termeNormalise)
                || contient(d.identifiantClient(), termeNormalise)
                || contient(d.email(), termeNormalise)
                || contient(d.telephone(), termeNormalise)
                || contient(d.parkingNom(), termeNormalise)
                || contient(d.typeDemande(), termeNormalise)
                || contient(traduireTypeDemande(d.typeDemande()), termeNormalise)
                || (d.statut() != null && (contient(d.statut().name(), termeNormalise) || contient(traduireStatut(d.statut()), termeNormalise)));
    }

    private String normaliserTexte(String valeur) {
        if (valeur == null) {
            return "";
        }
        String nfd = java.text.Normalizer.normalize(valeur.trim().toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD);
        return nfd.replaceAll("\\p{M}", "");
    }

    private boolean contient(String valeur, String termeNormalise) {
        if (valeur == null || termeNormalise == null || termeNormalise.isBlank()) {
            return false;
        }
        String valeurNormalisee = normaliserTexte(valeur);
        return valeurNormalisee.contains(termeNormalise);
    }

    private String traduireStatut(StatutDemande statut) {
        if (statut == null) return "";
        return switch (statut) {
            case SOUMISE -> "Soumise";
            case EN_ATTENTE_PAIEMENT -> "En attente de paiement";
            case EN_ATTENTE_VALIDATION_RESPONSABLE -> "En attente de validation responsable";
            case EN_ATTENTE_PAIEMENT_SIGNATURE -> "Paiement et signature attendus";
            case EN_ATTENTE_RETOUR_CONTRAT_LEGALISE -> "Retour contrat légalisé";
            case EN_ATTENTE_FACTURATION -> "Prête à facturer";
            case EN_PREPARATION_CARTES -> "Cartes en préparation";
            case PRETE_A_FINALISER -> "Prête à finaliser";
            case FINALISEE -> "Finalisée";
            case PAYEE -> "Payée";
            case EN_ATTENTE_CORRECTION -> "En attente de correction";
            case VALIDEE -> "Validée";
            case REFUSEE -> "Refusée";
            case EXPIREE -> "Expirée";
            case ANNULEE -> "Annulée";
        };
    }

    private String traduireTypeDemande(String type) {
        if (type == null) return "";
        return switch (type) {
            case "NOUVEL_ABONNEMENT_REGULIER" -> "Nouvel abonnement régulier";
            case "RENOUVELLEMENT_REGULIER" -> "Renouvellement régulier";
            case "CHANGEMENT_PARKING" -> "Changement de parking";
            case "CHANGEMENT_VEHICULE" -> "Changement de véhicule";
            case "NOUVEAU_CONTRAT_CORPORATE" -> "Nouveau contrat corporate";
            default -> type;
        };
    }

    private boolean estRenseignee(
            String valeur
    ) {
        return valeur != null
                && !valeur.isBlank();
    }
}
