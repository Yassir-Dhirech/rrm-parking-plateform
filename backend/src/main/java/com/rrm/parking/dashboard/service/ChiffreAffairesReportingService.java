package com.rrm.parking.dashboard.service;

import com.rrm.parking.dashboard.dto.response.ChiffreAffairesDashboardResponse;
import com.rrm.parking.dashboard.enums.TypeAbonnementReporting;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChiffreAffairesReportingService {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");
    private static final Locale LOCALE_FR = Locale.FRENCH;

    private final NamedParameterJdbcTemplate jdbc;

    public ChiffreAffairesDashboardResponse chargerDashboard(
            LocalDate dateDebut,
            LocalDate dateFin,
            Integer annee,
            Integer mois,
            Long parkingId,
            TypeAbonnementReporting typeAbonnement
    ) {
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        TypeAbonnementReporting type = typeAbonnement == null
                ? TypeAbonnementReporting.TOUS
                : typeAbonnement;

        PeriodeAnalyseChiffreAffaires periode =
                PeriodeAnalyseChiffreAffaires.resoudre(
                        dateDebut,
                        dateFin,
                        annee,
                        mois,
                        aujourdHui
                );

        PeriodeAnalyseChiffreAffaires periodePrecedente =
                periode.precedente();
        LocalDate debutPrecedent = periodePrecedente.debut();
        LocalDate finPrecedent = periodePrecedente.fin();

        int anneeAnalyse = annee != null
                ? annee
                : periode.fin().getYear();

        LocalDate debutAnnuel = LocalDate.of(anneeAnalyse, 1, 1);
        LocalDate finAnnuelCalendaire = LocalDate.of(anneeAnalyse, 12, 31);
        LocalDate finAnnuel = finAnnuelCalendaire.isAfter(aujourdHui)
                ? aujourdHui
                : finAnnuelCalendaire;

        YearMonth dernierMois = YearMonth.from(periode.fin());
        YearMonth premierMois = dernierMois.minusMonths(11);
        LocalDate debutSerie = premierMois.atDay(1);

        LocalDate debutChargement = min(
                debutPrecedent,
                debutAnnuel,
                debutSerie
        );
        LocalDate finChargement = max(
                periode.fin(),
                finAnnuel
        );

        List<LigneChiffreAffaires> lignesGlobales = chargerLignesGlobales(
                debutChargement,
                finChargement
        );
        List<LigneChiffreAffaires> lignesParParking =
                chargerLignesParParking(
                        debutChargement,
                        finChargement
                );

        List<LigneChiffreAffaires> lignesCalcul = parkingId == null
                ? lignesGlobales
                : lignesParParking;

        BigDecimal caActuelBrut = calculer(
                lignesCalcul,
                periode.debut(),
                periode.fin(),
                parkingId,
                type
        );
        BigDecimal caPrecedentBrut = calculer(
                lignesCalcul,
                debutPrecedent,
                finPrecedent,
                parkingId,
                type
        );

        BigDecimal caRegulierBrut = type == TypeAbonnementReporting.CORPORATE
                ? BigDecimal.ZERO
                : calculer(
                        lignesCalcul,
                        periode.debut(),
                        periode.fin(),
                        parkingId,
                        TypeAbonnementReporting.REGULIER
                );

        BigDecimal caCorporateBrut = type == TypeAbonnementReporting.REGULIER
                ? BigDecimal.ZERO
                : calculer(
                        lignesCalcul,
                        periode.debut(),
                        periode.fin(),
                        parkingId,
                        TypeAbonnementReporting.CORPORATE
                );

        BigDecimal caAnnuelBrut = finAnnuel.isBefore(debutAnnuel)
                ? BigDecimal.ZERO
                : calculer(
                        lignesCalcul,
                        debutAnnuel,
                        finAnnuel,
                        parkingId,
                        type
                );

        List<ChiffreAffairesDashboardResponse.ChiffreAffairesMensuel> serie =
                construireSerieMensuelle(
                        lignesCalcul,
                        premierMois,
                        dernierMois,
                        periode.fin(),
                        aujourdHui,
                        parkingId,
                        type
                );

        List<ChiffreAffairesDashboardResponse.ChiffreAffairesParking> parParking =
                construireRepartitionParParking(
                        lignesParParking,
                        periode,
                        parkingId,
                        type,
                        caActuelBrut
                );

        return new ChiffreAffairesDashboardResponse(
                new ChiffreAffairesDashboardResponse.FiltresAppliques(
                        periode.debut(),
                        periode.fin(),
                        debutPrecedent,
                        finPrecedent,
                        annee,
                        mois,
                        parkingId,
                        type.name()
                ),
                new ChiffreAffairesDashboardResponse.Synthese(
                        montant(caActuelBrut),
                        montant(caPrecedentBrut),
                        evolution(caActuelBrut, caPrecedentBrut),
                        montant(caAnnuelBrut),
                        montant(caRegulierBrut),
                        montant(caCorporateBrut),
                        montant(caActuelBrut),
                        pourcentage(caRegulierBrut, caActuelBrut),
                        pourcentage(caCorporateBrut, caActuelBrut)
                ),
                serie,
                parParking
        );
    }

    private List<LigneChiffreAffaires> chargerLignesGlobales(
            LocalDate debut,
            LocalDate fin
    ) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("debut", debut)
                .addValue("fin", fin);

        return jdbc.query(
                """
                select
                    p.id as periode_id,
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    p.date_debut as eligibilite_debut,
                    p.date_fin as eligibilite_fin,
                    null as parking_id,
                    null as parking_nom,
                    'REGULIER' as type_abonnement
                from periode_abonnement p
                join abonnement_regulier ar
                  on ar.id = p.abonnement_id
                where p.statut <> 'ANNULEE'
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut

                union all

                select
                    p.id as periode_id,
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    p.date_debut as eligibilite_debut,
                    p.date_fin as eligibilite_fin,
                    null as parking_id,
                    null as parking_nom,
                    'CORPORATE' as type_abonnement
                from periode_abonnement p
                join abonnement_entreprise ae
                  on ae.id = p.abonnement_id
                where p.statut <> 'ANNULEE'
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut
                """,
                params,
                (rs, rowNum) -> mapperLigne(rs)
        );
    }

    private List<LigneChiffreAffaires> chargerLignesParParking(
            LocalDate debut,
            LocalDate fin
    ) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("debut", debut)
                .addValue("fin", fin);

        return jdbc.query(
                """
                select
                    p.id as periode_id,
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    greatest(p.date_debut, ap.date_debut) as eligibilite_debut,
                    least(
                        p.date_fin,
                        coalesce(ap.date_fin, p.date_fin)
                    ) as eligibilite_fin,
                    pk.id as parking_id,
                    pk.nom as parking_nom,
                    'REGULIER' as type_abonnement
                from periode_abonnement p
                join abonnement_regulier ar
                  on ar.id = p.abonnement_id
                join affectation_parking ap
                  on ap.abonnement_regulier_id = ar.id
                join parking pk
                  on pk.id = ap.parking_id
                where p.statut <> 'ANNULEE'
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut
                  and ap.date_debut <= :fin
                  and (
                        ap.date_fin is null
                        or ap.date_fin >= :debut
                  )
                  and greatest(
                        p.date_debut,
                        ap.date_debut
                  ) <= least(
                        p.date_fin,
                        coalesce(ap.date_fin, p.date_fin)
                  )

                union all

                select
                    p.id as periode_id,
                    p.prixhtapplique as montant_ht,
                    p.date_debut as periode_debut,
                    p.date_fin as periode_fin,
                    p.date_debut as eligibilite_debut,
                    p.date_fin as eligibilite_fin,
                    pk.id as parking_id,
                    pk.nom as parking_nom,
                    'CORPORATE' as type_abonnement
                from periode_abonnement p
                join abonnement_entreprise ae
                  on ae.id = p.abonnement_id
                join contrat_corporate c
                  on c.id = ae.contrat_corporate_id
                join demande_nouveau_contrat_corporate dnc
                  on dnc.contrat_genere_id = c.id
                left join tarif_parking tp
                  on tp.id = dnc.tarif_parking_id
                join parking pk
                  on pk.id = coalesce(
                        dnc.parking_id,
                        tp.parking_id
                  )
                where p.statut <> 'ANNULEE'
                  and p.date_debut <= :fin
                  and p.date_fin >= :debut
                """,
                params,
                (rs, rowNum) -> mapperLigne(rs)
        );
    }

    private LigneChiffreAffaires mapperLigne(
            java.sql.ResultSet rs
    ) throws java.sql.SQLException {
        Object parkingIdObjet = rs.getObject("parking_id");

        return new LigneChiffreAffaires(
                rs.getLong("periode_id"),
                rs.getBigDecimal("montant_ht"),
                rs.getObject("periode_debut", LocalDate.class),
                rs.getObject("periode_fin", LocalDate.class),
                rs.getObject("eligibilite_debut", LocalDate.class),
                rs.getObject("eligibilite_fin", LocalDate.class),
                parkingIdObjet == null
                        ? null
                        : ((Number) parkingIdObjet).longValue(),
                rs.getString("parking_nom"),
                TypeAbonnementReporting.valueOf(
                        rs.getString("type_abonnement")
                )
        );
    }

    private BigDecimal calculer(
            List<LigneChiffreAffaires> lignes,
            LocalDate debut,
            LocalDate fin,
            Long parkingId,
            TypeAbonnementReporting type
    ) {
        if (fin.isBefore(debut)) {
            return BigDecimal.ZERO;
        }

        return lignes.stream()
                .filter(ligne -> parkingId == null
                        || parkingId.equals(ligne.parkingId()))
                .filter(ligne -> type == TypeAbonnementReporting.TOUS
                        || type == ligne.typeAbonnement())
                .map(ligne -> ChiffreAffairesProrata.calculer(
                        ligne.montantHt(),
                        ligne.periodeDebut(),
                        ligne.periodeFin(),
                        max(debut, ligne.eligibiliteDebut()),
                        min(fin, ligne.eligibiliteFin())
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ChiffreAffairesDashboardResponse.ChiffreAffairesMensuel>
    construireSerieMensuelle(
            List<LigneChiffreAffaires> lignes,
            YearMonth premierMois,
            YearMonth dernierMois,
            LocalDate finSelectionnee,
            LocalDate aujourdHui,
            Long parkingId,
            TypeAbonnementReporting type
    ) {
        List<ChiffreAffairesDashboardResponse.ChiffreAffairesMensuel> resultat =
                new ArrayList<>(12);

        YearMonth courant = premierMois;
        while (!courant.isAfter(dernierMois)) {
            LocalDate debutMois = courant.atDay(1);
            LocalDate finMois = courant.atEndOfMonth();

            if (courant.equals(dernierMois)
                    && finSelectionnee.isBefore(finMois)) {
                finMois = finSelectionnee;
            }

            if (finMois.isAfter(aujourdHui)) {
                finMois = aujourdHui;
            }

            BigDecimal valeur = finMois.isBefore(debutMois)
                    ? BigDecimal.ZERO
                    : calculer(
                            lignes,
                            debutMois,
                            finMois,
                            parkingId,
                            type
                    );

            String libelle = courant.getMonth()
                    .getDisplayName(TextStyle.SHORT, LOCALE_FR);

            resultat.add(
                    new ChiffreAffairesDashboardResponse.ChiffreAffairesMensuel(
                            courant.getYear(),
                            courant.getMonthValue(),
                            libelle,
                            debutMois,
                            finMois,
                            montant(valeur)
                    )
            );

            courant = courant.plusMonths(1);
        }

        return resultat;
    }

    private List<ChiffreAffairesDashboardResponse.ChiffreAffairesParking>
    construireRepartitionParParking(
            List<LigneChiffreAffaires> lignes,
            PeriodeAnalyseChiffreAffaires periode,
            Long parkingId,
            TypeAbonnementReporting type,
            BigDecimal total
    ) {
        Map<ParkingCle, BigDecimal> montants = new LinkedHashMap<>();

        lignes.stream()
                .filter(ligne -> parkingId == null
                        || parkingId.equals(ligne.parkingId()))
                .filter(ligne -> type == TypeAbonnementReporting.TOUS
                        || type == ligne.typeAbonnement())
                .forEach(ligne -> {
                    BigDecimal valeur = ChiffreAffairesProrata.calculer(
                            ligne.montantHt(),
                            ligne.periodeDebut(),
                            ligne.periodeFin(),
                            max(periode.debut(), ligne.eligibiliteDebut()),
                            min(periode.fin(), ligne.eligibiliteFin())
                    );

                    ParkingCle cle = new ParkingCle(
                            ligne.parkingId(),
                            ligne.parkingNom()
                    );
                    montants.merge(cle, valeur, BigDecimal::add);
                });

        List<Map.Entry<ParkingCle, BigDecimal>> lignesTriees =
                montants.entrySet().stream()
                .filter(entree -> entree.getValue().signum() != 0)
                .sorted(Map.Entry.<ParkingCle, BigDecimal>comparingByValue()
                        .reversed()
                        .thenComparing(entree -> entree.getKey().nom()))
                .toList();

        List<BigDecimal> montantsAffiches =
                ReconciliationArrondi.reconciler(
                        lignesTriees.stream()
                                .map(Map.Entry::getValue)
                                .toList(),
                        total
                );

        List<ChiffreAffairesDashboardResponse.ChiffreAffairesParking> resultat =
                new ArrayList<>(lignesTriees.size());

        for (int index = 0; index < lignesTriees.size(); index++) {
            Map.Entry<ParkingCle, BigDecimal> ligne = lignesTriees.get(index);

            resultat.add(
                    new ChiffreAffairesDashboardResponse.ChiffreAffairesParking(
                            ligne.getKey().id(),
                            ligne.getKey().nom(),
                            montantsAffiches.get(index),
                            pourcentage(ligne.getValue(), total)
                    )
            );
        }

        return List.copyOf(resultat);
    }

    private BigDecimal evolution(
            BigDecimal actuel,
            BigDecimal precedent
    ) {
        if (precedent == null || precedent.signum() == 0) {
            return null;
        }

        return actuel
                .subtract(precedent)
                .divide(precedent, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private BigDecimal pourcentage(
            BigDecimal valeur,
            BigDecimal total
    ) {
        if (total == null || total.signum() == 0) {
            return BigDecimal.ZERO.setScale(1);
        }

        return valeur
                .divide(total, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    private BigDecimal montant(BigDecimal valeur) {
        return valeur.setScale(2, RoundingMode.HALF_UP);
    }

    private static LocalDate min(LocalDate... dates) {
        LocalDate resultat = dates[0];
        for (int index = 1; index < dates.length; index++) {
            if (dates[index].isBefore(resultat)) {
                resultat = dates[index];
            }
        }
        return resultat;
    }

    private static LocalDate max(LocalDate... dates) {
        LocalDate resultat = dates[0];
        for (int index = 1; index < dates.length; index++) {
            if (dates[index].isAfter(resultat)) {
                resultat = dates[index];
            }
        }
        return resultat;
    }

    private record LigneChiffreAffaires(
            Long periodeId,
            BigDecimal montantHt,
            LocalDate periodeDebut,
            LocalDate periodeFin,
            LocalDate eligibiliteDebut,
            LocalDate eligibiliteFin,
            Long parkingId,
            String parkingNom,
            TypeAbonnementReporting typeAbonnement
    ) {
    }

    private record ParkingCle(
            Long id,
            String nom
    ) {
    }
}
