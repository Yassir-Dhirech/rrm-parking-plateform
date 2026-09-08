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

        if (!enabled) {
            return;
        }

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

        if (!administrateur
                .getRoles()
                .contains(roleAdministrateur)) {

            administrateur.ajouterRole(
                    roleAdministrateur
            );

            utilisateurRepository.save(
                    administrateur
            );
        }
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