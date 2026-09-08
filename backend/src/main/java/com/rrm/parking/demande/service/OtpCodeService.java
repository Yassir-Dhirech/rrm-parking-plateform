package com.rrm.parking.demande.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpCodeService {

    private static final int NOMBRE_DE_CODES_POSSIBLES =
            1_000_000;

    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public String genererCode() {
        int valeur = secureRandom.nextInt(
                NOMBRE_DE_CODES_POSSIBLES
        );

        return String.format("%06d", valeur);
    }

    public String hacherCode(String code) {
        verifierFormat(code);
        return passwordEncoder.encode(code);
    }

    public boolean correspond(
            String codeSaisi,
            String codeHash
    ) {
        if (codeSaisi == null
                || codeHash == null
                || !codeSaisi.matches("^[0-9]{6}$")) {
            return false;
        }

        return passwordEncoder.matches(
                codeSaisi,
                codeHash
        );
    }

    private void verifierFormat(String code) {
        if (code == null
                || !code.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException(
                    "Le code OTP doit contenir exactement 6 chiffres"
            );
        }
    }
}