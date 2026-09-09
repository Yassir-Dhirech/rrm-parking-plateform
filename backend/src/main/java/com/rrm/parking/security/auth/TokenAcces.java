package com.rrm.parking.security.auth;

import java.time.Instant;

public record TokenAcces(
        String valeur,
        Instant expiration
) {
}