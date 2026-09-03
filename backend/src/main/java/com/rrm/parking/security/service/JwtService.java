package com.rrm.parking.security.service;

import com.rrm.parking.security.auth.TokenAcces;
import com.rrm.parking.security.auth.UtilisateurPrincipal;
import com.rrm.parking.security.config.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public TokenAcces genererToken(
            UtilisateurPrincipal utilisateur
    ) {
        Instant maintenant = Instant.now();

        Instant expiration = maintenant.plus(
                jwtProperties.getAccessTokenExpiration()
        );

        List<String> authorities = utilisateur
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.getIssuer())
                .issuedAt(maintenant)
                .expiresAt(expiration)
                .subject(utilisateur.getUsername())
                .claim("userId", utilisateur.getId())
                .claim("authorities", authorities)
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        String token = jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();

        return new TokenAcces(token, expiration);
    }
}