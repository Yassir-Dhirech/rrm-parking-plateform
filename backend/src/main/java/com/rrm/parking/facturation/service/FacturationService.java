package com.rrm.parking.facturation.service;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.demande.dto.response.DemandeFacturationResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.dto.response.FactureResponse;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.paiement.model.DecomptePaiementDemande;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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
