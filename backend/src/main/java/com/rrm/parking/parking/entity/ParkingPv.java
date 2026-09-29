package com.rrm.parking.parking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "parking_pv")
@Getter
@Setter
@NoArgsConstructor
public class ParkingPv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parking_id", nullable = false)
    private Parking parking;

    @Column(name = "nom_fichier", nullable = false, length = 255)
    private String nomFichier;

    @Column(name = "type_mime", nullable = false, length = 100)
    private String typeMime;

    @Lob
    @Column(name = "contenu", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] contenu;

    @Column(name = "date_depot", nullable = false)
    private LocalDateTime dateDepot;

    @PrePersist
    void avantCreation() {
        if (dateDepot == null) dateDepot = LocalDateTime.now();
    }
}
