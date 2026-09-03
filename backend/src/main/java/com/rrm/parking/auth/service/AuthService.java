package com.rrm.parking.auth.service;

import com.rrm.parking.auth.dto.LoginRequest;
import com.rrm.parking.auth.dto.LoginResponse;
import com.rrm.parking.security.auth.TokenAcces;
import com.rrm.parking.security.auth.UtilisateurPrincipal;
import com.rrm.parking.security.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse connecter(LoginRequest request) {

        String emailNormalise = request
                .email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                emailNormalise,
                                request.motDePasse()
                        )
                );

        UtilisateurPrincipal utilisateur =
                (UtilisateurPrincipal) authentication.getPrincipal();

        TokenAcces token =
                jwtService.genererToken(utilisateur);

        return new LoginResponse(
                token.valeur(),
                "Bearer",
                token.expiration()
        );
    }
}