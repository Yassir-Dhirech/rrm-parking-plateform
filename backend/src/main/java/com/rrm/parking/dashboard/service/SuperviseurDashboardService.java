package com.rrm.parking.dashboard.service;

import com.rrm.parking.abonnement.enums.StatutAbonnement;
import com.rrm.parking.abonnement.repository.AffectationParkingRepository;
import com.rrm.parking.carte.entity.DemandeOperationnelle;
import com.rrm.parking.carte.enums.StatutDemandeOperationnelle;
import com.rrm.parking.carte.enums.TypeOperationCarte;
import com.rrm.parking.carte.repository.DemandeOperationnelleRepository;
import com.rrm.parking.dashboard.dto.response.SuperviseurDashboardResponse;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.demande.service.ReservationPlacesCorporate;
import com.rrm.parking.recette.entity.Recette;
import com.rrm.parking.recette.entity.StatutRecette;
import com.rrm.parking.recette.repository.RecetteRepository;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SuperviseurDashboardService {
    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final List<StatutDemandeOperationnelle> OUVERTES = List.of(
            StatutDemandeOperationnelle.CREEE,
            StatutDemandeOperationnelle.AFFECTEE,
            StatutDemandeOperationnelle.EN_COURS);

    private final AffectationAgentParkingRepository affectationsSuperviseur;
    private final AffectationParkingRepository affectationsAbonnement;
    private final DemandeClientRepository demandes;
    private final DemandeNouveauContratCorporateRepository demandesCorporate;
    private final DemandeOperationnelleRepository operations;
    private final RecetteRepository recettes;

    @Transactional(readOnly = true)
    public SuperviseurDashboardResponse charger(Long superviseurId, LocalDate debut, LocalDate fin) {
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        LocalDate dateDebut = debut == null ? aujourdHui.minusDays(6) : debut;
        LocalDate dateFin = fin == null ? aujourdHui : fin;
        if (dateDebut.isAfter(dateFin) || dateFin.isAfter(aujourdHui)) {
            throw new IllegalArgumentException("La période doit être ordonnée et ne peut pas finir dans le futur");
        }

        var affectations = affectationsSuperviseur.findAllByUtilisateurIdAndActiveTrue(superviseurId)
                .stream().filter(a -> a.getDateDebut() != null && !a.getDateDebut().isAfter(aujourdHui))
                .filter(a -> a.getDateFin() == null || !a.getDateFin().isBefore(aujourdHui))
                .collect(Collectors.toMap(a -> a.getParking().getId(), a -> a, (a, b) -> a))
                .values().stream().sorted(Comparator.comparing(a -> a.getParking().getNom())).toList();
        Set<Long> parkingIds = affectations.stream().map(a -> a.getParking().getId()).collect(Collectors.toSet());

        List<SuperviseurDashboardResponse.Parking> parkings = new ArrayList<>();
        List<SuperviseurDashboardResponse.Action> actions = new ArrayList<>();
        long demandesAValider = 0;
        long actionsCartes = 0;
        long reguliersActifs = 0;
        long contratsCorporateActifs = 0;
        long corporateReservees = 0;
        Set<Long> operationIds = new HashSet<>();

        for (var affectation : affectations) {
            var parking = affectation.getParking();
            Long parkingId = parking.getId();
            long actifs = affectationsAbonnement.compterAbonnementsParParkingEtStatut(
                    parkingId, StatutAbonnement.ACTIF, aujourdHui);
            long corporate = demandesCorporate.compterPlacesReservees(
                    parkingId, ReservationPlacesCorporate.STATUTS_RESERVANT, aujourdHui);
            long placesOccupees = affectationsAbonnement.compterPlacesOccupees(
                    parkingId, EnumSet.of(StatutAbonnement.EN_ATTENTE_ACTIVATION,
                            StatutAbonnement.ACTIF, StatutAbonnement.SUSPENDU), aujourdHui) + corporate;
            int quota = parking.getCapaciteReserveeAbonnements() == null
                    ? 0 : parking.getCapaciteReserveeAbonnements();
            long contratsActifs = demandesCorporate.compterContratsParParkingEtStatut(
                    parkingId, StatutDemande.FINALISEE, aujourdHui);
            reguliersActifs += actifs;
            contratsCorporateActifs += contratsActifs;
            corporateReservees += corporate;
            long nouvelles = demandes.countNouvellesDemandesRegulieresParParkingEtStatut(
                    parkingId, StatutDemande.PAYEE);
            long renouvellements = demandes.countRenouvellementsParParkingEtStatut(
                    parkingId, StatutDemande.PAYEE);
            demandesAValider += nouvelles + renouvellements;

            var limite = PageRequest.of(0, 5);
            List<DemandeClient> fileDemandes = new ArrayList<>(demandes.prochainesNouvellesDemandes(
                    parkingId, StatutDemande.PAYEE, limite));
            fileDemandes.addAll(demandes.prochainsRenouvellements(parkingId, StatutDemande.PAYEE, limite));
            for (DemandeClient demande : fileDemandes) {
                var detail = DemandeRechercheResponse.depuis(demande);
                actions.add(new SuperviseurDashboardResponse.Action("DEMANDE", demande.getId(),
                        demande.getReference(), parkingId, parking.getNom(), demande.getDateSoumission(),
                        "Valider la demande de " + (detail.nomClient() == null ? "client" : detail.nomClient()),
                        "/superviseur/demandes/" + demande.getId()));
            }

            List<DemandeOperationnelle> fileCartes = operations.findOuvertesParParking(
                    List.of(TypeOperationCarte.ACTIVATION, TypeOperationCarte.DESACTIVATION),
                    OUVERTES, parkingId, aujourdHui);
            for (DemandeOperationnelle operation : fileCartes) {
                if (!operationIds.add(operation.getId())) continue;
                actionsCartes++;
                boolean activation = operation.getTypeOperation() == TypeOperationCarte.ACTIVATION;
                actions.add(new SuperviseurDashboardResponse.Action(
                        activation ? "ACTIVATION" : "DESACTIVATION", operation.getId(),
                        operation.getReference(), parkingId, parking.getNom(), operation.getDateCreation(),
                        activation ? "Activer une carte d'accès" : "Désactiver une carte d'accès",
                        activation ? "/superviseur/activations-cartes?operationId=" + operation.getId()
                                : "/superviseur/rejets-cheques"));
            }

            parkings.add(new SuperviseurDashboardResponse.Parking(parkingId, parking.getCode(),
                    parking.getNom(), parking.getAdresse(),
                    parking.getLatitude() == null ? null : parking.getLatitude().toPlainString(),
                    parking.getLongitude() == null ? null : parking.getLongitude().toPlainString(),
                    parking.getStatut().name(),
                    quota, placesOccupees, Math.max(0, quota - placesOccupees),
                    actifs, contratsActifs, corporate, fileCartes.size(), nouvelles + renouvellements));
        }

        List<Recette> arretes = recettes.findBySuperviseurIdAndDateArretBetweenOrderByDateArretDesc(
                superviseurId, dateDebut, dateFin).stream()
                .filter(r -> parkingIds.contains(r.getParking().getId())
                        && r.getStatut() != StatutRecette.ANNULEE
                        && r.getStatut() != StatutRecette.BROUILLON)
                .toList();
        for (Recette recette : recettes.findBySuperviseurIdAndStatutOrderByDateCreationAsc(
                superviseurId, StatutRecette.BROUILLON)) {
            if (!parkingIds.contains(recette.getParking().getId())) continue;
            actions.add(new SuperviseurDashboardResponse.Action("RECETTE", recette.getId(),
                    recette.getReference(), recette.getParking().getId(), recette.getParking().getNom(), recette.getDateCreation(),
                    "Transmettre l'arrêté de recette", "/superviseur/recettes/" + recette.getId()));
        }
        actions.sort(Comparator.comparing(SuperviseurDashboardResponse.Action::depuis,
                Comparator.nullsLast(Comparator.naturalOrder())));

        return new SuperviseurDashboardResponse(dateDebut, dateFin,
                LocalDateTime.now(ZONE_RRM), actionsCartes, arretes.size(), demandesAValider,
                parkings.size(), reguliersActifs, contratsCorporateActifs, corporateReservees, parkings,
                arretes.stream().map(r -> new SuperviseurDashboardResponse.Arrete(
                        r.getId(), r.getReference(), r.getParking().getId(), r.getParking().getNom(),
                        r.getDateArret(), r.getStatut().name(), r.getLignes().size())).toList(),
                actions.stream().limit(200).toList());
    }
}
