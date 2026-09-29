package com.rrm.parking.facturation.service;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.dto.response.DemandeFacturationResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.dto.response.FacturesComptableResponse;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.paiement.model.DecomptePaiementDemande;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacturationService {

    private static final BigDecimal CENT = new BigDecimal("100");
    private static final DateTimeFormatter FORMAT_DATE =
            DateTimeFormatter.BASIC_ISO_DATE;

    private final DemandeClientRepository demandeRepository;
    private final PaiementRepository paiementRepository;
    private final FactureRepository factureRepository;

    @Transactional(readOnly = true)
    public FacturesComptableResponse listerFactures(
            int page,
            int taille,
            String recherche,
            StatutFacture statut,
            ModePaiement modePaiement,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        if (page < 0 || taille < 1 || taille > 50) {
            throw new IllegalArgumentException(
                    "La page doit être positive et la taille comprise entre 1 et 50"
            );
        }
        if (dateDebut != null && dateFin != null && dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin précède la date de début");
        }
        String terme = recherche == null ? "" : recherche.trim();
        if (terme.length() > 100) {
            throw new IllegalArgumentException("La recherche ne peut pas dépasser 100 caractères");
        }

        Specification<Facture> filtres = (racine, requete, cb) -> cb.conjunction();
        if (!terme.isEmpty()) {
            String motif = "%" + terme.toLowerCase(Locale.ROOT)
                    .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            filtres = filtres.and((racine, requete, cb) -> {
                var paiement = racine.join("paiement");
                var demande = paiement.join("demande");
                var client = demande.join("client");
                var particuliers = requete.subquery(Long.class);
                var particulier = particuliers.from(ClientParticulier.class);
                particuliers.select(particulier.get("id")).where(
                        cb.equal(particulier.get("id"), client.get("id")),
                        cb.or(
                                cb.like(cb.lower(particulier.get("nom")), motif, '!'),
                                cb.like(cb.lower(particulier.get("prenom")), motif, '!'),
                                cb.like(cb.lower(cb.concat(
                                        cb.concat(particulier.get("prenom"), " "),
                                        particulier.get("nom")
                                )), motif, '!')
                        )
                );
                var entreprises = requete.subquery(Long.class);
                var entreprise = entreprises.from(ClientEntreprise.class);
                entreprises.select(entreprise.get("id")).where(
                        cb.equal(entreprise.get("id"), client.get("id")),
                        cb.like(cb.lower(entreprise.get("raisonSociale")), motif, '!')
                );
                return cb.or(
                        cb.like(cb.lower(racine.get("numero")), motif, '!'),
                        cb.like(cb.lower(paiement.get("reference")), motif, '!'),
                        cb.like(cb.lower(demande.get("reference")), motif, '!'),
                        cb.exists(particuliers),
                        cb.exists(entreprises)
                );
            });
        }
        if (statut != null) {
            filtres = filtres.and((racine, requete, cb) ->
                    cb.equal(racine.get("statut"), statut));
        }
        if (modePaiement != null) {
            filtres = filtres.and(mode(modePaiement));
        }
        if (dateDebut != null) {
            LocalDateTime debut = dateDebut.atStartOfDay();
            filtres = filtres.and((racine, requete, cb) ->
                    cb.greaterThanOrEqualTo(racine.get("dateCreation"), debut));
        }
        if (dateFin != null) {
            LocalDateTime finExclusive = dateFin.plusDays(1).atStartOfDay();
            filtres = filtres.and((racine, requete, cb) ->
                    cb.lessThan(racine.get("dateCreation"), finExclusive));
        }

        Page<FactureResponse> factures = factureRepository.findAll(filtres, PageRequest.of(
                        page,
                        taille,
                        Sort.by(Sort.Direction.DESC, "dateCreation")
                                .and(Sort.by(Sort.Direction.DESC, "id"))
                ))
                .map(FactureResponse::depuis);
        return new FacturesComptableResponse(
                factures,
                factureRepository.count(),
                factureRepository.count(filtres.and(mode(ModePaiement.CHEQUE))),
                factureRepository.count(filtres.and(mode(ModePaiement.ESPECE)))
        );
    }

    private Specification<Facture> mode(ModePaiement modePaiement) {
        return (racine, requete, cb) ->
                cb.equal(racine.join("paiement").get("modePaiement"), modePaiement);
    }

    @Transactional(readOnly = true)
    public List<DemandeFacturationResponse> listerDemandesValidees(
            String recherche,
            String ordre
    ) {
        boolean recent = "RECENT".equalsIgnoreCase(
                ordre == null ? "" : ordre.trim()
        );

        List<DemandeClient> demandes = recent
                ? demandeRepository.findByStatutOrderByDateModificationDesc(
                        StatutDemande.VALIDEE
                )
                : demandeRepository.findByStatutOrderByDateModificationAsc(
                        StatutDemande.VALIDEE
                );

        String terme = recherche == null
                ? ""
                : recherche.trim().toUpperCase(Locale.ROOT);

        return demandes.stream()
                .filter(this::estDemandeReguliereFacturable)
                .filter(demande -> paiementRepository.existsByDemandeIdAndStatut(
                        demande.getId(), StatutPaiement.CONFIRME))
                .map(this::versDemandeFacturation)
                .filter(reponse -> terme.isBlank()
                        || contient(reponse.referenceDemande(), terme)
                        || contient(reponse.cin(), terme)
                )
                .toList();
    }

    @Transactional
    public FactureResponse genererPourDemande(Long demandeId) {
        DemandeClient demande = chargerDemandeValidee(demandeId);
        Paiement paiement = chargerPaiementConfirme(demandeId);

        Facture existante = factureRepository
                .findByPaiementId(paiement.getId())
                .orElse(null);
        if (existante != null) {
            return FactureResponse.depuis(existante);
        }

        DecomptePaiementDemande decompte =
                DecomptePaiementDemande.depuis(demande);
        TarifParking tarif = decompte.tarifParking();

        BigDecimal tauxTva = tarif.getTauxTVA();
        Facture facture = new Facture(
                genererNumeroFacture(),
                paiement
        );

        facture.ajouterLigne(new LigneFacture(
                TypeLigneFacture.ABONNEMENT,
                "Abonnement parking " + tarif.getForfait().getLibelle()
                        + " - " + tarif.getDureeEnMois() + " mois",
                1,
                convertirTtcEnHt(
                        decompte.montantAbonnementTTC(),
                        tauxTva
                ),
                tauxTva
        ));

        if (decompte.fraisCarteTTC().signum() > 0) {
            facture.ajouterLigne(new LigneFacture(
                    TypeLigneFacture.CARTE_ACCES,
                    "Frais d'émission de la carte RFID sans contact",
                    1,
                    convertirTtcEnHt(
                            decompte.fraisCarteTTC(),
                            tauxTva
                    ),
                    tauxTva
            ));
        }

        facture.emettre();
        return FactureResponse.depuis(
                factureRepository.save(facture)
        );
    }

    @Transactional(readOnly = true)
    public FactureResponse consulter(Long factureId) {
        return FactureResponse.depuis(
                factureRepository.findById(factureId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Facture introuvable"
                        ))
        );
    }

    private DemandeFacturationResponse versDemandeFacturation(
            DemandeClient demande
    ) {
        DemandeClient demandeReelle = (DemandeClient) Hibernate.unproxy(
                demande
        );
        if (!estDemandeReguliereFacturable(demandeReelle)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "La facturation de ce type de demande n'est pas encore disponible"
            );
        }

        Paiement paiement = chargerPaiementConfirme(demande.getId());
        Facture facture = factureRepository
                .findByPaiementId(paiement.getId())
                .orElse(null);
        return DemandeFacturationResponse.depuis(
                demandeReelle,
                paiement,
                facture
        );
    }

    private DemandeClient chargerDemandeValidee(
            Long demandeId
    ) {
        DemandeClient demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Demande introuvable"
                ));

        DemandeClient demandeReelle = (DemandeClient) Hibernate.unproxy(
                demande
        );
        if (!estDemandeReguliereFacturable(demandeReelle)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "La facturation de ce type de demande n'est pas encore disponible"
            );
        }

        boolean resultatGenere =
                demandeReelle instanceof DemandeNouvelAbonnementRegulier nouvelle
                        ? nouvelle.getAbonnementGenere() != null
                        : ((DemandeRenouvellementRegulier) demandeReelle)
                                .getPeriodeGeneree() != null;
        if (demandeReelle.getStatut() != StatutDemande.VALIDEE
                || !resultatGenere) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La demande doit être validée et générer son abonnement ou sa période"
            );
        }
        return demandeReelle;
    }

    private boolean estDemandeReguliereFacturable(DemandeClient demande) {
        Object demandeReelle = Hibernate.unproxy(demande);
        return demandeReelle instanceof DemandeNouvelAbonnementRegulier
                || demandeReelle instanceof DemandeRenouvellementRegulier;
    }

    private Paiement chargerPaiementConfirme(Long demandeId) {
        return paiementRepository
                .findByDemandeIdAndStatut(
                        demandeId,
                        StatutPaiement.CONFIRME
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Aucun paiement confirmé n'est associé à la demande"
                ));
    }

    private BigDecimal convertirTtcEnHt(
            BigDecimal montantTtc,
            BigDecimal tauxTva
    ) {
        BigDecimal coefficient = BigDecimal.ONE.add(
                tauxTva.divide(CENT, 6, RoundingMode.HALF_UP)
        );
        return montantTtc.divide(
                coefficient,
                2,
                RoundingMode.HALF_UP
        );
    }

    private String genererNumeroFacture() {
        String numero;
        do {
            numero = "FACT-RRM-"
                    + LocalDate.now().format(FORMAT_DATE)
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (factureRepository.existsByNumero(numero));
        return numero;
    }

    private boolean contient(String valeur, String terme) {
        return valeur != null
                && valeur.toUpperCase(Locale.ROOT).contains(terme);
    }
}
