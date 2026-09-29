package com.rrm.parking.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_utilisateur_etat",
        uniqueConstraints = @UniqueConstraint(name = "uk_notification_utilisateur_cle",
                columnNames = {"utilisateur_id", "cle_notification"}),
        indexes = @Index(name = "idx_notification_etat_utilisateur", columnList = "utilisateur_id"))
public class NotificationUtilisateurEtat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "cle_notification", nullable = false, length = 100)
    private String cleNotification;

    @Column(nullable = false)
    private boolean lue;

    @Column(nullable = false)
    private boolean masquee;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    protected NotificationUtilisateurEtat() {}

    public NotificationUtilisateurEtat(Long utilisateurId, String cleNotification) {
        this.utilisateurId = utilisateurId;
        this.cleNotification = cleNotification;
        this.dateModification = LocalDateTime.now();
    }

    public String getCleNotification() { return cleNotification; }
    public boolean isLue() { return lue; }
    public boolean isMasquee() { return masquee; }

    public void marquerLue() {
        lue = true;
        dateModification = LocalDateTime.now();
    }

    public void masquer() {
        masquee = true;
        dateModification = LocalDateTime.now();
    }
}
