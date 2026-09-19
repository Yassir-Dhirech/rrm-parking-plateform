package com.rrm.parking.security.config;

import com.rrm.parking.security.entity.Permission;
import com.rrm.parking.security.entity.Role;
import com.rrm.parking.security.enums.CodePermission;
import com.rrm.parking.security.enums.CodeRole;
import com.rrm.parking.security.repository.PermissionRepository;
import com.rrm.parking.security.repository.RoleRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.enums.StatutUtilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class SecurityDataInitializer
        implements ApplicationRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.enabled:false}")
    private boolean enabled;

    @Value("${app.bootstrap.agent-enabled:false}")
    private boolean agentEnabled;

    @Value("${app.bootstrap.agent-email:}")
    private String agentEmail;

    @Value("${app.bootstrap.agent-password:}")
    private String agentPassword;

    @Value("${app.bootstrap.agent-nom:Agent}")
    private String agentNom;

    @Value("${app.bootstrap.agent-prenom:Administratif}")
    private String agentPrenom;

    @Value("${app.bootstrap.supervisor-enabled:false}")
    private boolean supervisorEnabled;

    @Value("${app.bootstrap.supervisor-email:}")
    private String supervisorEmail;

    @Value("${app.bootstrap.supervisor-password:}")
    private String supervisorPassword;

    @Value("${app.bootstrap.supervisor-nom:Superviseur}")
    private String supervisorNom;

    @Value("${app.bootstrap.supervisor-prenom:RRM}")
    private String supervisorPrenom;

    @Value("${app.bootstrap.responsable-enabled:false}")
    private boolean responsableEnabled;

    @Value("${app.bootstrap.responsable-email:}")
    private String responsableEmail;

    @Value("${app.bootstrap.responsable-password:}")
    private String responsablePassword;

    @Value("${app.bootstrap.responsable-nom:Responsable}")
    private String responsableNom;

    @Value("${app.bootstrap.responsable-prenom:Stationnement}")
    private String responsablePrenom;

    @Value("${app.bootstrap.admin-email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        List<Permission> permissions = Arrays
                .stream(CodePermission.values())
                .map(this::obtenirOuCreerPermission)
                .toList();

        Arrays.stream(CodeRole.values())
                .forEach(this::obtenirOuCreerRole);

        Role roleAdministrateur = roleRepository
                .findByCode(CodeRole.ADMINISTRATEUR_SI)
                .orElseThrow();

        roleAdministrateur
                .getPermissions()
                .addAll(permissions);

        roleRepository.save(roleAdministrateur);

        Role roleAgent = roleRepository
                .findByCode(CodeRole.AGENT_ADMINISTRATIF)
                .orElseThrow();

        roleAgent.getPermissions().clear();

        permissions.stream()
                .filter(permission ->
                        permission.getCode() == CodePermission.DEMANDE_CONSULTER
                                || permission.getCode() == CodePermission.DEMANDE_MODIFIER
                                || permission.getCode() == CodePermission.PAIEMENT_ENREGISTRER
                                || permission.getCode() == CodePermission.CARTE_IMPRIMER
                )
                .forEach(permission ->
                        roleAgent.getPermissions().add(permission)
                );

        roleRepository.save(roleAgent);

        Role roleSuperviseur = configurerRoleValidation(
                CodeRole.SUPERVISEUR,
                permissions
        );
        Role roleResponsable = configurerRoleValidation(
                CodeRole.RESPONSABLE_STATIONNEMENT,
                permissions
        );

        if (enabled) {
            verifierConfiguration();

            String emailNormalise = adminEmail
                    .trim()
                    .toLowerCase(Locale.ROOT);

            Utilisateur administrateur =
                    utilisateurRepository
                            .findByEmailIgnoreCase(emailNormalise)
                            .orElseGet(() ->
                                    creerAdministrateur(
                                            emailNormalise,
                                            roleAdministrateur
                                    )
                            );

            if (!administrateur.getRoles().contains(roleAdministrateur)) {
                administrateur.ajouterRole(roleAdministrateur);
                utilisateurRepository.save(administrateur);
            }
        }

        if (agentEnabled) {
            initialiserAgent(roleAgent);
        }

        if (supervisorEnabled) {
            initialiserUtilisateurMetier(
                    roleSuperviseur,
                    supervisorEmail,
                    supervisorPassword,
                    supervisorNom,
                    supervisorPrenom,
                    "SUPERVISEUR"
            );
        }

        if (responsableEnabled) {
            initialiserUtilisateurMetier(
                    roleResponsable,
                    responsableEmail,
                    responsablePassword,
                    responsableNom,
                    responsablePrenom,
                    "RESPONSABLE"
            );
        }
    }

    private Role configurerRoleValidation(
            CodeRole codeRole,
            List<Permission> permissions
    ) {
        Role role = roleRepository
                .findByCode(codeRole)
                .orElseThrow();

        role.getPermissions().clear();
        permissions.stream()
                .filter(permission ->
                        permission.getCode()
                                == CodePermission.DEMANDE_CONSULTER
                                || permission.getCode()
                                == CodePermission.DEMANDE_VALIDER
                                || (codeRole == CodeRole.SUPERVISEUR
                                && permission.getCode()
                                == CodePermission.CARTE_ACTIVER)
                )
                .forEach(role.getPermissions()::add);

        return roleRepository.save(role);
    }

    private Permission obtenirOuCreerPermission(
            CodePermission code
    ) {
        return permissionRepository
                .findByCode(code)
                .orElseGet(() -> {
                    Permission permission =
                            new Permission();

                    permission.setCode(code);
                    permission.setLibelle(
                            formaterCode(code.name())
                    );
                    permission.setDescription(
                            "Permission système : "
                                    + formaterCode(code.name())
                    );
                    permission.setActive(true);

                    return permissionRepository.save(
                            permission
                    );
                });
    }

    private Role obtenirOuCreerRole(CodeRole code) {
        return roleRepository
                .findByCode(code)
                .orElseGet(() -> {
                    Role role = new Role();

                    role.setCode(code);
                    role.setLibelle(
                            formaterCode(code.name())
                    );
                    role.setDescription(
                            "Rôle système : "
                                    + formaterCode(code.name())
                    );
                    role.setActive(true);

                    return roleRepository.save(role);
                });
    }

    private Utilisateur creerAdministrateur(
            String email,
            Role roleAdministrateur
    ) {
        Utilisateur administrateur =
                new Utilisateur();

        administrateur.setNom("Administrateur");
        administrateur.setPrenom("SI");
        administrateur.setEmail(email);

        administrateur.setMotDePasseHash(
                passwordEncoder.encode(adminPassword)
        );

        administrateur.setStatut(
                StatutUtilisateur.ACTIF
        );

        administrateur.ajouterRole(
                roleAdministrateur
        );

        return utilisateurRepository.save(
                administrateur
        );
    }

    private void initialiserAgent(Role roleAgent) {
        verifierConfigurationAgent();

        String emailNormalise = agentEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        Utilisateur agent = utilisateurRepository
                .findByEmailIgnoreCase(emailNormalise)
                .orElseGet(() -> creerAgent(
                        emailNormalise,
                        roleAgent
                ));

        if (!agent.getRoles().contains(roleAgent)) {
            agent.ajouterRole(roleAgent);
            utilisateurRepository.save(agent);
        }
    }

    private void initialiserUtilisateurMetier(
            Role role,
            String email,
            String motDePasse,
            String nom,
            String prenom,
            String libelle
    ) {
        verifierConfigurationUtilisateur(
                email,
                motDePasse,
                nom,
                prenom,
                libelle
        );

        String emailNormalise = email
                .trim()
                .toLowerCase(Locale.ROOT);

        Utilisateur utilisateur = utilisateurRepository
                .findByEmailIgnoreCase(emailNormalise)
                .orElseGet(() -> creerUtilisateurMetier(
                        emailNormalise,
                        motDePasse,
                        nom,
                        prenom,
                        role
                ));

        if (!utilisateur.getRoles().contains(role)) {
            utilisateur.ajouterRole(role);
            utilisateurRepository.save(utilisateur);
        }
    }

    private Utilisateur creerUtilisateurMetier(
            String email,
            String motDePasse,
            String nom,
            String prenom,
            Role role
    ) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(nom.trim());
        utilisateur.setPrenom(prenom.trim());
        utilisateur.setEmail(email);
        utilisateur.setMotDePasseHash(
                passwordEncoder.encode(motDePasse)
        );
        utilisateur.setStatut(StatutUtilisateur.ACTIF);
        utilisateur.ajouterRole(role);
        return utilisateurRepository.save(utilisateur);
    }

    private void verifierConfigurationUtilisateur(
            String email,
            String motDePasse,
            String nom,
            String prenom,
            String libelle
    ) {
        if (email == null
                || email.isBlank()
                || !email.contains("@")) {
            throw new IllegalStateException(
                    "RRM_" + libelle + "_EMAIL est invalide"
            );
        }

        if (motDePasse == null || motDePasse.length() < 12) {
            throw new IllegalStateException(
                    "RRM_" + libelle
                            + "_PASSWORD doit contenir au moins 12 caractères"
            );
        }

        if (nom == null || nom.isBlank()
                || prenom == null || prenom.isBlank()) {
            throw new IllegalStateException(
                    "Le nom et le prénom du profil "
                            + libelle.toLowerCase(Locale.ROOT)
                            + " sont obligatoires"
            );
        }
    }

    private Utilisateur creerAgent(
            String email,
            Role roleAgent
    ) {
        Utilisateur agent = new Utilisateur();

        agent.setNom(agentNom.trim());
        agent.setPrenom(agentPrenom.trim());
        agent.setEmail(email);
        agent.setMotDePasseHash(
                passwordEncoder.encode(agentPassword)
        );
        agent.setStatut(StatutUtilisateur.ACTIF);
        agent.ajouterRole(roleAgent);

        return utilisateurRepository.save(agent);
    }

    private void verifierConfigurationAgent() {
        if (agentEmail == null
                || agentEmail.isBlank()
                || !agentEmail.contains("@")) {
            throw new IllegalStateException(
                    "RRM_AGENT_EMAIL est invalide"
            );
        }

        if (agentPassword == null
                || agentPassword.length() < 12) {
            throw new IllegalStateException(
                    "RRM_AGENT_PASSWORD doit contenir au moins 12 caractères"
            );
        }

        if (agentNom == null || agentNom.isBlank()
                || agentPrenom == null || agentPrenom.isBlank()) {
            throw new IllegalStateException(
                    "Le nom et le prénom de l'agent sont obligatoires"
            );
        }
    }

    private void verifierConfiguration() {
        if (adminEmail == null
                || adminEmail.isBlank()
                || !adminEmail.contains("@")) {

            throw new IllegalStateException(
                    "RRM_ADMIN_EMAIL est invalide"
            );
        }

        if (adminPassword == null
                || adminPassword.length() < 12) {

            throw new IllegalStateException(
                    "RRM_ADMIN_PASSWORD doit contenir "
                            + "au moins 12 caractères"
            );
        }
    }

    private String formaterCode(String code) {
        return code
                .replace('_', ' ')
                .toLowerCase(Locale.ROOT);
    }
}
