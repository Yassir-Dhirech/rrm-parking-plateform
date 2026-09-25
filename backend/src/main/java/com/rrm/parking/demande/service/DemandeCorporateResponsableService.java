package com.rrm.parking.demande.service;

import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.abonnement.repository.AbonnementEntrepriseRepository;
import com.rrm.parking.abonnement.repository.AbonnementRepository;
import com.rrm.parking.abonnement.repository.PeriodeAbonnementRepository;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.contrat.repository.ContratCorporateRepository;
import com.rrm.parking.demande.dto.response.DecisionCorporateResponse;
import com.rrm.parking.demande.dto.response.ConvocationCorporateResponse;
import com.rrm.parking.demande.dto.response.DemandeCorporateDetailResponse;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.OrigineTransition;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.event.DemandeCorporateRefuseeEvent;
import com.rrm.parking.demande.event.DemandeCorporateConvoqueeEvent;
import com.rrm.parking.demande.event.DemandeCorporateFinaliseeEvent;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.EnumSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeCorporateResponsableService {

    private final DemandeNouveauContratCorporateRepository demandeRepository;
    private final ContratCorporateRepository contratRepository;
    private final PaiementRepository paiementRepository;
    private final FactureRepository factureRepository;
    private final AbonnementEntrepriseRepository abonnementRepository;
    private final AbonnementRepository abonnementGeneriqueRepository;
    private final PeriodeAbonnementRepository periodeRepository;
    private final CarteAccesRepository carteRepository;
    private final DemandeOperationnelleRepository operationRepository;
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
        EnumSet<StatutDemande> statutsATraiter = EnumSet.of(
                StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE,
                StatutDemande.VALIDEE,
                StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE,
                StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE,
                StatutDemande.EN_ATTENTE_FACTURATION,
                StatutDemande.EN_PREPARATION_CARTES,
                StatutDemande.PRETE_A_FINALISER
        );
        List<DemandeNouveauContratCorporate> demandes = recentes
                ? demandeRepository.findByStatutInOrderByDateSoumissionDesc(
                        statutsATraiter
                )
                : demandeRepository.findByStatutInOrderByDateSoumissionAsc(
                        statutsATraiter
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
        Hibernate.initialize(demande.getPaiementCorporate());
        Hibernate.initialize(demande.getFactureGeneree());
        Hibernate.initialize(demande.getAbonnementGenere());
        return construireDetail(demande);
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

    @Transactional
    public ConvocationCorporateResponse convoquer(
            Long demandeId,
            Long responsableId
    ) {
        DemandeNouveauContratCorporate demande = demandeRepository
                .findByIdPourDecision(demandeId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande corporate introuvable"
                ));

        if (demande.getStatut() != StatutDemande.VALIDEE) {
            throw new ConflitMetierException(
                    "La demande corporate n'est pas prête pour la convocation"
            );
        }
        if (demande.getContratGenere() == null) {
            throw new ConflitMetierException(
                    "Le contrat corporate doit être généré avant la convocation"
            );
        }

        Utilisateur responsable = chargerResponsable(responsableId);
        ClientEntreprise entreprise = (ClientEntreprise) Hibernate.unproxy(
                demande.getClient()
        );

        demande.convoquerClient(responsable);
        demandeRepository.save(demande);

        eventPublisher.publishEvent(
                new DemandeCorporateConvoqueeEvent(
                        demande.getReference(),
                        entreprise.getRaisonSociale(),
                        nomRepresentant(entreprise),
                        entreprise.getEmail(),
                        demande.getParking().getNom(),
                        demande.getMontantTotalTtc(),
                        demande.getDateConvocation()
                )
        );

        return new ConvocationCorporateResponse(
                demande.getId(),
                demande.getReference(),
                demande.getStatut(),
                demande.getDateConvocation(),
                entreprise.getEmail(),
                "Client invité au siège par e-mail pour le paiement et la signature"
        );
    }

    @Transactional
    public DemandeCorporateDetailResponse enregistrerPaiement(
            Long demandeId,
            Long responsableId,
            EnregistrementPaiementRequest requete
    ) {
        DemandeNouveauContratCorporate demande = chargerPourAction(demandeId);
        if (demande.getStatut() != StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE) {
            throw new ConflitMetierException(
                    "La demande n'est pas en attente du paiement et de la signature"
            );
        }
        if (paiementRepository.existsByDemandeIdAndStatut(
                demandeId,
                StatutPaiement.CONFIRME
        )) {
            throw new ConflitMetierException(
                    "Un paiement confirmé existe déjà pour cette demande"
            );
        }
        if (requete == null) {
            throw new IllegalArgumentException("Les informations du chèque sont obligatoires");
        }
        if (requete.dateEmissionCheque() == null
                || requete.dateEmissionCheque().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "La date d'émission du chèque est obligatoire et ne peut pas être future"
            );
        }

        Utilisateur responsable = chargerResponsable(responsableId);
        Paiement paiement = Paiement.creerPaiementCheque(
                genererReferencePaiement(),
                demande,
                demande.getMontantTotalTtc(),
                requete.numeroCheque(),
                requete.banqueCheque(),
                requete.dateEmissionCheque()
        );
        paiement.confirmer(responsable);
        paiementRepository.save(paiement);

        demande.enregistrerPaiementEtRemiseContrat(paiement, responsable);
        demandeRepository.save(demande);
        return construireDetail(demande);
    }

    @Transactional
    public DemandeCorporateDetailResponse declarerRetourContrat(
            Long demandeId,
            Long responsableId
    ) {
        DemandeNouveauContratCorporate demande = chargerPourAction(demandeId);
        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE) {
            throw new ConflitMetierException(
                    "La demande n'est pas en attente du contrat légalisé"
            );
        }
        demande.declarerRetourContratLegalise(
                chargerResponsable(responsableId)
        );
        demandeRepository.save(demande);
        return construireDetail(demande);
    }

    @Transactional
    public DemandeCorporateDetailResponse genererFactureEtCartes(
            Long demandeId,
            Long responsableId
    ) {
        DemandeNouveauContratCorporate demande = chargerPourAction(demandeId);
        if (demande.getStatut() != StatutDemande.EN_ATTENTE_FACTURATION) {
            throw new ConflitMetierException(
                    "La demande n'est pas prête pour la facturation"
            );
        }
        if (demande.getPaiementCorporate() == null
                || demande.getPaiementCorporate().getStatut()
                != StatutPaiement.CONFIRME) {
            throw new ConflitMetierException(
                    "Un paiement par chèque confirmé est obligatoire"
            );
        }
        if (demande.getContratGenere() == null) {
            throw new ConflitMetierException("Le contrat corporate est introuvable");
        }

        Utilisateur responsable = chargerResponsable(responsableId);
        LocalDate dateDebut = LocalDate.now();
        LocalDate dateFin = dateDebut.plusMonths(240).minusDays(1);
        BigDecimal tauxTva = new BigDecimal("20.00");

        demande.getContratGenere().activerApresSignatureExterne(
                dateDebut,
                dateFin
        );
        contratRepository.save(demande.getContratGenere());

        AbonnementEntreprise abonnement = new AbonnementEntreprise(
                genererReferenceAbonnement(),
                demande.getContratGenere()
        );
        abonnement.activer();
        abonnement = abonnementRepository.save(abonnement);

        PeriodeAbonnement periode = new PeriodeAbonnement(
                1,
                dateDebut,
                dateFin,
                convertirTtcEnHt(demande.getMontantTotalTtc(), tauxTva),
                tauxTva,
                abonnement
        );
        periode.activer();
        abonnement.ajouterPeriode(periode);
        periode = periodeRepository.save(periode);

        Paiement paiement = demande.getPaiementCorporate();
        paiement.associerPeriodeAbonnement(periode);
        paiementRepository.save(paiement);

        Facture facture = creerFactureCorporate(demande, paiement, tauxTva);
        facture = factureRepository.save(facture);

        List<String> immatriculations = demande.getImmatriculationsDeclarees()
                .stream().sorted().toList();
        for (int index = 0; index < demande.getNombrePlaces(); index++) {
            String immatriculation = index < immatriculations.size()
                    ? immatriculations.get(index)
                    : null;
            CarteAcces carte = carteRepository.save(new CarteAcces(
                    genererReferenceCarte(),
                    abonnement,
                    immatriculation
            ));
            DemandeOperationnelle impression = new DemandeOperationnelle(
                    genererReferenceOperation("IMP"),
                    carte,
                    TypeOperationCarte.IMPRESSION,
                    "Impression de la carte corporate " + (index + 1)
                            + "/" + demande.getNombrePlaces(),
                    responsable
            );
            impression.definirDemandeClientSource(demande);
            operationRepository.save(impression);
        }

        demande.enregistrerFacturation(facture, abonnement, responsable);
        demandeRepository.save(demande);
        return construireDetail(demande);
    }

    @Transactional
    public DemandeCorporateDetailResponse finaliser(
            Long demandeId,
            Long responsableId
    ) {
        DemandeNouveauContratCorporate demande = chargerPourAction(demandeId);
        if (demande.getStatut() != StatutDemande.PRETE_A_FINALISER) {
            throw new ConflitMetierException(
                    "Toutes les cartes doivent être activées et testées avant la finalisation"
            );
        }
        List<CarteAcces> cartes = cartesCorporate(demande);
        if (cartes.size() != demande.getNombrePlaces()
                || cartes.stream().anyMatch(carte ->
                carte.getStatut() != StatutCarteAcces.ACTIVE)) {
            throw new ConflitMetierException(
                    "Toutes les cartes corporate doivent être actives"
            );
        }

        Utilisateur responsable = chargerResponsable(responsableId);
        demande.finaliser(responsable);
        demandeRepository.save(demande);
        ClientEntreprise entreprise = (ClientEntreprise) Hibernate.unproxy(
                demande.getClient()
        );
        eventPublisher.publishEvent(new DemandeCorporateFinaliseeEvent(
                demande.getReference(),
                entreprise.getRaisonSociale(),
                nomRepresentant(entreprise),
                entreprise.getEmail(),
                demande.getParking().getNom(),
                demande.getNombrePlaces(),
                demande.getFactureGeneree().getNumero(),
                demande.getDateActivationCartes()
        ));
        return construireDetail(demande);
    }

    private DemandeNouveauContratCorporate chargerPourAction(Long demandeId) {
        return demandeRepository.findByIdPourDecision(demandeId)
                .orElseThrow(() -> new RessourceIntrouvableException(
                        "Demande corporate introuvable"
                ));
    }

    private DemandeCorporateDetailResponse construireDetail(
            DemandeNouveauContratCorporate demande
    ) {
        List<CarteAcces> cartes = cartesCorporate(demande);
        int actives = (int) cartes.stream()
                .filter(carte -> carte.getStatut() == StatutCarteAcces.ACTIVE)
                .count();
        return DemandeCorporateDetailResponse.depuis(
                demande,
                cartes.size(),
                actives
        );
    }

    private List<CarteAcces> cartesCorporate(
            DemandeNouveauContratCorporate demande
    ) {
        return demande.getAbonnementGenere() == null
                ? List.of()
                : carteRepository.findByAbonnementIdOrderByIdAsc(
                demande.getAbonnementGenere().getId()
        );
    }

    private Facture creerFactureCorporate(
            DemandeNouveauContratCorporate demande,
            Paiement paiement,
            BigDecimal tauxTva
    ) {
        Facture facture = new Facture(genererNumeroFacture(), paiement);
        facture.ajouterLigne(new LigneFacture(
                TypeLigneFacture.ABONNEMENT,
                "Abonnement corporate 20 ans - "
                        + demande.getNombrePlaces() + " place(s)",
                1,
                convertirTtcEnHt(demande.getMontantAbonnementTtc(), tauxTva),
                tauxTva
        ));
        facture.ajouterLigne(new LigneFacture(
                TypeLigneFacture.CARTE_ACCES,
                demande.getNombrePlaces() + " carte(s) RFID corporate",
                1,
                convertirTtcEnHt(demande.getFraisCartesTtc(), tauxTva),
                tauxTva
        ));
        facture.emettre();
        if (facture.getTotalTtc().compareTo(demande.getMontantTotalTtc()) != 0) {
            throw new ConflitMetierException(
                    "Le total de la facture corporate ne correspond pas au paiement"
            );
        }
        return facture;
    }

    private BigDecimal convertirTtcEnHt(BigDecimal ttc, BigDecimal tauxTva) {
        return ttc.divide(
                BigDecimal.ONE.add(tauxTva.movePointLeft(2)),
                2,
                RoundingMode.HALF_UP
        );
    }

    private String genererReferencePaiement() {
        String reference;
        do {
            reference = genererReference("PAY-CORP");
        } while (paiementRepository.existsByReference(reference));
        return reference;
    }

    private String genererNumeroFacture() {
        String reference;
        do {
            reference = genererReference("FACT-RRM");
        } while (factureRepository.existsByNumero(reference));
        return reference;
    }

    private String genererReferenceCarte() {
        String reference;
        do {
            reference = genererReference("CARTE-CORP");
        } while (carteRepository.existsByReference(reference));
        return reference;
    }

    private String genererReferenceOperation(String prefixe) {
        String reference;
        do {
            reference = genererReference(prefixe);
        } while (operationRepository.existsByReference(reference));
        return reference;
    }

    private String genererReference(
            String prefixe
    ) {
        return prefixe + "-"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID().toString()
                .substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String genererReferenceAbonnement() {
        String reference;
        do {
            reference = genererReference("ABO-CORP");
        } while (abonnementGeneriqueRepository
                .existsByReferenceIgnoreCase(reference));
        return reference;
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
