package com.rrm.parking.auth.controller;

import com.rrm.parking.auth.dto.LoginRequest;
import com.rrm.parking.auth.dto.LoginResponse;
import com.rrm.parking.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rrm.parking.auth.dto.CurrentUserResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ================================================
    //         Login Controller
    // ================================================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> connecter(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response =
                authService.connecter(request);

        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(response);
    }

    // ================================================
    // Controller me => infos sur l'utilisateur courant
    // ================================================
    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Number userIdClaim = jwt.getClaim("userId");
        List<String> authorities = jwt.getClaimAsStringList("authorities");

        return new CurrentUserResponse(
                userIdClaim.longValue(),
                jwt.getSubject(),
                authorities == null ? List.of() : authorities
        );
    }
}