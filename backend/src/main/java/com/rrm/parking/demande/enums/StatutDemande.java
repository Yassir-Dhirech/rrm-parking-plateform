package com.rrm.parking.demande.enums;

public enum StatutDemande {
    // Formulaire envoyé, OTP pas encore validé
    SOUMISE,

    // OTP validé, demande modifiable et paiement attendu
    EN_ATTENTE_PAIEMENT,

    // Paiement enregistré par l’agent
    PAYEE,

    // Décision prise par le superviseur ou le responsable
    VALIDEE,
    REFUSEE,

    // Aucun paiement sept jours après validation OTP
    EXPIREE,

    // Annulation volontaire
    ANNULEE
}