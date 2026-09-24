package com.rrm.parking.demande.enums;

public enum StatutDemande {
    // Formulaire envoyé, OTP pas encore validé
    SOUMISE,

    // OTP validé, demande modifiable et paiement attendu
    EN_ATTENTE_PAIEMENT,

    // Demande corporate confirmée par OTP, décision du responsable attendue
    EN_ATTENTE_VALIDATION_RESPONSABLE,

    // Paiement enregistré par l’agent
    PAYEE,

    // Le dossier payé doit être corrigé sans nouveau paiement
    EN_ATTENTE_CORRECTION,

    // Décision prise par le superviseur ou le responsable
    VALIDEE,
    REFUSEE,

    // Aucun paiement sept jours après validation OTP
    EXPIREE,

    // Annulation volontaire
    ANNULEE
}
