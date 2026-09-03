package com.rrm.parking.auth.dto;

import java.util.List;

public record CurrentUserResponse(
        Long id,
        String email,
        List<String> authorities
) {
}