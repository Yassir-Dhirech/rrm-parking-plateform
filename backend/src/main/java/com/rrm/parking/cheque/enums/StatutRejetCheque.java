package com.rrm.parking.cheque.enums;

/**
 * Statut du dossier de rejet, distinct du statut du paiement bancaire.
 * Le CA n'est suspendu qu'après la validation par le responsable.
 */
public enum StatutRejetCheque {
    EN_ATTENTE_VALIDATION,
    BLOCAGE_EN_COURS,
    BLOQUE,
    REGULARISATION_ENREGISTREE,
    REACTIVATION_EN_COURS,
    TERMINE
}
