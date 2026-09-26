package com.rrm.parking.dashboard.service;

import com.rrm.parking.carte.dto.response.CarteAgentResponse;
import com.rrm.parking.carte.enums.StatutCarteAcces;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.dashboard.dto.response.AbonnementsMensuelsAgentResponse;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AgentParkingRegistreService {

    private static final ZoneId ZONE_RRM = ZoneId.of("Africa/Casablanca");

    private static final String CARTES = """
            select registre.* from (
              select c.id, c.reference, c.numero_carte, c.statut,
                     c.immatriculation_affectee, c.date_creation,
                     a.reference as abonnement_reference,
                     concat_ws(' ', cp.prenom, cp.nom) as client_nom,
                     cp.cin as client_identifiant,
                     'REGULIER' as type_abonnement
              from carte_acces c
              join abonnement a on a.id = c.abonnement_id
              join abonnement_regulier ar on ar.id = a.id
              join client_particulier cp on cp.id = ar.client_particulier_id
              join affectation_parking ap on ap.abonnement_regulier_id = ar.id
              where ap.parking_id = :parkingId
                and ap.date_debut <= :date
                and not exists (
                  select 1 from affectation_parking plus_recente
                  where plus_recente.abonnement_regulier_id = ar.id
                    and plus_recente.date_debut <= :date
                    and plus_recente.date_debut > ap.date_debut
                )
              union all
              select c.id, c.reference, c.numero_carte, c.statut,
                     c.immatriculation_affectee, c.date_creation,
                     a.reference as abonnement_reference,
                     ce.raison_sociale as client_nom,
                     ce.ice as client_identifiant,
                     'CORPORATE' as type_abonnement
              from carte_acces c
              join abonnement a on a.id = c.abonnement_id
              join demande_nouveau_contrat_corporate d
                on d.abonnement_genere_id = a.id
              join demande_client dc on dc.id = d.id
              join client_entreprise ce on ce.id = dc.client_id
              where d.parking_id = :parkingId
            ) registre
            where (:statut is null or registre.statut = :statut)
              and (:type is null or registre.type_abonnement = :type)
              and (:recherche is null
                or lower(registre.reference) like :recherche escape '!'
                or lower(coalesce(registre.numero_carte, '')) like :recherche escape '!'
                or lower(registre.abonnement_reference) like :recherche escape '!'
                or lower(registre.client_nom) like :recherche escape '!'
                or lower(registre.client_identifiant) like :recherche escape '!'
                or lower(coalesce(registre.immatriculation_affectee, '')) like :recherche escape '!')
            order by registre.date_creation desc, registre.id desc
            """;

    private static final String REGULIERS_MOIS = """
            select count(distinct ar.id)
            from abonnement_regulier ar
            join affectation_parking ap on ap.abonnement_regulier_id = ar.id
            join periode_abonnement p on p.abonnement_id = ar.id
            where ap.parking_id = :parkingId
              and ap.date_debut <= :fin
              and (ap.date_fin is null or ap.date_fin >= :debut)
              and p.statut <> 'ANNULEE'
              and p.date_debut <= :fin and p.date_fin >= :debut
              and ap.date_debut <= p.date_fin
              and (ap.date_fin is null or ap.date_fin >= p.date_debut)
            """;

    private static final String CORPORATE_MOIS = """
            select count(distinct d.abonnement_genere_id)
            from demande_nouveau_contrat_corporate d
            join abonnement_entreprise ae on ae.id = d.abonnement_genere_id
            join contrat_corporate c on c.id = ae.contrat_corporate_id
            where d.parking_id = :parkingId
              and c.date_debut <= :fin and c.date_fin >= :debut
            """;

    private final NamedParameterJdbcTemplate jdbc;
    private final AffectationAgentParkingRepository affectationRepository;

    @Transactional(readOnly = true)
    public List<CarteAgentResponse> cartes(Long agentId, String recherche,
            StatutCarteAcces statut, String type) {
        Parking parking = parkingAgent(agentId);
        String typeNormalise = type == null || type.isBlank()
                ? null : type.trim().toUpperCase(Locale.ROOT);
        if (typeNormalise != null && !List.of("REGULIER", "CORPORATE")
                .contains(typeNormalise)) {
            throw new IllegalArgumentException("Type d'abonnement invalide");
        }
        String terme = recherche == null || recherche.isBlank() ? null
                : "%" + recherche.trim().toLowerCase(Locale.ROOT)
                        .replace("!", "!!").replace("%", "!%")
                        .replace("_", "!_") + "%";
        var params = new MapSqlParameterSource()
                .addValue("parkingId", parking.getId())
                .addValue("date", LocalDate.now(ZONE_RRM))
                .addValue("statut", statut == null ? null : statut.name())
                .addValue("type", typeNormalise)
                .addValue("recherche", terme);
        return jdbc.query(CARTES, params, (rs, row) ->
                convertirCarte(rs, parking));
    }

    @Transactional(readOnly = true)
    public AbonnementsMensuelsAgentResponse abonnementsMensuels(
            Long agentId, int annee) {
        if (annee < 2000 || annee > 2100) {
            throw new IllegalArgumentException("Année invalide");
        }
        Parking parking = parkingAgent(agentId);
        LocalDate aujourdHui = LocalDate.now(ZONE_RRM);
        List<AbonnementsMensuelsAgentResponse.Mois> mois =
                java.util.stream.IntStream.rangeClosed(1, 12)
                        .mapToObj(numero -> {
                            YearMonth periode = YearMonth.of(annee, numero);
                            if (periode.atDay(1).isAfter(aujourdHui)) {
                                return new AbonnementsMensuelsAgentResponse.Mois(
                                        numero, 0);
                            }
                            var params = new MapSqlParameterSource()
                                    .addValue("parkingId", parking.getId())
                                    .addValue("debut", periode.atDay(1))
                                    .addValue("fin", periode.atEndOfMonth()
                                            .isAfter(aujourdHui)
                                            ? aujourdHui : periode.atEndOfMonth());
                            Long reguliers = jdbc.queryForObject(
                                    REGULIERS_MOIS, params, Long.class);
                            Long corporate = jdbc.queryForObject(
                                    CORPORATE_MOIS, params, Long.class);
                            return new AbonnementsMensuelsAgentResponse.Mois(
                                    numero,
                                    (reguliers == null ? 0 : reguliers)
                                            + (corporate == null ? 0 : corporate));
                        }).toList();
        return new AbonnementsMensuelsAgentResponse(
                parking.getId(), parking.getNom(), annee, mois);
    }

    private Parking parkingAgent(Long agentId) {
        LocalDate date = LocalDate.now(ZONE_RRM);
        return affectationRepository.findByUtilisateurIdAndActiveTrue(agentId)
                .filter(affectation -> affectation.getDateDebut() != null
                        && !affectation.getDateDebut().isAfter(date))
                .filter(affectation -> affectation.getDateFin() == null
                        || !affectation.getDateFin().isBefore(date))
                .map(affectation -> affectation.getParking())
                .orElseThrow(() -> new ConflitMetierException(
                        "L'agent ne possède pas d'affectation active à un parking"));
    }

    private CarteAgentResponse convertirCarte(ResultSet rs, Parking parking)
            throws SQLException {
        return new CarteAgentResponse(
                rs.getLong("id"), rs.getString("reference"),
                rs.getString("numero_carte"),
                StatutCarteAcces.valueOf(rs.getString("statut")),
                rs.getString("abonnement_reference"),
                rs.getString("client_nom"),
                rs.getString("immatriculation_affectee"),
                rs.getString("type_abonnement"),
                parking.getId(), parking.getNom(),
                rs.getTimestamp("date_creation").toLocalDateTime());
    }
}
