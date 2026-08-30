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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
}