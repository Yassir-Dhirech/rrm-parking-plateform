package com.rrm.parking.dashboard.service;

import com.rrm.parking.dashboard.dto.response.ResponsableDashboardKpiResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableSubscriptionsByParkingResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableMonthlyRevenueResponse;
import com.rrm.parking.dashboard.dto.response.ResponsablePendingValidationResponse;
import com.rrm.parking.dashboard.dto.response.ResponsableParkingMixResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.entity.ClientParticulier;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponsableDashboardService {

    private static final ZoneId ZONE_RRM =
            ZoneId.of("Africa/Casablanca");

    private final NamedParameterJdbcTemplate jdbc;
    private final DemandeClientRepository demandeClientRepository;

    public ResponsableDashboardKpiResponse chargerKpis(
            Long parkingId,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);

        LocalDate debut = dateDebut != null
                ? dateDebut
                : aujourdHui.withDayOfMonth(1);

        LocalDate finDemandee = dateFin != null
                ? dateFin
                : aujourdHui;

        LocalDate fin = finDemandee.isAfter(aujourdHui)
                ? aujourdHui
                : finDemandee;

        if (fin.isBefore(debut)) {
            throw new IllegalArgumentException(
                    "La date de fin doit être postérieure ou égale à la date de début"
            );
        }

        LocalDate debutPrecedent = debut.minusMonths(1);
        LocalDate finPrecedent = fin.minusMonths(1);

        MesureMonetaire caActuel =
                calculerChiffreAffaires(debut, fin, parkingId);
        MesureMonetaire caPrecedent =
                calculerChiffreAffaires(
                        debutPrecedent,
                        finPrecedent,
                        parkingId
                );

        LocalDate referenceActive = aujourdHui;
        LocalDate referencePrecedente =
                aujourdHui.withDayOfMonth(1).minusDays(1);

        long actifs =
                compterAbonnementsActifs(referenceActive, parkingId);
        long actifsPrecedents =
                compterAbonnementsActifs(
                        referencePrecedente,
                        parkingId
                );

        Occupation occupation =
                calculerOccupation(referenceActive, parkingId);

        LocalDate debutDelaiPrecedent = debut.minusMonths(1);
        LocalDate finDelaiPrecedent =
                dateDebut == null && dateFin == null
                        ? debut.minusDays(1)
                        : fin.minusMonths(1);

        Long delaiActuel =
                calculerDelaiMoyenMinutes(debut, fin, parkingId);
        Long delaiPrecedent =
                calculerDelaiMoyenMinutes(
                        debutDelaiPrecedent,
                        finDelaiPrecedent,
                        parkingId
                );

        return new ResponsableDashboardKpiResponse(
                debut,
                fin,
                caActuel.valeur()
                        .setScale(2, RoundingMode.HALF_UP),
                evolution(
                        caActuel.valeur(),
                        caPrecedent.valeur(),
                        caPrecedent.nombreLignes() > 0
                ),
                caActuel.nombreLignes() > 0,
                occupation.placesOccupees(),
                occupation.placesReservees(),
                occupation.taux(),
                occupation.placesReservees() > 0,
                actifs,
                evolution(
                        BigDecimal.valueOf(actifs),
                        BigDecimal.valueOf(actifsPrecedents),
                        actifsPrecedents > 0
                ),
                delaiActuel,
                evolution(
                        delaiActuel == null
                                ? null
                                : BigDecimal.valueOf(delaiActuel),
                        delaiPrecedent == null
                                ? null
                                : BigDecimal.valueOf(delaiPrecedent),
                        delaiPrecedent != null && delaiPrecedent > 0
                ),
                delaiActuel != null
        );
    }

    public ResponsablePendingValidationResponse chargerDemandesEnAttenteValidation() {
        List<DemandeClient> demandesEnAttente = new ArrayList<>();

        demandesEnAttente.addAll(
                demandeClientRepository.findByStatutOrderByDateModificationAsc(
                        StatutDemande.PAYEE
                )
        );

        demandesEnAttente.addAll(
                demandeClientRepository.findByStatutOrderByDateModificationAsc(
                        StatutDemande.EN_ATTENTE_VALIDATION_RESPONSABLE
                )
        );

        demandesEnAttente.sort(
                (gauche, droite) ->
                        gauche.getDateModification()
                                .compareTo(droite.getDateModification())
        );

        List<ResponsablePendingValidationResponse.PendingRequestItem> demandes =
                demandesEnAttente.stream()
                        .map(demande ->
                                new ResponsablePendingValidationResponse.PendingRequestItem(
                                        demande.getId(),
                                        demande.getReference(),
                                        nomClient(demande),
                                        demande.getStatut().name()
                                )
                        )
                        .toList();

        return new ResponsablePendingValidationResponse(
                demandes.size(),
                demandes
        );
    }
    public ResponsableParkingMixResponse chargerRepartitionPlacesActives() {
        LocalDate dateReference = LocalDate.now(ZONE_RRM);

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("date", dateReference);

        Long placesRegulieres = jdbc.queryForObject(
                """
                select count(distinct p.abonnement_id)
                from periode_abonnement p
                join abonnement_regulier ar on ar.id = p.abonnement_id
                join affectation_parking a on a.abonnement_regulier_id = ar.id
                where p.statut = 'ACTIVE'
                  and p.date_debut <= :date
                  and p.date_fin >= :date
                  and a.date_debut <= :date
                  and (a.date_fin is null or a.date_fin >= :date)
                """,
                params,
                Long.class
        );

        Long placesCorporate = jdbc.queryForObject(
                """
                select coalesce(sum(x.nombre_places), 0)
                from (
                    select distinct
                        p.abonnement_id,
                        c.nombre_places_contractuelles as nombre_places
                    from periode_abonnement p
                    join abonnement_entreprise ae on ae.id = p.abonnement_id
                    join contrat_corporate c on c.id = ae.contrat_corporate_id
                    join demande_nouveau_contrat_corporate dnc
                      on dnc.contrat_genere_id = c.id
                    join tarif_parking t on t.id = dnc.tarif_parking_id
                    where p.statut = 'ACTIVE'
                      and p.date_debut <= :date
                      and p.date_fin >= :date
                ) x
                """,
                params,
                Long.class
        );

        long regulier = placesRegulieres == null ? 0L : placesRegulieres;
        long corporate = placesCorporate == null ? 0L : placesCorporate;
        long total = regulier + corporate;

        BigDecimal partRegulier = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(regulier)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);

        BigDecimal partCorporate = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(corporate)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);

        return new ResponsableParkingMixResponse(
                dateReference,
                regulier,
                corporate,
                total,
                partRegulier,
                partCorporate
        );
    }

    private String nomClient(DemandeClient demande) {
        Object clientReel = org.hibernate.Hibernate.unproxy(demande.getClient());

        if (clientReel instanceof ClientParticulier particulier) {
            return particulier.getNomComplet();
        }

        if (clientReel instanceof ClientEntreprise entreprise) {
            return entreprise.getRaisonSociale();
        }

        return "Client #" + demande.getClient().getId();
    }

    public ResponsableMonthlyRevenueResponse chargerChiffreAffairesMensuel(
            Integer annee
    ) {
        return chargerChiffreAffairesMensuel(annee, null);
    }

    public ResponsableMonthlyRevenueResponse chargerChiffreAffairesMensuel(
            Integer annee,
            Long parkingId
    ) {
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);

        int anneeSelectionnee = annee != null
                ? annee
                : aujourdHui.getYear();

        if (anneeSelectionnee < 2000 || anneeSelectionnee > 2100) {
            throw new IllegalArgumentException(
                    "L'année doit être comprise entre 2000 et 2100"
            );
        }

        String[] libelles = {
                "Jan", "Fév", "Mar", "Avr",
                "Mai", "Juin", "Juil", "Août",
                "Sep", "Oct", "Nov", "Déc"
        };

        List<ResponsableMonthlyRevenueResponse.MonthlyRevenue> mois =
                new ArrayList<>(12);

        BigDecimal totalAnnuel = BigDecimal.ZERO;

        for (int numeroMois = 1; numeroMois <= 12; numeroMois++) {
            LocalDate debutMois =
                    LocalDate.of(anneeSelectionnee, numeroMois, 1);
            BigDecimal montantBrut = BigDecimal.ZERO;

            if (!debutMois.isAfter(aujourdHui)) {
                LocalDate finMoisCalendaire =
                        debutMois.withDayOfMonth(debutMois.lengthOfMonth());

                LocalDate finReconnaissance =
                        finMoisCalendaire.isAfter(aujourdHui)
                                ? aujourdHui
                                : finMoisCalendaire;

                MesureMonetaire mesure =
                        calculerChiffreAffaires(
                                debutMois,
                                finReconnaissance,
                                parkingId
                        );

                montantBrut = mesure.valeur();
            }

            BigDecimal montant = montantBrut
                    .setScale(2, RoundingMode.HALF_UP);

            totalAnnuel = totalAnnuel.add(montantBrut);

            mois.add(
                    new ResponsableMonthlyRevenueResponse.MonthlyRevenue(
                            numeroMois,
                            libelles[numeroMois - 1],
                            montant
                    )
            );
        }

        return new ResponsableMonthlyRevenueResponse(
                anneeSelectionnee,
                totalAnnuel.setScale(2, RoundingMode.HALF_UP),
                mois
        );
    }

    public ResponsableSubscriptionsByParkingResponse chargerAbonnementsActifsParParking() {
        LocalDate dateReference = LocalDate.now(ZONE_RRM);

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("date", dateReference);

        List<ResponsableSubscriptionsByParkingResponse.ParkingSubscriptionCount> parkings =
                jdbc.query(
                        """
                        select
                            pk.id as parking_id,
                            pk.nom as parking_nom,
                            coalesce(stats.nombre_abonnements, 0) as nombre_abonnements
                        from parking pk
                        left join (
                            select
                                source.parking_id,
                                count(distinct source.abonnement_id) as nombre_abonnements
                            from (
                                select
                                    a.parking_id,
                                    p.abonnement_id
                                from periode_abonnement p
                                join abonnement_regulier ar
                                  on ar.id = p.abonnement_id
                                join affectation_parking a
                                  on a.abonnement_regulier_id = ar.id
                                where p.statut = 'ACTIVE'
                                  and p.date_debut <= :date
                                  and p.date_fin >= :date
                                  and a.date_debut <= :date
                                  and (
                                        a.date_fin is null
                                        or a.date_fin >= :date
                                  )

                                union all

                                select
                                    t.parking_id,
                                    p.abonnement_id
                                from periode_abonnement p
                                join abonnement_entreprise ae
                                  on ae.id = p.abonnement_id
                                join contrat_corporate c
                                  on c.id = ae.contrat_corporate_id
                                join demande_nouveau_contrat_corporate dnc
                                  on dnc.contrat_genere_id = c.id
                                join tarif_parking t
                                  on t.id = dnc.tarif_parking_id
                                where p.statut = 'ACTIVE'
                                  and p.date_debut <= :date
                                  and p.date_fin >= :date
                            ) source
                            group by source.parking_id
                        ) stats
                          on stats.parking_id = pk.id
                        where pk.statut = 'ACTIF'
                        order by nombre_abonnements desc, pk.nom asc
                        """,
                        params,
                        (rs, rowNum) ->
                                new ResponsableSubscriptionsByParkingResponse.ParkingSubscriptionCount(
                                        rs.getLong("parking_id"),
                                        rs.getString("parking_nom"),
                                        rs.getLong("nombre_abonnements")
                                )
                );

        long totalAbonnements = parkings.stream()
                .mapToLong(
                        ResponsableSubscriptionsByParkingResponse.ParkingSubscriptionCount::nombreAbonnements
                )
                .sum();

        return new ResponsableSubscriptionsByParkingResponse(
                dateReference,
                totalAbonnements,
                parkings
        );
    }

    private MesureMonetaire calculerChiffreAffaires(
            LocalDate debut,
            LocalDate fin,
            Long parkingId
    ) {
        if (parkingId == null) {
            return lireMesureMonetaire(
                    """
                    select
                        p.prixhtapplique as montant_ht,
                        p.date_debut as periode_debut,
                        p.date_fin as periode_fin,
                        greatest(
                            p.date_debut,
                            :debut
                        ) as reconnaissance_debut,
                        least(
                            p.date_fin,
                            :fin
                        ) as reconnaissance_fin
                    from periode_abonnement p
                    where p.statut <> 'ANNULEE'
                      and p.date_debut <= :fin
                      and p.date_fin >= :debut
                    """,
                    debut,
                    fin,
                    null
            );
        }

        return lireMesureMonetaire(
                """
                select
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    greatest(
                        p.date_debut,
                        :debut,
                        a.date_debut
                    ) as reconnaissance_debut,
                    least(
                        p.date_fin,
                        :fin,
                        coalesce(a.date_fin, p.date_fin)
                    ) as reconnaissance_fin
                from periode_abonnement p
                join abonnement_regulier ar
                  on ar.id = p.abonnement_id
                join affectation_parking a
                  on a.abonnement_regulier_id = ar.id
                where p.statut <> 'ANNULEE'
                  and a.parking_id = :parkingId
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut
                  and a.date_debut <= :fin
                  and (
                        a.date_fin is null
                        or a.date_fin >= :debut
                  )
                  and greatest(
                        p.date_debut,
                        :debut,
                        a.date_debut
                  ) <= least(
                        p.date_fin,
                        :fin,
                        coalesce(a.date_fin, p.date_fin)
                  )

                union all

                select
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    greatest(
                        p.date_debut,
                        :debut
                    ) as reconnaissance_debut,
                    least(
                        p.date_fin,
                        :fin
                    ) as reconnaissance_fin
                from periode_abonnement p
                join abonnement_entreprise ae
                  on ae.id = p.abonnement_id
                join contrat_corporate c
                  on c.id = ae.contrat_corporate_id
                join demande_nouveau_contrat_corporate dnc
                  on dnc.contrat_genere_id = c.id
                left join tarif_parking t
                  on t.id = dnc.tarif_parking_id
                where p.statut <> 'ANNULEE'
                  and coalesce(
                        dnc.parking_id,
                        t.parking_id
                  ) = :parkingId
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut
                """,
                debut,
                fin,
                parkingId
        );
    }

    private MesureMonetaire lireMesureMonetaire(
            String sql,
            LocalDate debut,
            LocalDate fin,
            Long parkingId
    ) {
        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("debut", debut)
                        .addValue("fin", fin);

        if (parkingId != null) {
            params.addValue("parkingId", parkingId);
        }

        List<LigneChiffreAffaires> lignes = jdbc.query(
                sql,
                params,
                (rs, rowNum) -> new LigneChiffreAffaires(
                        rs.getBigDecimal("montant_ht"),
                        rs.getObject(
                                "periode_debut",
                                LocalDate.class
                        ),
                        rs.getObject(
                                "periode_fin",
                                LocalDate.class
                        ),
                        rs.getObject(
                                "reconnaissance_debut",
                                LocalDate.class
                        ),
                        rs.getObject(
                                "reconnaissance_fin",
                                LocalDate.class
                        )
                )
        );

        BigDecimal montant = lignes.stream()
                .map(ligne -> ChiffreAffairesProrata.calculer(
                        ligne.montantHt(),
                        ligne.periodeDebut(),
                        ligne.periodeFin(),
                        ligne.reconnaissanceDebut(),
                        ligne.reconnaissanceFin()
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MesureMonetaire(montant, lignes.size());
    }

    private long compterAbonnementsActifs(
            LocalDate date,
            Long parkingId
    ) {
        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("date", date);

        if (parkingId == null) {
            Long resultat = jdbc.queryForObject(
                    """
                    select count(distinct p.abonnement_id)
                    from periode_abonnement p
                    where p.statut <> 'ANNULEE'
                      and p.date_debut <= :date
                      and p.date_fin >= :date
                    """,
                    params,
                    Long.class
            );
            return resultat == null ? 0L : resultat;
        }

        params.addValue("parkingId", parkingId);

        Long resultat = jdbc.queryForObject(
                """
                select count(distinct p.abonnement_id)
                from periode_abonnement p
                where p.statut <> 'ANNULEE'
                  and p.date_debut <= :date
                  and p.date_fin >= :date
                  and (
                    exists (
                        select 1
                        from abonnement_regulier ar
                        join affectation_parking a
                          on a.abonnement_regulier_id =
                             ar.id
                        where ar.id =
                              p.abonnement_id
                          and a.parking_id = :parkingId
                          and a.date_debut <= :date
                          and (
                                a.date_fin is null
                                or a.date_fin >= :date
                          )
                    )
                    or exists (
                        select 1
                        from abonnement_entreprise ae
                        join contrat_corporate c
                          on c.id =
                             ae.contrat_corporate_id
                        join demande_nouveau_contrat_corporate dnc
                          on dnc.contrat_genere_id = c.id
                        left join tarif_parking t
                          on t.id = dnc.tarif_parking_id
                        where ae.id =
                              p.abonnement_id
                          and coalesce(
                                dnc.parking_id,
                                t.parking_id
                              ) = :parkingId
                    )
                  )
                """,
                params,
                Long.class
        );

        return resultat == null ? 0L : resultat;
    }

    private Occupation calculerOccupation(
            LocalDate date,
            Long parkingId
    ) {
        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("date", date);

        String reserveSql;
        if (parkingId == null) {
            reserveSql = """
                    select coalesce(
                        sum(capacite_reservee_abonnements),
                        0
                    )
                    from parking
                    where statut = 'ACTIF'
                    """;
        } else {
            reserveSql = """
                    select coalesce(
                        sum(capacite_reservee_abonnements),
                        0
                    )
                    from parking
                    where id = :parkingId
                      and statut = 'ACTIF'
                    """;
            params.addValue("parkingId", parkingId);
        }

        Long reservees = jdbc.queryForObject(
                reserveSql,
                params,
                Long.class
        );
        long placesReservees =
                reservees == null ? 0L : reservees;

        String filtreRegulier = parkingId == null
                ? ""
                : " and a.parking_id = :parkingId ";

        Long regulieres = jdbc.queryForObject(
                """
                select count(distinct p.abonnement_id)
                from periode_abonnement p
                join abonnement_regulier ar
                  on ar.id = p.abonnement_id
                join affectation_parking a
                  on a.abonnement_regulier_id =
                     ar.id
                where p.statut = 'ACTIVE'
                  and p.date_debut <= :date
                  and p.date_fin >= :date
                  and a.date_debut <= :date
                  and (
                        a.date_fin is null
                        or a.date_fin >= :date
                  )
                """ + filtreRegulier,
                params,
                Long.class
        );

        String filtreCorporate = parkingId == null
                ? ""
                : " and coalesce(dnc.parking_id, t.parking_id) = :parkingId ";

        Long corporate = jdbc.queryForObject(
                """
                select coalesce(sum(x.nombre_places), 0)
                from (
                    select distinct
                        p.abonnement_id,
                        c.nombre_places_contractuelles
                            as nombre_places
                    from periode_abonnement p
                    join abonnement_entreprise ae
                      on ae.id = p.abonnement_id
                    join contrat_corporate c
                      on c.id = ae.contrat_corporate_id
                    join demande_nouveau_contrat_corporate dnc
                      on dnc.contrat_genere_id = c.id
                    left join tarif_parking t
                      on t.id = dnc.tarif_parking_id
                    where p.statut = 'ACTIVE'
                      and p.date_debut <= :date
                      and p.date_fin >= :date
                """ + filtreCorporate + """
                ) x
                """,
                params,
                Long.class
        );

        long placesOccupees =
                (regulieres == null ? 0L : regulieres)
                        + (corporate == null ? 0L : corporate);

        BigDecimal taux = placesReservees == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(placesOccupees)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(placesReservees),
                        1,
                        RoundingMode.HALF_UP
                );

        return new Occupation(
                placesOccupees,
                placesReservees,
                taux
        );
    }

    private Long calculerDelaiMoyenMinutes(
            LocalDate debut,
            LocalDate fin,
            Long parkingId
    ) {
        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue(
                                "debut",
                                Timestamp.valueOf(
                                        debut.atStartOfDay()
                                )
                        )
                        .addValue(
                                "finExclusive",
                                Timestamp.valueOf(
                                        fin.plusDays(1)
                                                .atStartOfDay()
                                )
                        );

        String filtreParking = parkingId == null
                ? ""
                : " and x.parking_id = :parkingId ";

        if (parkingId != null) {
            params.addValue("parkingId", parkingId);
        }

        BigDecimal moyenne = jdbc.queryForObject(
                """
                with activation_par_demande as (
                    select
                        demande_client_source_id as demande_id,
                        max(date_execution) as date_disponibilite
                    from demande_operationnelle
                    where type_operation = 'ACTIVATION'
                      and statut = 'TERMINEE'
                      and date_execution is not null
                      and demande_client_source_id is not null
                    group by demande_client_source_id
                ),
                parcours as (
                    select
                        p.demande_id,
                        p.date_confirmation,
                        case
                            when dnc.id is not null
                            then dnc.date_finalisation
                            else apd.date_disponibilite
                        end as date_disponibilite,
                        coalesce(
                            dnc.parking_id,
                            tr.parking_id,
                            tn.parking_id
                        ) as parking_id
                    from paiement p
                    left join demande_nouveau_contrat_corporate dnc
                      on dnc.id = p.demande_id
                    left join demande_renouvellement_regulier drr
                      on drr.id = p.demande_id
                    left join tarif_parking tr
                      on tr.id = drr.tarif_parking_id
                    left join demande_nouvel_abonnement_regulier dna
                      on dna.id = p.demande_id
                    left join tarif_parking tn
                      on tn.id = dna.tarif_parking_id
                    left join activation_par_demande apd
                      on apd.demande_id = p.demande_id
                    where p.statut = 'CONFIRME'
                      and p.date_confirmation is not null
                )
                select avg(
                    timestampdiff(
                        second,
                        x.date_confirmation,
                        x.date_disponibilite
                    )
                ) / 60
                from parcours x
                where x.date_disponibilite is not null
                  and x.date_disponibilite >= x.date_confirmation
                  and x.date_disponibilite >= :debut
                  and x.date_disponibilite < :finExclusive
                """ + filtreParking,
                params,
                BigDecimal.class
        );

        return moyenne == null
                ? null
                : moyenne
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }

    private BigDecimal evolution(
            BigDecimal actuel,
            BigDecimal precedent,
            boolean donneesPrecedentesDisponibles
    ) {
        if (actuel == null
                || precedent == null
                || !donneesPrecedentesDisponibles
                || precedent.signum() == 0) {
            return null;
        }

        return actuel
                .subtract(precedent)
                .divide(
                        precedent,
                        6,
                        RoundingMode.HALF_UP
                )
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private record MesureMonetaire(
            BigDecimal valeur,
            long nombreLignes
    ) {
    }

    private record LigneChiffreAffaires(
            BigDecimal montantHt,
            LocalDate periodeDebut,
            LocalDate periodeFin,
            LocalDate reconnaissanceDebut,
            LocalDate reconnaissanceFin
    ) {
    }

    private record Occupation(
            long placesOccupees,
            long placesReservees,
            BigDecimal taux
    ) {
    }
}
