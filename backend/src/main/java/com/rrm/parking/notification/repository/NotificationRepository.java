package com.rrm.parking.notification.repository;

import com.rrm.parking.notification.entity.Notification;
import com.rrm.parking.notification.enums.StatutNotification;
import com.rrm.parking.notification.enums.TypeNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    Optional<Notification> findByReference(
            String reference
    );

    boolean existsByReference(
            String reference
    );

    List<Notification>
    findByClientDestinataireIdOrderByDateCreationDesc(
            Long clientId
    );

    List<Notification>
    findByUtilisateurDestinataireIdOrderByDateCreationDesc(
            Long utilisateurId
    );

    List<Notification>
    findByStatutAndDateEnvoiPrevueLessThanEqualOrderByDateEnvoiPrevueAsc(
            StatutNotification statut,
            LocalDateTime dateLimite
    );

    List<Notification> findByTypeNotification(
            TypeNotification typeNotification
    );

    List<Notification> findByReferenceMetier(
            String referenceMetier
    );
}