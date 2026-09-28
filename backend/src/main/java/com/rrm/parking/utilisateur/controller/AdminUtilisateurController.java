package com.rrm.parking.utilisateur.controller;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.parking.repository.ParkingRepository;
import com.rrm.parking.security.entity.Role;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.security.repository.RoleRepository;
import com.rrm.parking.utilisateur.entity.AffectationAgentParking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import com.rrm.parking.utilisateur.repository.AffectationAgentParkingRepository;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@RequiredArgsConstructor
public class AdminUtilisateurController {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final AffectationAgentParkingRepository affectationRepository;
    private final ParkingRepository parkingRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    // 1. Lister tous les utilisateurs réels avec leurs parkings assignés
    @GetMapping
    @Transactional(readOnly = true)
    public List<UtilisateurDto> listerTous() {
        return utilisateurRepository.findAll().stream().map(u -> {
            String roleCode = u.getRoles().stream()
                    .findFirst()
                    .map(r -> versFrontendRole(r.getCode()))
                    .orElse("AGENT");

            List<AffectationAgentParking> affectations = affectationRepository
                    .findAllByUtilisateurIdAndActiveTrue(u.getId());

            List<Long> pIds = affectations.stream().map(a -> a.getParking().getId()).toList();
            List<String> pNoms = affectations.stream().map(a -> a.getParking().getNom()).toList();

            return new UtilisateurDto(
                    u.getId(),
                    u.getNom(),
                    u.getPrenom(),
                    u.getEmail(),
                    roleCode,
                    u.getStatut() != null ? u.getStatut().name() : "ACTIF",
                    u.getStatut() == StatutUtilisateur.ACTIF,
                    pIds,
                    pNoms,
                    u.getDateDerniereConnexion(),
                    u.getDateCreation()
            );
        }).toList();
    }

    // 2. Modifier un utilisateur existant (Informations, Rôle, Statut, Multi-Parkings)
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody MajUtilisateurRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        user.setNom(req.nom().trim());
        user.setPrenom(req.prenom().trim());
        user.setEmail(req.email().trim().toLowerCase(Locale.ROOT));

        if (req.statut() != null) {
            try {
                user.setStatut(StatutUtilisateur.valueOf(req.statut()));
            } catch (Exception ignored) {}
        }

        if (req.motDePasse() != null && !req.motDePasse().isBlank()) {
            user.setMotDePasseHash(passwordEncoder.encode(req.motDePasse().trim()));
        }

        if (req.role() != null) {
            CodeRole codeRole = versBackendRole(req.role());
            roleRepository.findByCode(codeRole).ifPresent(nouveauRole -> {
                user.getRoles().clear();
                user.ajouterRole(nouveauRole);
            });
        }

        // Mise à jour des parkings assignés (Cases à cocher multiples)
        if (req.parkingAssigneIds() != null) {
            List<AffectationAgentParking> anciennes = affectationRepository.findAllByUtilisateurIdAndActiveTrue(user.getId());
            for (AffectationAgentParking aff : anciennes) {
                aff.setActive(false);
                aff.setDateFin(LocalDate.now());
                affectationRepository.save(aff);
            }

            for (Long pId : req.parkingAssigneIds()) {
                parkingRepository.findById(pId).ifPresent(p -> {
                    AffectationAgentParking nouvelle = new AffectationAgentParking();
                    nouvelle.setUtilisateur(user);
                    nouvelle.setParking(p);
                    nouvelle.setDateDebut(LocalDate.now());
                    nouvelle.setActive(true);
                    affectationRepository.save(nouvelle);
                });
            }
        }

        utilisateurRepository.save(user);

        // Journal d'audit
        auditLogRepository.save(new AuditLog(
                user,
                user.getEmail(),
                null,
                TypeActionAudit.MODIFICATION,
                ResultatAudit.SUCCES,
                "UTILISATEUR",
                user.getId(),
                user.getEmail(),
                "Informations utilisateur modifiées par Admin (" + (jwt != null ? jwt.getSubject() : "Admin") + ")",
                "Rôle: " + req.role() + ", Statut: " + req.statut(),
                null, null, "PUT", "/api/admin/utilisateurs/" + id, null
        ));

