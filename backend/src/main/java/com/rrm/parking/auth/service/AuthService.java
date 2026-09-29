package com.rrm.parking.auth.service;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.auth.dto.LoginRequest;
import com.rrm.parking.auth.dto.LoginResponse;
import com.rrm.parking.security.auth.TokenAcces;
import com.rrm.parking.security.auth.UtilisateurPrincipal;
import com.rrm.parking.security.service.JwtService;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public LoginResponse connecter(LoginRequest request) {

        String emailNormalise = request
                .email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // 1. Authentification standard Spring Security
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                emailNormalise,
                                request.motDePasse()
                        )
                );

        UtilisateurPrincipal utilisateur =
                (UtilisateurPrincipal) authentication.getPrincipal();

        // 2. Enregistrement sécurisé (ne bloque JAMAIS la connexion en cas d'erreur d'audit)
        try {
            utilisateurRepository.findById(utilisateur.getId()).ifPresent(user -> {
                user.setDateDerniereConnexion(LocalDateTime.now());
                user.setTentativesConnexionEchouees(0);
                utilisateurRepository.save(user);

                auditLogRepository.save(new AuditLog(
                        user,
                        user.getEmail(),
                        null,
                        TypeActionAudit.AUTHENTIFICATION_REUSSIE,
                        ResultatAudit.SUCCES,
                        "AUTHENTIFICATION",
                        user.getId(),
                        user.getEmail(),
                        "Connexion réussie au système",
                        "Authentification réussie",
                        null, null, "POST",
                        "/api/v1/auth/login",
                        null
                ));
            });
        } catch (Exception ex) {
            System.err.println("Avertissement audit connexion: " + ex.getMessage());
        }

        // 3. Génération du token JWT
        TokenAcces token =
                jwtService.genererToken(utilisateur);

        return new LoginResponse(
                token.valeur(),
                "Bearer",
                token.expiration()
        );
    }

    public void deconnecter(Long utilisateurId) {
        if (utilisateurId == null) return;
        try {
            utilisateurRepository.findById(utilisateurId).ifPresent(user -> {
                auditLogRepository.save(new AuditLog(
                        user,
                        user.getEmail(),
                        null,
                        TypeActionAudit.CONSULTATION,
                        ResultatAudit.SUCCES,
                        "AUTHENTIFICATION",
                        user.getId(),
                        user.getEmail(),
                        "Déconnexion de l'utilisateur",
                        "Session clôturée",
                        null, null, "POST",
                        "/api/v1/auth/logout",
                        null
                ));
            });
        } catch (Exception ex) {
            System.err.println("Avertissement audit déconnexion: " + ex.getMessage());
        }
    }
}
