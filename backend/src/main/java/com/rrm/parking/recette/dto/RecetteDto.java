package com.rrm.parking.recette.dto;

import com.rrm.parking.recette.entity.LigneRecette;
import com.rrm.parking.recette.entity.Recette;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RecetteDto(
        Long id, String reference, Long parkingId, String parkingNom, LocalDate dateArret,
        LocalDate periodeDu, LocalDate periodeAu,
        LocalDateTime dateCreation, LocalDateTime dateTransmission, LocalDateTime dateReception,
        String statut, String superviseurNom, String comptableNom,
        BigDecimal totalEspeces, BigDecimal totalCheques, BigDecimal total,
        int nombrePaiements, int nombreEspeces, int nombreCheques,
        BigDecimal montantEspecesRecu, BigDecimal montantChequesRecu, Integer nombreChequesRecus,
        String observationReception, String accuseNumero, List<LigneDto> lignes
) {
    public record LigneDto(Long id, Long paiementId, String referencePaiement, String numeroFacture,
                           String referenceAbonnement, String clientNom, String modePaiement,
                           String numeroCheque, String banqueCheque, String typeAbonnement,
                           LocalDate dateDebutAbonnement, LocalDate dateFinAbonnement,
                           boolean venteCarte, BigDecimal montant, LocalDateTime datePaiement, String observation) {
        public static LigneDto depuis(LigneRecette l) {
            return new LigneDto(l.getId(), l.getPaiement().getId(), l.getReferencePaiement(), l.getNumeroFacture(),
                    l.getReferenceAbonnement(), l.getClientNom(), l.getModePaiement(), l.getNumeroCheque(),
                    l.getBanqueCheque(), l.getTypeAbonnement(), l.getDateDebutAbonnement(), l.getDateFinAbonnement(),
                    l.isVenteCarte(), l.getMontant(), l.getDatePaiement(), l.getObservation());
        }
    }
    public static RecetteDto depuis(Recette r) {
        var lignes = r.getLignes().stream().map(LigneDto::depuis).toList();
        int cheques = (int) lignes.stream().filter(l -> l.modePaiement().equals("CHEQUE")).count();
        LocalDate periodeDu = lignes.stream().map(l -> l.datePaiement().toLocalDate()).min(LocalDate::compareTo).orElse(null);
        LocalDate periodeAu = lignes.stream().map(l -> l.datePaiement().toLocalDate()).max(LocalDate::compareTo).orElse(null);
        return new RecetteDto(r.getId(), r.getReference(), r.getParking().getId(), r.getParking().getNom(),
                r.getDateArret(), periodeDu, periodeAu, r.getDateCreation(), r.getDateTransmission(), r.getDateReception(),
                r.getStatut().name(), nom(r.getSuperviseur()), nom(r.getComptable()),
                r.getTotalEspeces(), r.getTotalCheques(), r.getTotalEspeces().add(r.getTotalCheques()),
                lignes.size(), lignes.size() - cheques, cheques,
                r.getMontantEspecesRecu(), r.getMontantChequesRecu(), r.getNombreChequesRecus(),
                r.getObservationReception(), r.getAccuseNumero(), lignes);
    }
    private static String nom(com.rrm.parking.utilisateur.entity.Utilisateur u) {
        return u == null ? null : u.getPrenom() + " " + u.getNom();
    }
}
