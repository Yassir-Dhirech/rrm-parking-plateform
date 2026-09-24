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

        LocalDate fin = dateFin != null
                ? dateFin
                : debut.withDayOfMonth(debut.lengthOfMonth());

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

        Long delaiActuel =
                calculerDelaiMoyenMinutes(debut, fin);
        Long delaiPrecedent =
                calculerDelaiMoyenMinutes(
                        debutPrecedent,
                        finPrecedent
                );

        return new ResponsableDashboardKpiResponse(
                debut,
                fin,
                caActuel.valeur(),
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
        List<DemandeClient> demandesPayees =
                demandeClientRepository.findByStatutOrderByDateModificationAsc(
                        StatutDemande.PAYEE
                );

        List<ResponsablePendingValidationResponse.PendingRequestItem> resume =
                demandesPayees.stream()
                        .limit(6)
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
                demandesPayees.size(),
                resume
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
        int anneeSelectionnee = annee != null
                ? annee
                : LocalDate.now(ZONE_RRM).getYear();

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
            LocalDate finMois =
                    debutMois.withDayOfMonth(debutMois.lengthOfMonth());

            MesureMonetaire mesure =
                    calculerChiffreAffaires(
                            debutMois,
                            finMois,
                            null
                    );

            BigDecimal montant = mesure.valeur()
                    .setScale(2, RoundingMode.HALF_UP);

            totalAnnuel = totalAnnuel.add(montant);

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
                        coalesce(sum(
                            p.prixhtapplique
                            * (
                                datediff(
                                    least(p.date_fin, :fin),
                                    greatest(p.date_debut, :debut)
                                ) + 1
                            )
                            / (
                                datediff(p.date_fin, p.date_debut) + 1
                            )
                        ), 0) as montant,
                        count(*) as nombre_lignes
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
                    coalesce(sum(x.montant), 0) as montant,
                    count(*) as nombre_lignes
                from (
                    select
                        p.id,
                        p.prixhtapplique
                        * (
                            datediff(
                                least(
                                    p.date_fin,
                                    :fin,
                                    coalesce(a.date_fin, :fin)
                                ),
                                greatest(
                                    p.date_debut,
                                    :debut,
                                    a.date_debut
                                )
                            ) + 1
                        )
                        / (
                            datediff(p.date_fin, p.date_debut) + 1
                        ) as montant
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

                    union all

                    select
                        p.id,
                        p.prixhtapplique
                        * (
                            datediff(
                                least(p.date_fin, :fin),
                                greatest(p.date_debut, :debut)
                            ) + 1
                        )
                        / (
                            datediff(p.date_fin, p.date_debut) + 1
                        ) as montant
                    from periode_abonnement p
                    join abonnement_entreprise ae
                      on ae.id = p.abonnement_id
                    join contrat_corporate c
                      on c.id = ae.contrat_corporate_id
                    join demande_nouveau_contrat_corporate dnc
                      on dnc.contrat_genere_id = c.id
                    join tarif_parking t
                      on t.id = dnc.tarif_parking_id
                    where p.statut <> 'ANNULEE'
                      and t.parking_id = :parkingId
                      and p.date_debut <= :fin
                      and p.date_fin >= :debut
                ) x
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

        return jdbc.queryForObject(
                sql,
                params,
                (rs, rowNum) -> new MesureMonetaire(
                        rs.getBigDecimal("montant")
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                ),
                        rs.getLong("nombre_lignes")
                )
        );
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
                    where p.statut = 'ACTIVE'
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
                where p.statut = 'ACTIVE'
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
                        join tarif_parking t
                          on t.id = dnc.tarif_parking_id
                        where ae.id =
                              p.abonnement_id
                          and t.parking_id = :parkingId
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
                    """;
        } else {
            reserveSql = """
                    select coalesce(
                        sum(capacite_reservee_abonnements),
                        0
                    )
                    from parking
                    where id = :parkingId
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
                : " and t.parking_id = :parkingId ";

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
                    join tarif_parking t
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
            LocalDate fin
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

        BigDecimal moyenne = jdbc.queryForObject(
                """
                select avg(
                    timestampdiff(
                        minute,
                        x.date_paiement,
                        x.date_decision
                    )
                )
                from (
                    select
                        h.demande_id,
                        min(
                            case
                                when h.nouveau_statut = 'PAYEE'
                                then h.date_changement
                            end
                        ) as date_paiement,
                        max(
                            case
                                when h.nouveau_statut in (
                                    'VALIDEE',
                                    'REFUSEE'
                                )
                                then h.date_changement
                            end
                        ) as date_decision
                    from historique_statut_demande h
                    group by h.demande_id
                ) x
                join demande_client d
                  on d.id = x.demande_id
                where d.statut in ('VALIDEE', 'REFUSEE')
                  and x.date_paiement is not null
                  and x.date_decision is not null
                  and x.date_decision >= :debut
                  and x.date_decision < :finExclusive
                """,
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

    private record Occupation(
            long placesOccupees,
            long placesReservees,
            BigDecimal taux
    ) {
    }
}
