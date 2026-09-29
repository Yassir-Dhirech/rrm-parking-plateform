package com.rrm.parking.notification.repository;

import com.rrm.parking.notification.entity.NotificationUtilisateurEtat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationUtilisateurEtatRepository extends JpaRepository<NotificationUtilisateurEtat, Long> {
    List<NotificationUtilisateurEtat> findByUtilisateurId(Long utilisateurId);
    Optional<NotificationUtilisateurEtat> findByUtilisateurIdAndCleNotification(Long utilisateurId, String cleNotification);
}
