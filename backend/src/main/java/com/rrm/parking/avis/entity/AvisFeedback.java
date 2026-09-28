package com.rrm.parking.avis.entity;

import com.rrm.parking.parking.entity.Parking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "avis_feedback", indexes = @Index(name = "idx_avis_feedback_date", columnList = "date_creation"))
@Getter @Setter @NoArgsConstructor
public class AvisFeedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_avis", nullable = false, length = 30)
    private String typeAvis;

    @Column(name = "note_satisfaction", nullable = false)
    private Integer noteSatisfaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_id")
    private Parking parking;

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(name = "nom_contact", length = 150)
    private String nomContact;

    @Column(name = "contact_info", length = 255)
    private String contactInfo;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void avantCreation() {
        dateCreation = LocalDateTime.now();
    }
}