        return ResponseEntity.ok(Map.of("message", "Utilisateur mis à jour avec succès"));
    }

    // 3. Créer un nouvel utilisateur avec plusieurs parkings cochés
    @PostMapping
    @Transactional
    public ResponseEntity<?> creer(
            @RequestBody CreerUtilisateurRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        if (utilisateurRepository.existsByEmailIgnoreCase(req.email().trim())) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Cet email est déjà utilisé."));
        }

        Utilisateur user = new Utilisateur();
        user.setNom(req.nom().trim());
        user.setPrenom(req.prenom().trim());
        user.setEmail(req.email().trim().toLowerCase(Locale.ROOT));
        user.setMotDePasseHash(passwordEncoder.encode(req.motDePasse() != null && !req.motDePasse().isBlank() ? req.motDePasse() : "agent12345678"));
        user.setStatut(StatutUtilisateur.ACTIF);

        CodeRole codeRole = versBackendRole(req.role());
        roleRepository.findByCode(codeRole).ifPresent(user::ajouterRole);

        Utilisateur sauve = utilisateurRepository.save(user);

        if (req.parkingAssigneIds() != null) {
            for (Long pId : req.parkingAssigneIds()) {
                parkingRepository.findById(pId).ifPresent(p -> {
                    AffectationAgentParking aff = new AffectationAgentParking();
                    aff.setUtilisateur(sauve);
                    aff.setParking(p);
                    aff.setDateDebut(LocalDate.now());
                    aff.setActive(true);
                    affectationRepository.save(aff);
                });
            }
        }

        auditLogRepository.save(new AuditLog(
                sauve,
                sauve.getEmail(),
                null,
                TypeActionAudit.CREATION,
                ResultatAudit.SUCCES,
                "UTILISATEUR",
                sauve.getId(),
                sauve.getEmail(),
                "Création d'un nouvel utilisateur par Admin (" + (jwt != null ? jwt.getSubject() : "Admin") + ")",
                "Rôle: " + req.role(),
                null, null, "POST", "/api/admin/utilisateurs", null
        ));

        return ResponseEntity.ok(Map.of("message", "Utilisateur créé avec succès", "id", sauve.getId()));
    }

    // 4. Supprimer définitivement un compte utilisateur (Clean-up des clés étrangères)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> supprimer(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        String userEmail = user.getEmail();

        // 1. Supprimer toutes les affectations de parking
        List<AffectationAgentParking> affs = affectationRepository.findAllByUtilisateurIdOrderByDateDebutDesc(id);
        affectationRepository.deleteAll(affs);

        // 2. Nettoyer les notifications reçues
        entityManager.createNativeQuery("DELETE FROM notification WHERE utilisateur_destinataire_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        // 3. Détacher les références dans les tables métier pour éviter les erreurs de contrainte #1451
        entityManager.createNativeQuery("UPDATE audit_log SET acteur_utilisateur_id = NULL WHERE acteur_utilisateur_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE demande_client SET initiee_par_id = NULL WHERE initiee_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE paiement SET traite_par_id = NULL WHERE traite_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE piece_jointe SET deposee_par_id = NULL WHERE deposee_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE piece_jointe SET validee_par_id = NULL WHERE validee_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE demande_operationnelle SET creee_par_id = NULL WHERE creee_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE demande_operationnelle SET affectee_a_id = NULL WHERE affectee_a_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE demande_operationnelle SET executee_par_id = NULL WHERE executee_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE historique_statut_demande SET effectue_par_id = NULL WHERE effectue_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE contrat_corporate SET signe_par_id = NULL WHERE signe_par_id = :uid")
                .setParameter("uid", id)
                .executeUpdate();

        // 4. Détacher les rôles dans la table de jointure
        user.getRoles().clear();
        utilisateurRepository.save(user);

        // 5. Supprimer définitivement l'utilisateur
        utilisateurRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "Compte utilisateur " + userEmail + " supprimé définitivement."));
    }

    // 5. Logs d'activité de l'utilisateur
    @GetMapping("/{id}/logs")
    @Transactional(readOnly = true)
    public List<UserLogDto> listerLogsUtilisateur(@PathVariable Long id) {
        return auditLogRepository
                .findByActeurIdOrderByDateEvenementDesc(id, PageRequest.of(0, 50))
                .getContent()
                .stream()
                .map(l -> new UserLogDto(
                        l.getId(),
                        l.getDateEvenement(),
                        l.getTypeAction().name(),
                        l.getResultat().name(),
                        l.getMessage(),
                        l.getTypeObjet(),
                        l.getReferenceObjet(),
                        l.getDetailsTechniques(),
                        l.getAdresseIp()
                ))
                .toList();
    }

    private String versFrontendRole(CodeRole code) {
        return switch (code) {
            case ADMINISTRATEUR_SI -> "ADMIN_SI";
            case AGENT_ADMINISTRATIF -> "AGENT";
            case SUPERVISEUR -> "SUPERVISEUR";
            case RESPONSABLE_STATIONNEMENT -> "RESPONSABLE";
            case COMPTABLE -> "COMPTABLE";
            case RESPONSABLE_REPORTING -> "RESP_REPORTING";
            default -> code.name();
        };
    }

    private CodeRole versBackendRole(String role) {
        return switch (role) {
            case "ADMIN_SI" -> CodeRole.ADMINISTRATEUR_SI;
            case "AGENT" -> CodeRole.AGENT_ADMINISTRATIF;
            case "SUPERVISEUR" -> CodeRole.SUPERVISEUR;
            case "RESPONSABLE" -> CodeRole.RESPONSABLE_STATIONNEMENT;
            case "COMPTABLE" -> CodeRole.COMPTABLE;
            case "RESP_REPORTING" -> CodeRole.RESPONSABLE_REPORTING;
            default -> CodeRole.AGENT_ADMINISTRATIF;
        };
    }

    public record UtilisateurDto(
            Long id,
            String nom,
            String prenom,
            String email,
            String role,
            String statut,
            boolean actif,
            List<Long> parkingAssigneIds,
            List<String> parkingAssigneNoms,
            LocalDateTime dateDerniereConnexion,
            LocalDateTime dateCreation
    ) {}

    public record MajUtilisateurRequest(
            String nom,
            String prenom,
            String email,
            String role,
            String statut,
            List<Long> parkingAssigneIds,
            String motDePasse
    ) {}

    public record CreerUtilisateurRequest(
            String nom,
            String prenom,
            String email,
            String role,
            List<Long> parkingAssigneIds,
            String motDePasse
    ) {}

    public record UserLogDto(
            Long id,
            LocalDateTime dateEvenement,
            String typeAction,
            String resultat,
            String message,
            String typeObjet,
            String referenceObjet,
            String detailsTechniques,
            String adresseIp
    ) {}
}
