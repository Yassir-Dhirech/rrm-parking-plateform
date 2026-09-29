package com.rrm.parking.notification.dto;

import java.time.LocalDateTime;

public record NotificationSuperviseurResponse(
        String id,
        String title,
        String message,
        LocalDateTime createdAt,
        String type,
        String category,
        boolean read,
        String link
) {}
