package com.rrm.parking.avis.service;

import com.rrm.parking.avis.dto.AvisResponse;
import com.rrm.parking.avis.dto.CreerAvisRequest;
import com.rrm.parking.avis.entity.AvisFeedback;
import com.rrm.parking.avis.repository.AvisFeedbackRepository;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.parking.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AvisFeedbackService {
    private static final Set<String> TYPES = Set.of("SUGGESTION", "SATISFACTION", "RECLAMATION", "AUTRE");
    private final AvisFeedbackRepository avis;
    private final ParkingRepository parkings;

    @Transactional
    public AvisResponse.Detail creer(CreerAvisRequest requete) {
        if (!TYPES.contains(requete.typeAvis())) {
            throw new IllegalArgumentException("Type d'avis inconnu");
        }
        AvisFeedback entite = new AvisFeedback();
        entite.setTypeAvis(requete.typeAvis());
        entite.setNoteSatisfaction(requete.noteSatisfaction());
        entite.setMessage(requete.message().trim());
        entite.setNomContact(optionnel(requete.nomContact()));
        entite.setContactInfo(optionnel(requete.contactInfo()));
        if (requete.parkingId() != null) {
            entite.setParking(parkings.findById(requete.parkingId())
                    .orElseThrow(() -> new RessourceIntrouvableException("Parking introuvable")));
        }
        return detail(avis.saveAndFlush(entite));
    }

    @Transactional(readOnly = true)
    public Page<AvisResponse.Detail> lister(int page, int taille) {
        return avis.pageAvecParking(PageRequest.of(page, Math.min(taille, 100),
                        Sort.by(Sort.Order.desc("dateCreation"), Sort.Order.desc("id"))))
                .map(this::detail);
    }

    @Transactional(readOnly = true)
    public List<AvisResponse.Detail> tous() {
        return avis.tousAvecParking().stream().map(this::detail).toList();
    }

    @Transactional(readOnly = true)
    public AvisResponse.Statistiques statistiques() {
        Map<Integer, Long> comptes = avis.repartirParNote().stream()
                .collect(Collectors.toMap(ligne -> ((Number) ligne[0]).intValue(),
                        ligne -> ((Number) ligne[1]).longValue()));
        long total = comptes.values().stream().mapToLong(Long::longValue).sum();
        long somme = comptes.entrySet().stream()
                .mapToLong(e -> (long) e.getKey() * e.getValue()).sum();
        List<AvisResponse.Repartition> repartition = new ArrayList<>();
        for (int note = 1; note <= 5; note++) {
            long nombre = comptes.getOrDefault(note, 0L);
            repartition.add(new AvisResponse.Repartition(note, nombre,
                    total == 0 ? 0 : nombre * 100.0 / total));
        }
        return new AvisResponse.Statistiques(total, total == 0 ? 0 : somme * 1.0 / total,
                comptes.getOrDefault(5, 0L), repartition);
    }

    private AvisResponse.Detail detail(AvisFeedback a) {
        var parking = a.getParking();
        return new AvisResponse.Detail(a.getId(), a.getTypeAvis(), a.getNoteSatisfaction(),
                parking == null ? null : parking.getId(), parking == null ? null : parking.getNom(),
                a.getMessage(), a.getNomContact(), a.getContactInfo(), a.getDateCreation());
    }

    private String optionnel(String valeur) {
        return valeur == null || valeur.isBlank() ? null : valeur.trim();
    }
}
