package com.rrm.parking.avis.dto;

import java.time.LocalDateTime;
import java.util.List;

public final class AvisResponse {
    private AvisResponse() {}

    public record Detail(Long id, String typeAvis, Integer noteSatisfaction,
                         Long parkingId, String parkingNom, String message,
                         String nomContact, String contactInfo, LocalDateTime dateCreation) {}

    public record Repartition(int note, long nombre, double pourcentage) {}

    public record Statistiques(long total, double moyenne, long cinqEtoiles,
                               List<Repartition> repartition) {}
}
