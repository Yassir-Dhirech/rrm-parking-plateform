package com.rrm.parking.recette.service;

import com.rrm.parking.abonnement.entity.PeriodeAbonnement;
import com.rrm.parking.cheque.repository.DossierRejetChequeRepository;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandePerteCarte;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.facturation.enums.TypeLigneFacture;
import com.rrm.parking.facturation.repository.FactureRepository;
import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.enums.CanalNotification;
import com.rrm.parking.notification.enums.TypeNotification;
import com.rrm.parking.notification.repository.NotificationRepository;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.recette.dto.PaiementDisponibleDto;
import com.rrm.parking.recette.dto.RecetteDto;
import com.rrm.parking.recette.entity.LigneRecette;
import com.rrm.parking.recette.entity.Recette;
import com.rrm.parking.recette.entity.StatutRecette;
import com.rrm.parking.recette.repository.LigneRecetteRepository;
import com.rrm.parking.recette.repository.RecetteRepository;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecetteService {
    private final RecetteRepository recettes;
    private final LigneRecetteRepository lignes;
    private final PaiementRepository paiements;
    private final FactureRepository factures;
    private final DossierRejetChequeRepository rejets;
    private final ParkingRepository parkings;
    private final UtilisateurRepository utilisateurs;
    private final AffectationAgentParkingRepository affectations;
    private final NotificationRepository notifications;
    private final RecetteDocumentService documents;

    public record CreerRequest(Long parkingId, LocalDate dateArret, List<Long> paiementIds) {}
    public record ReceptionRequest(BigDecimal montantEspecesRecu, BigDecimal montantChequesRecu,
                                   Integer nombreChequesRecus, String observation) {}
    public record ParkingAutorise(Long id, String nom) {}

    @Transactional
    public List<ParkingAutorise> parkingsAutorises(Long userId) {
        exigerRole(userId, CodeRole.SUPERVISEUR);
        return affectations.findAllByUtilisateurIdAndActiveTrue(userId).stream()
                .filter(a -> valide(a.getDateDebut(), a.getDateFin()))
                .map(a -> new ParkingAutorise(a.getParking().getId(), a.getParking().getNom()))
                .distinct().toList();
    }

    @Transactional
    public List<PaiementDisponibleDto> disponibles(Long parkingId, LocalDate dateArret, Long userId) {
        exigerAffectation(userId, parkingId);
        if (dateArret == null || dateArret.isAfter(LocalDate.now()))
            throw new IllegalArgumentException("La date d'arrêt doit être renseignée et ne peut être future");
        List<PaiementDisponibleDto> resultat = new ArrayList<>();
        for (Paiement p : paiements.findByStatut(StatutPaiement.CONFIRME)) {
            if (p.getDateConfirmation() == null || p.getDateConfirmation().toLocalDate().isAfter(dateArret)
                    || lignes.existsByPaiementId(p.getId())) continue;
            var d = (com.rrm.parking.demande.entity.DemandeClient) Hibernate.unproxy(p.getDemande());
            if (!(d instanceof DemandeNouvelAbonnementRegulier) && !(d instanceof DemandeRenouvellementRegulier) && !(d instanceof DemandePerteCarte)) continue;
            if (!parkingId.equals(parkingId(p))) continue;
            var f = factures.findByPaiementId(p.getId()).orElse(null);
            resultat.add(new PaiementDisponibleDto(p.getId(), p.getReference(), client(p), abonnement(p),
                    f == null ? null : f.getNumero(), p.getModePaiement().name(), p.getNumeroCheque(),
                    p.getBanqueCheque(), p.getMontant(), p.getDateConfirmation(), typeAbonnement(p), observation(p)));
        }
        resultat.sort(Comparator.comparing(PaiementDisponibleDto::datePaiement));
        return resultat;
    }

    @Transactional
    public RecetteDto creer(CreerRequest req, Long userId) {
        if (req == null || req.parkingId() == null || req.dateArret() == null || req.paiementIds() == null
                || req.paiementIds().isEmpty() || req.paiementIds().size() != new HashSet<>(req.paiementIds()).size())
            throw new IllegalArgumentException("Parking, date et paiements distincts sont obligatoires");
        exigerAffectation(userId, req.parkingId());
        if (req.dateArret().isAfter(LocalDate.now())) throw new IllegalArgumentException("Date d'arrêt future interdite");
        var parking = parkings.findById(req.parkingId()).orElseThrow(() -> new RessourceIntrouvableException("Parking introuvable"));
        var superviseur = utilisateur(userId);
        var recette = new Recette("ARR-" + LocalDate.now().toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase(), parking, superviseur, req.dateArret());
        for (Long id : req.paiementIds().stream().sorted().toList()) {
            Paiement p = paiements.findByIdPourMiseAJour(id)
                    .orElseThrow(() -> new RessourceIntrouvableException("Paiement introuvable : " + id));
            if (p.getStatut() != StatutPaiement.CONFIRME || p.getDateConfirmation() == null
                    || p.getDateConfirmation().toLocalDate().isAfter(req.dateArret())
                    || !req.parkingId().equals(parkingId(p)) || lignes.existsByPaiementId(id))
                throw new ConflitMetierException("Paiement non admissible ou déjà affecté : " + id);
            var facture = factures.findByPaiementId(id).orElse(null);
            PeriodeAbonnement periode = periode(p);
            boolean carte = facture != null && facture.getLignes().stream()
                    .anyMatch(l -> l.getTypeLigne() == TypeLigneFacture.CARTE_ACCES);
            recette.ajouter(new LigneRecette(recette, p, facture == null ? null : facture.getNumero(),
                    abonnement(p), client(p), typeAbonnement(p),
                    periode == null ? null : periode.getDateDebut(), periode == null ? null : periode.getDateFin(),
                    carte, observation(p)));
        }
        return RecetteDto.depuis(recettes.saveAndFlush(recette));
    }

    @Transactional
    public List<RecetteDto> lister(Long userId) {
        var u = utilisateur(userId);
        if (role(u, CodeRole.COMPTABLE) || role(u, CodeRole.RESPONSABLE_STATIONNEMENT) || role(u, CodeRole.ADMINISTRATEUR_SI))
            return recettes.findAllByOrderByDateCreationDesc().stream()
                    .filter(r -> r.getStatut() != StatutRecette.BROUILLON || r.getSuperviseur().getId().equals(userId))
                    .map(RecetteDto::depuis).toList();
        exigerRole(userId, CodeRole.SUPERVISEUR);
        var ids = parkingsAutorises(userId).stream().map(ParkingAutorise::id).toList();
        return recettes.findAllByOrderByDateCreationDesc().stream()
                .filter(r -> ids.contains(r.getParking().getId()) || r.getSuperviseur().getId().equals(userId))
                .map(RecetteDto::depuis).toList();
    }

    @Transactional
    public RecetteDto detail(Long id, Long userId) { return RecetteDto.depuis(autoriserLecture(id, userId)); }

    @Transactional
    public RecetteDto transmettre(Long id, Long userId) {
        Recette r = verrouiller(id);
        exigerRole(userId, CodeRole.SUPERVISEUR);
        exigerAffectation(userId, r.getParking().getId());
        if (!r.getSuperviseur().getId().equals(userId)) throw new ConflitMetierException("Arrêté d'un autre superviseur");
        for (LigneRecette l : r.getLignes())
            if (l.getPaiement().getStatut() != StatutPaiement.CONFIRME)
                throw new ConflitMetierException("Paiement devenu invalide : " + l.getReferencePaiement());
        r.transmettre();
        notifier(CodeRole.COMPTABLE, TypeNotification.RECETTE_TRANSMISE, r, "Recette à réceptionner");
        return RecetteDto.depuis(r);
    }

    @Transactional
    public RecetteDto annuler(Long id, Long userId) {
        Recette r = verrouiller(id);
        exigerRole(userId, CodeRole.SUPERVISEUR);
        if (!r.getSuperviseur().getId().equals(userId)) throw new ConflitMetierException("Arrêté d'un autre superviseur");
        r.annuler();
        return RecetteDto.depuis(r);
    }

    @Transactional
    public RecetteDto receptionner(Long id, ReceptionRequest req, Long userId) {
        exigerRole(userId, CodeRole.COMPTABLE);
        if (req == null || req.nombreChequesRecus() == null) throw new IllegalArgumentException("Réception incomplète");
        Recette r = verrouiller(id);
        r.receptionner(utilisateur(userId), req.montantEspecesRecu(), req.montantChequesRecu(),
                req.nombreChequesRecus(), req.observation(), "AR-" + LocalDate.now().toString().replace("-", "")
                        + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        notifications.save(Notification.pourUtilisateur("NOT-" + UUID.randomUUID(), TypeNotification.RECETTE_RECEPTIONNEE,
                CanalNotification.SYSTEME, "Accusé de réception disponible", "L'arrêté " + r.getReference()
                        + " a été réceptionné. Accusé " + r.getAccuseNumero(), r.getSuperviseur().getEmail(),
                r.getSuperviseur(), r.getReference(), LocalDateTime.now()));
        if (r.getStatut() == StatutRecette.RECUE_AVEC_RESERVES)
            notifier(CodeRole.RESPONSABLE_STATIONNEMENT, TypeNotification.RECETTE_RECEPTIONNEE, r, "Recette reçue avec réserves");
        return RecetteDto.depuis(r);
    }

    @Transactional
    public Recette autoriserLecture(Long id, Long userId) {
        Recette r = recettes.findById(id).orElseThrow(() -> new RessourceIntrouvableException("Recette introuvable"));
        var u = utilisateur(userId);
        if (r.getStatut() == StatutRecette.BROUILLON && !r.getSuperviseur().getId().equals(userId))
            throw new ConflitMetierException("Brouillon privé");
        if (role(u, CodeRole.COMPTABLE) || role(u, CodeRole.RESPONSABLE_STATIONNEMENT) || role(u, CodeRole.ADMINISTRATEUR_SI)) return r;
        exigerRole(userId, CodeRole.SUPERVISEUR);
        if (r.getSuperviseur().getId().equals(userId) || parkingsAutorises(userId).stream().anyMatch(p -> p.id().equals(r.getParking().getId()))) return r;
        throw new ConflitMetierException("Recette d'un autre parking");
    }

    @Transactional
    public byte[] excel(Long id, Long userId) throws IOException {
        return documents.excel(autoriserLecture(id, userId));
    }

    @Transactional
    public byte[] accuse(Long id, Long userId) throws IOException {
        return documents.accuse(autoriserLecture(id, userId));
    }

    private Recette verrouiller(Long id) {
        return recettes.verrouiller(id).orElseThrow(() -> new RessourceIntrouvableException("Recette introuvable"));
    }
    private Utilisateur utilisateur(Long id) {
        return utilisateurs.findById(id).orElseThrow(() -> new RessourceIntrouvableException("Utilisateur introuvable"));
    }
    private boolean role(Utilisateur u, CodeRole code) {
        return u.getRoles().stream().anyMatch(r -> r.getCode() == code);
    }
    private void exigerRole(Long id, CodeRole code) {
        if (!role(utilisateur(id), code)) throw new ConflitMetierException("Rôle non autorisé");
    }
    private void exigerAffectation(Long userId, Long parkingId) {
        exigerRole(userId, CodeRole.SUPERVISEUR);
        boolean ok = affectations.findAllByUtilisateurIdAndActiveTrue(userId).stream()
                .anyMatch(a -> a.getParking().getId().equals(parkingId) && valide(a.getDateDebut(), a.getDateFin()));
        if (!ok) throw new ConflitMetierException("Superviseur non affecté à ce parking");
    }
    private boolean valide(LocalDate debut, LocalDate fin) {
        return !debut.isAfter(LocalDate.now()) && (fin == null || !fin.isBefore(LocalDate.now()));
    }
    private Long parkingId(Paiement p) {
        var d = (com.rrm.parking.demande.entity.DemandeClient) Hibernate.unproxy(p.getDemande());
        if (d instanceof DemandeNouvelAbonnementRegulier n) return n.getTarifParking().getParking().getId();
        if (d instanceof DemandeRenouvellementRegulier n) return n.getTarifParking().getParking().getId();
        if (d instanceof DemandePerteCarte perte && perte.getParking() != null) return perte.getParking().getId();
        return null;
    }
    private String typeAbonnement(Paiement p) {
        var d = (com.rrm.parking.demande.entity.DemandeClient) Hibernate.unproxy(p.getDemande());
        if (d instanceof DemandePerteCarte) return "Duplicata Carte (Perte)";
        var tarif = d instanceof DemandeNouvelAbonnementRegulier n ? n.getTarifParking()
                : d instanceof DemandeRenouvellementRegulier n ? n.getTarifParking() : null;
        return tarif == null ? "Abonnement" : tarif.getForfait().getLibelle() + " " + tarif.getDureeEnMois() + " mois";
    }
    private PeriodeAbonnement periode(Paiement p) {
        if (p.getPeriodeAbonnement() != null) return p.getPeriodeAbonnement();
        var regularisation = rejets.findByPaiementRegularisationId(p.getId());
        if (regularisation.isPresent()) return regularisation.get().getPaiementInitial().getPeriodeAbonnement();
        var d = (com.rrm.parking.demande.entity.DemandeClient) Hibernate.unproxy(p.getDemande());
        if (d instanceof DemandeRenouvellementRegulier n) return n.getPeriodeGeneree();
        if (d instanceof DemandeNouvelAbonnementRegulier n && n.getAbonnementGenere() != null
                && !n.getAbonnementGenere().getPeriodes().isEmpty())
            return n.getAbonnementGenere().getPeriodes().getFirst();
        return null;
    }
    private String abonnement(Paiement p) {
        if (periode(p) != null) return periode(p).getAbonnement().getReference();
        var d = (com.rrm.parking.demande.entity.DemandeClient) Hibernate.unproxy(p.getDemande());
        if (d instanceof DemandeNouvelAbonnementRegulier n && n.getAbonnementGenere() != null)
            return n.getAbonnementGenere().getReference();
        if (d instanceof DemandeRenouvellementRegulier n) return n.getAbonnementConcerne().getReference();
        if (d instanceof DemandePerteCarte perte && perte.getAbonnementConcerne() != null)
            return perte.getAbonnementConcerne().getReference();
        return p.getDemande().getReference();
    }
    private String client(Paiement p) {
        Object c = Hibernate.unproxy(p.getDemande().getClient());
        if (c instanceof ClientParticulier x) return x.getNomComplet();
        if (c instanceof ClientEntreprise x) return x.getRaisonSociale();
        return "Client " + p.getDemande().getClient().getId();
    }
    private String observation(Paiement p) {
        return rejets.existsByPaiementRegularisationId(p.getId()) ? "Régularisation après rejet de chèque" : "";
    }
    private void notifier(CodeRole role, TypeNotification type, Recette r, String sujet) {
        for (Utilisateur u : utilisateurs.findAll()) if (role(u, role))
            notifications.save(Notification.pourUtilisateur("NOT-" + UUID.randomUUID(), type, CanalNotification.SYSTEME,
                    sujet, "Arrêté " + r.getReference() + " - " + r.getParking().getNom(), u.getEmail(), u,
                    r.getReference(), LocalDateTime.now()));
    }
}
