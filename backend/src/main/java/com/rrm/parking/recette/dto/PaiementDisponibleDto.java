package com.rrm.parking.recette.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaiementDisponibleDto(Long id, String reference, String clientNom, String referenceAbonnement,
                                    String numeroFacture, String modePaiement, String numeroCheque,
                                    String banqueCheque, BigDecimal montant, LocalDateTime datePaiement,
                                    String typeAbonnement, String observation) {}
