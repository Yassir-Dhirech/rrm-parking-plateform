package com.rrm.parking.cheque.service;

import com.rrm.parking.abonnement.entity.Abonnement;
import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.carte.entity.CarteAcces;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.CarteAccesRepository;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.cheque.dto.ChequeCandidatResponse;
import com.rrm.parking.cheque.dto.DeclarationRejetChequeRequest;
import com.rrm.parking.cheque.dto.DossierRejetChequeResponse;
import com.rrm.parking.cheque.dto.OperationRejetChequeResponse;
import com.rrm.parking.cheque.dto.RegularisationChequeRequest;
import com.rrm.parking.cheque.dto.NotificationRejetResponse;
import com.rrm.parking.cheque.entity.DossierRejetCheque;
import com.rrm.parking.cheque.enums.StatutRejetCheque;
import com.rrm.parking.cheque.repository.DossierRejetChequeRepository;
import com.rrm.parking.cheque.event.AccesRejetChequeEvent;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.facturation.entity.LigneFacture;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.facturation.enums.StatutFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.facturation.repository.RecuRepository;
import com.rrm.parking.paiement.event.PaiementConfirmeEvent;
import com.rrm.parking.notification.enums.CanalNotification;
import com.rrm.parking.notification.enums.TypeNotification;
import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.repository.NotificationRepository;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RejetChequeService {
    private final PaiementRepository paiements;
    private final DossierRejetChequeRepository dossiers;
    private final UtilisateurRepository utilisateurs;
    private final CarteAccesRepository cartes;
    private final DemandeOperationnelleRepository operations;
    private final FactureRepository factures;
    private final RecuRepository recus;
    private final AffectationAgentParkingRepository affectationsAgents;
    private final NotificationRepository notifications;
    private final ApplicationEventPublisher evenements;

    @Transactional(readOnly = true)
    public Page<ChequeCandidatResponse> rechercher(String recherche, int page) {
        if (page < 0) {
            throw new IllegalArgumentException("La page doit être positive");
        }
        String terme = recherche == null ? "" : recherche.trim();
        if (terme.length() > 100) {
            throw new IllegalArgumentException("La recherche est trop longue");
        }
        Specification<Paiement> specification = (racine, requete, cb) -> cb.and(
                cb.equal(racine.get("modePaiement"), ModePaiement.CHEQUE),
                cb.equal(racine.get("statut"), StatutPaiement.CONFIRME),
                cb.isNotNull(racine.get("periodeAbonnement"))
        );
        if (!terme.isEmpty()) {
            String motif = "%" + terme.toLowerCase(Locale.ROOT)
                    .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            specification = specification.and((racine, requete, cb) -> {
                var periode = racine.join("periodeAbonnement");
                var client = racine.join("demande").join("client");
                var particuliers = requete.subquery(Long.class);
                var particulier = particuliers.from(ClientParticulier.class);
                particuliers.select(particulier.get("id")).where(
                        cb.equal(particulier.get("id"), client.get("id")),
                        cb.or(
                                cb.like(cb.lower(particulier.get("nom")), motif, '!'),
                                cb.like(cb.lower(particulier.get("prenom")), motif, '!'),
                                cb.like(cb.lower(cb.concat(
                                        cb.concat(particulier.get("prenom"), " "),
                                        particulier.get("nom"))), motif, '!')
                        )
                );
                var entreprises = requete.subquery(Long.class);
                var entreprise = entreprises.from(ClientEntreprise.class);
                entreprises.select(entreprise.get("id")).where(
                        cb.equal(entreprise.get("id"), client.get("id")),
                        cb.like(cb.lower(entreprise.get("raisonSociale")), motif, '!')
                );
                return cb.or(
                        cb.like(cb.lower(racine.get("numeroCheque")), motif, '!'),
                        cb.like(cb.lower(racine.get("reference")), motif, '!'),
                        cb.like(cb.lower(periode.get("abonnement").get("reference")), motif, '!'),
                        cb.exists(particuliers),
                        cb.exists(entreprises)
                );
            });
        }
        return paiements.findAll(specification, PageRequest.of(
                        page, 20, Sort.by(Sort.Direction.DESC, "dateCreation")))
                .map(this::versCandidat);
    }

    @Transactional
    public DossierRejetChequeResponse declarer(
            DeclarationRejetChequeRequest requete, Long comptableId) {
        if (requete.dateLettreBanque().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("La lettre ne peut pas être datée dans le futur");
        }
        Paiement paiement = paiements.findByIdPourMiseAJour(requete.paiementId())
                .orElseThrow(() -> new RessourceIntrouvableException("Paiement introuvable"));
        if (paiement.getModePaiement() != ModePaiement.CHEQUE
                || paiement.getStatut() != StatutPaiement.CONFIRME
                || paiement.getPeriodeAbonnement() == null) {
            throw new ConflitMetierException(
                    "Le chèque doit concerner un paiement confirmé et un abonnement généré");
        }
        Abonnement abonnement = paiement.getPeriodeAbonnement().getAbonnement();
        if (abonnement.getStatut() != StatutAbonnement.ACTIF
                || dossiers.existsByPaiementInitialId(paiement.getId())
                || dossiers.existsByAbonnementIdAndStatutIn(abonnement.getId(), List.of(
                        StatutRejetCheque.EN_ATTENTE_VALIDATION,
                        StatutRejetCheque.BLOCAGE_EN_COURS,
                        StatutRejetCheque.BLOQUE,
                        StatutRejetCheque.REGULARISATION_ENREGISTREE,
                        StatutRejetCheque.REACTIVATION_EN_COURS))) {
            throw new ConflitMetierException("Un dossier est déjà ouvert ou l'abonnement n'est pas actif");
        }
        Utilisateur comptable = utilisateur(comptableId);
        DossierRejetCheque dossier = new DossierRejetCheque(
                paiement, abonnement, requete.dateLettreBanque(),
                requete.constatComptable(), comptable);
        return versDossier(dossiers.save(dossier));
    }

    @Transactional(readOnly = true)
    public List<DossierRejetChequeResponse> lister() {
        return dossiers.findAll(Sort.by(Sort.Direction.DESC, "dateDeclaration"))
                .stream().map(this::versDossier).toList();
    }

    @Transactional(readOnly = true)
    public List<DossierRejetChequeResponse> listerPourAgent(Long agentId) {
        Long parkingId = parkingAgent(agentId);
        return dossiers.findAll(Sort.by(Sort.Direction.DESC, "dateDeclaration"))
                .stream()
                .filter(dossier -> (dossier.getStatut() == StatutRejetCheque.BLOQUE
                        || dossier.getStatut() == StatutRejetCheque.REGULARISATION_ENREGISTREE
                        || dossier.getStatut() == StatutRejetCheque.REACTIVATION_EN_COURS)
                        && parkingId.equals(parkingId(dossier.getPaiementInitial())))
                .map(this::versDossier).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationRejetResponse> notificationsPourUtilisateur(Long utilisateurId) {
        return notifications.findByUtilisateurDestinataireIdOrderByDateCreationDesc(utilisateurId)
                .stream().filter(notification -> notification.getTypeNotification() == TypeNotification.CHEQUE_REJETE)
                .limit(10).map(NotificationRejetResponse::depuis).toList();
    }

    @Transactional
    public DossierRejetChequeResponse valider(Long dossierId, Long responsableId) {
        DossierRejetCheque dossier = chargerPourMiseAJour(dossierId);
        if (dossier.getStatut() != StatutRejetCheque.EN_ATTENTE_VALIDATION) {
            throw new ConflitMetierException("Ce dossier a déjà été traité");
        }
        Paiement initial = paiements.findByIdPourMiseAJour(dossier.getPaiementInitial().getId())
                .orElseThrow(() -> new RessourceIntrouvableException("Paiement initial introuvable"));
        Abonnement abonnement = dossier.getAbonnement();
        if (abonnement.getStatut() != StatutAbonnement.ACTIF) {
            throw new ConflitMetierException("L'abonnement n'est plus actif");
        }
        Facture factureInitiale = factures.findByPaiementId(dossier.getPaiementInitial().getId())
                .orElseThrow(() -> new ConflitMetierException(
                        "Générez la facture initiale avant de valider le rejet"));
        if (factureInitiale.getStatut() != StatutFacture.EMISE
                || factureInitiale.getTotalTtc().compareTo(dossier.getPaiementInitial().getMontant()) != 0) {
            throw new ConflitMetierException("La facture initiale émise doit correspondre au paiement rejeté");
        }
        Utilisateur responsable = utilisateur(responsableId);
        dossier.valider(responsable);
        dossier.enregistrerDocumentCorrectif(reference("COR"), factureInitiale);
        initial.rejeterCheque(
                "Rejet signalé par lettre bancaire du " + dossier.getDateLettreBanque(),
                responsable
        );
        abonnement.suspendre("Chèque non honoré : dossier " + dossier.getId());
        List<CarteAcces> cartesActives = cartes.findByAbonnementIdOrderByIdAsc(abonnement.getId())
                .stream().filter(carte -> carte.getStatut() == StatutCarteAcces.ACTIVE).toList();
        for (CarteAcces carte : cartesActives) {
            DemandeOperationnelle operation = new DemandeOperationnelle(
                    "BLC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT),
                    carte,
                    TypeOperationCarte.SUSPENSION,
                    "Chèque rejeté, dossier " + dossier.getId(),
                    responsable
            );
            operation.definirDossierRejetCheque(dossier);
            operations.save(operation);
        }
        if (cartesActives.isEmpty()) {
            dossier.cartesBloquees();
            notifierBlocageCartesTermine(dossier);
        }
        notifierUtilisateurs(dossier, "Cartes à désactiver", "La désactivation des cartes de l'abonnement "
                + abonnement.getReference() + " est demandée.", "SUPERVISEUR");
        informerClient(dossier, false);
        return versDossier(dossier);
    }

    @Transactional
    public DossierRejetChequeResponse confirmerBlocageCarte(Long dossierId,
                                                              Long operationId,
                                                              Long superviseurId) {
        DossierRejetCheque dossier = chargerPourMiseAJour(dossierId);
        if (dossier.getStatut() != StatutRejetCheque.BLOCAGE_EN_COURS) {
            throw new ConflitMetierException("Le dossier n'attend pas de blocage de carte");
        }
        DemandeOperationnelle operation = operations.findById(operationId)
                .orElseThrow(() -> new RessourceIntrouvableException("Opération introuvable"));
        if (operation.getTypeOperation() != TypeOperationCarte.SUSPENSION
                || operation.getDossierRejetCheque() == null
                || !dossierId.equals(operation.getDossierRejetCheque().getId())) {
            throw new ConflitMetierException("Cette opération ne concerne pas ce dossier");
        }
        Utilisateur superviseur = utilisateur(superviseurId);
        if (operation.getStatut() == com.rrm.parking.carte.enums.StatutDemandeOperationnelle.CREEE
                || operation.getStatut() == com.rrm.parking.carte.enums.StatutDemandeOperationnelle.AFFECTEE) {
            operation.prendreEnCharge(superviseur);
        }
        operation.terminerSuspension(superviseur);
        if (toutesOperationsTerminees(dossierId, TypeOperationCarte.SUSPENSION)) {
            dossier.cartesBloquees();
            notifierBlocageCartesTermine(dossier);
        }
        return versDossier(dossier);
    }

    private void notifierBlocageCartesTermine(DossierRejetCheque dossier) {
        notifierUtilisateurs(dossier, "Toutes les cartes sont désactivées",
                "Le superviseur a déclaré la désactivation de toutes les cartes de l'abonnement "
                        + dossier.getAbonnement().getReference()
                        + " (dossier de rejet de chèque n° " + dossier.getId()
                        + "). L'abonnement attend le paiement de régularisation.",
                "RESPONSABLE_STATIONNEMENT");
    }

    @Transactional(readOnly = true)
    public List<OperationRejetChequeResponse> operationsABloquer(Long dossierId) {
        return operations.findByDossierRejetChequeIdAndTypeOperationAndStatutInOrderByIdAsc(
                        dossierId, TypeOperationCarte.SUSPENSION, List.of(
                                com.rrm.parking.carte.enums.StatutDemandeOperationnelle.CREEE,
                                com.rrm.parking.carte.enums.StatutDemandeOperationnelle.AFFECTEE,
                                com.rrm.parking.carte.enums.StatutDemandeOperationnelle.EN_COURS))
                .stream()
                .map(OperationRejetChequeResponse::depuis).toList();
    }

    @Transactional
    public DossierRejetChequeResponse regulariser(Long dossierId, RegularisationChequeRequest requete,
                                                  Long agentId) {
        DossierRejetCheque dossier = chargerPourMiseAJour(dossierId);
        if (dossier.getStatut() != StatutRejetCheque.BLOQUE) {
            throw new ConflitMetierException("Toutes les cartes doivent être désactivées avant le nouveau paiement");
        }
        var initial = dossier.getPaiementInitial();
        if (!parkingAgent(agentId).equals(parkingId(initial))) {
            throw new ConflitMetierException("Cet abonnement relève d'un autre parking");
        }
        Utilisateur agent = utilisateur(agentId);
        Paiement nouveau;
        if (requete.modePaiement() == ModePaiement.ESPECE) {
            if (texte(requete.numeroCheque()) || texte(requete.banqueCheque())
                    || requete.dateEmissionCheque() != null || Boolean.TRUE.equals(requete.chequeCertifie())) {
                throw new IllegalArgumentException("Aucune information de chèque n'est permise pour les espèces");
            }
            nouveau = Paiement.creerPaiementEspece(reference("PAY"), initial.getDemande(), initial.getMontant());
        } else if (requete.modePaiement() == ModePaiement.CHEQUE) {
            if (!Boolean.TRUE.equals(requete.chequeCertifie())) {
                throw new IllegalArgumentException("Le chèque de remplacement doit être certifié");
            }
            if (requete.dateEmissionCheque() == null || requete.dateEmissionCheque().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("La date d'émission du chèque est invalide");
            }
            if (initial.getNumeroCheque().equalsIgnoreCase(requete.numeroCheque() == null
                    ? "" : requete.numeroCheque().trim())) {
                throw new ConflitMetierException("Le chèque rejeté ne peut pas servir au nouveau paiement");
            }
            nouveau = Paiement.creerPaiementCheque(reference("PAY"), initial.getDemande(),
                    initial.getMontant(), requete.numeroCheque(), requete.banqueCheque(), requete.dateEmissionCheque());
            nouveau.marquerChequeCertifie();
        } else {
            throw new IllegalArgumentException("Mode de régularisation non pris en charge");
        }
        // La réception au guichet ne confirme plus le paiement de remplacement.
        // Seul le responsable peut l'accepter et créer sa facture.
        paiements.save(nouveau);
        dossier.regulariser(nouveau, agent);
        notifierUtilisateurs(dossier, "Paiement de régularisation à valider",
                "Nouveau paiement " + nouveau.getReference() + " pour l'abonnement "
                        + dossier.getAbonnement().getReference() + ". Vérifiez et validez ce paiement.",
                "RESPONSABLE_STATIONNEMENT");
        return versDossier(dossier);
    }

    @Transactional
    public DossierRejetChequeResponse reactiver(Long dossierId, Long responsableId) {
        DossierRejetCheque dossier = chargerPourMiseAJour(dossierId);
        if (dossier.getStatut() != StatutRejetCheque.REGULARISATION_ENREGISTREE
                || dossier.getPaiementRegularisation() == null) {
            throw new ConflitMetierException("Un paiement de remplacement enregistré est nécessaire");
        }
        List<CarteAcces> liste = cartes.findByAbonnementIdOrderByIdAsc(dossier.getAbonnement().getId());
        List<CarteAcces> aReactiver = new ArrayList<>();
        for (CarteAcces carte : liste) {
            if (carte.getStatut() == StatutCarteAcces.SUSPENDUE) {
                aReactiver.add(carte);
            }
        }
        if (aReactiver.isEmpty()) {
            throw new ConflitMetierException("Aucune carte suspendue à réactiver : vérifiez le dossier avant de valider le paiement");
        }
        Utilisateur responsable = utilisateur(responsableId);
        Paiement nouveau = dossier.getPaiementRegularisation();
        if (nouveau.getStatut() == StatutPaiement.EN_ATTENTE) {
            confirmerEtFacturerRegularisation(dossier, nouveau, responsable);
        } else if (nouveau.getStatut() != StatutPaiement.CONFIRME
                || !factures.existsByPaiementId(nouveau.getId())) {
            throw new ConflitMetierException("Paiement de remplacement non validable");
        }
        dossier.getAbonnement().reactiver();
        dossier.reactiver();
        for (CarteAcces carte : aReactiver) {
            DemandeOperationnelle operation = new DemandeOperationnelle(reference("RAC"), carte,
                    TypeOperationCarte.ACTIVATION, "Réactivation après rejet de chèque, dossier "
                            + dossier.getId(), responsable);
            operation.definirDossierRejetCheque(dossier);
            operations.save(operation);
        }
        notifierUtilisateurs(dossier, "Abonnement réactivé",
                "La réactivation de l'abonnement " + dossier.getAbonnement().getReference()
                        + " a été validée. Cartes à réactiver : " + aReactiver.size() + ".",
                "SUPERVISEUR", "COMPTABLE");
        return versDossier(dossier);
    }

    private void confirmerEtFacturerRegularisation(DossierRejetCheque dossier,
                                                     Paiement nouveau,
                                                     Utilisateur responsable) {
        Facture originale = factures.findByPaiementId(dossier.getPaiementInitial().getId())
                .orElseThrow(() -> new ConflitMetierException("Facture initiale introuvable"));
        if (originale.getStatut() != StatutFacture.EMISE
                || originale.getTotalTtc().compareTo(nouveau.getMontant()) != 0) {
            throw new ConflitMetierException("La facture initiale ne correspond pas au paiement");
        }
        nouveau.confirmer(responsable);
        Facture nouvelle = new Facture(reference("FAC"), nouveau);
        for (LigneFacture ligne : originale.getLignes()) {
            nouvelle.ajouterLigne(new LigneFacture(ligne.getTypeLigne(), ligne.getDescription(),
                    ligne.getQuantite(), ligne.getPrixUnitaireHt(), ligne.getTauxTva()));
        }
        nouvelle.emettre();
        if (nouvelle.getTotalTtc().compareTo(nouveau.getMontant()) != 0) {
            throw new ConflitMetierException("Le total TTC de la nouvelle facture diffère du paiement");
        }
        factures.save(nouvelle);
        Recu recu = recus.save(new Recu(reference("REC"), nouveau));
        evenements.publishEvent(new PaiementConfirmeEvent(recu.getId()));
    }

    @Transactional(readOnly = true)
    public List<OperationRejetChequeResponse> operationsAReactiver(Long dossierId) {
        return operations.findByDossierRejetChequeIdAndTypeOperationAndStatutInOrderByIdAsc(
                        dossierId, TypeOperationCarte.ACTIVATION, statutsEnCours())
                .stream().map(OperationRejetChequeResponse::depuis).toList();
    }

    @Transactional
    public DossierRejetChequeResponse confirmerActivationCarte(Long dossierId, Long operationId,
                                                               Long superviseurId) {
        DossierRejetCheque dossier = chargerPourMiseAJour(dossierId);
        if (dossier.getStatut() != StatutRejetCheque.REACTIVATION_EN_COURS) {
            throw new ConflitMetierException("Le dossier n'attend pas de réactivation de carte");
        }
        DemandeOperationnelle operation = operations.findById(operationId)
                .orElseThrow(() -> new RessourceIntrouvableException("Opération introuvable"));
        if (operation.getTypeOperation() != TypeOperationCarte.ACTIVATION
                || operation.getDossierRejetCheque() == null
                || !dossierId.equals(operation.getDossierRejetCheque().getId())) {
            throw new ConflitMetierException("Cette opération ne concerne pas ce dossier");
        }
        Utilisateur superviseur = utilisateur(superviseurId);
        if (operation.getStatut() == com.rrm.parking.carte.enums.StatutDemandeOperationnelle.CREEE
                || operation.getStatut() == com.rrm.parking.carte.enums.StatutDemandeOperationnelle.AFFECTEE) {
            operation.prendreEnCharge(superviseur);
        }
        operation.terminerActivation(superviseur);
        if (toutesOperationsTerminees(dossierId, TypeOperationCarte.ACTIVATION)) {
            dossier.cartesReactivees();
            notifierFin(dossier);
        }
        return versDossier(dossier);
    }

    private void notifierFin(DossierRejetCheque dossier) {
        notifierUtilisateurs(dossier, "Toutes les cartes réactivées",
                "L'accès à l'abonnement " + dossier.getAbonnement().getReference()
                        + " a été rétabli sur toutes ses cartes.", "RESPONSABLE_STATIONNEMENT", "COMPTABLE");
        informerClient(dossier, true);
    }

    private void informerClient(DossierRejetCheque dossier, boolean retabli) {
        var client = Hibernate.unproxy(dossier.getPaiementInitial().getDemande().getClient());
        String nom = client instanceof ClientParticulier particulier
                ? particulier.getNomComplet() : client instanceof ClientEntreprise entreprise
                ? entreprise.getRaisonSociale() : "Client";
        evenements.publishEvent(new AccesRejetChequeEvent(
                dossier.getPaiementInitial().getDemande().getClient().getEmail(),
                nom, dossier.getAbonnement().getReference(), retabli));
    }

    private List<com.rrm.parking.carte.enums.StatutDemandeOperationnelle> statutsEnCours() {
        return List.of(com.rrm.parking.carte.enums.StatutDemandeOperationnelle.CREEE,
                com.rrm.parking.carte.enums.StatutDemandeOperationnelle.AFFECTEE,
                com.rrm.parking.carte.enums.StatutDemandeOperationnelle.EN_COURS);
    }

    private boolean toutesOperationsTerminees(Long dossierId, TypeOperationCarte type) {
        var concernees = operations.findByDossierRejetChequeIdAndTypeOperationOrderByIdAsc(dossierId, type);
        return concernees.stream().allMatch(operation ->
                operation.getStatut() == com.rrm.parking.carte.enums.StatutDemandeOperationnelle.TERMINEE
                && operation.getCarteAcces().getStatut() ==
                    (type == TypeOperationCarte.SUSPENSION ? StatutCarteAcces.SUSPENDUE : StatutCarteAcces.ACTIVE));
    }

    private DossierRejetChequeResponse versDossier(DossierRejetCheque dossier) {
        String numero = dossier.getPaiementRegularisation() == null ? null
                : factures.findByPaiementId(dossier.getPaiementRegularisation().getId())
                .map(Facture::getNumero).orElse(null);
        Facture initiale = factures.findByPaiementId(dossier.getPaiementInitial().getId()).orElse(null);
        return DossierRejetChequeResponse.depuis(dossier, numero, initiale);
    }

    private Long parkingId(Paiement paiement) {
        var demande = Hibernate.unproxy(paiement.getDemande());
        if (demande instanceof com.rrm.parking.demande.entity.DemandeNouveauContratCorporate corporate) {
            return corporate.getParking().getId();
        }
        if (demande instanceof com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier reguliere) {
            return reguliere.getTarifParking().getParking().getId();
        }
        if (demande instanceof com.rrm.parking.demande.entity.DemandeRenouvellementRegulier renouvellement) {
            return renouvellement.getTarifParking().getParking().getId();
        }
        throw new ConflitMetierException("Parking de la demande non identifiable");
    }

    private Long parkingAgent(Long agentId) {
        LocalDate maintenant = LocalDate.now();
        return affectationsAgents.findByUtilisateurIdAndActiveTrue(agentId)
                .filter(affectation -> !affectation.getDateDebut().isAfter(maintenant)
                        && (affectation.getDateFin() == null
                        || !affectation.getDateFin().isBefore(maintenant)))
                .map(affectation -> affectation.getParking().getId())
                .orElseThrow(() -> new ConflitMetierException("Aucun parking actif n'est affecté à l'agent"));
    }

    private void notifierUtilisateurs(DossierRejetCheque dossier, String sujet, String contenu,
                                      String... codesRoles) {
        for (Utilisateur utilisateur : utilisateurs.findAll()) {
            boolean concerne = utilisateur.getRoles().stream().anyMatch(role ->
                    java.util.Arrays.stream(codesRoles).anyMatch(code -> role.getCode().name().equals(code)));
            if (concerne) {
                notifications.save(Notification.pourUtilisateur(reference("NOT"), TypeNotification.CHEQUE_REJETE,
                        CanalNotification.SYSTEME, sujet, contenu, utilisateur.getEmail(), utilisateur,
                        dossier.getAbonnement().getReference(), LocalDateTime.now()));
            }
        }
    }

    private boolean texte(String valeur) { return valeur != null && !valeur.isBlank(); }

    private String reference(String prefixe) {
        return prefixe + "-" + LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private ChequeCandidatResponse versCandidat(Paiement paiement) {
        var client = Hibernate.unproxy(paiement.getDemande().getClient());
        String nom = client instanceof ClientParticulier particulier
                ? particulier.getNomComplet()
                : client instanceof ClientEntreprise entreprise
                ? entreprise.getRaisonSociale() : "Client inconnu";
        Abonnement abonnement = paiement.getPeriodeAbonnement().getAbonnement();
        return new ChequeCandidatResponse(
                paiement.getId(), paiement.getReference(), paiement.getNumeroCheque(),
                paiement.getBanqueCheque(), paiement.getDateEmissionCheque(),
                paiement.getStatutCheque(), paiement.getMontant(),
                abonnement.getId(), abonnement.getReference(),
                abonnement.getStatut().name(), nom);
    }

    private DossierRejetCheque chargerPourMiseAJour(Long id) {
        return dossiers.findByIdPourMiseAJour(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Dossier introuvable"));
    }

    private Utilisateur utilisateur(Long id) {
        return utilisateurs.findById(id)
                .orElseThrow(() -> new RessourceIntrouvableException("Utilisateur introuvable"));
    }
}
