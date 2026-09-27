package com.rrm.parking.cheque.dto;

import com.rrm.parking.notification.entity.Notification;
import java.time.LocalDateTime;

public record NotificationRejetResponse(Long id, String sujet, String contenu, LocalDateTime dateCreation) {
    public static NotificationRejetResponse depuis(Notification notification) {
        return new NotificationRejetResponse(notification.getId(), notification.getSujet(),
                notification.getContenu(), notification.getDateCreation());
    }
}
