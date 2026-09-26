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

    // Corporate validé : venue au siège attendue pour paiement et signature
    EN_ATTENTE_PAIEMENT_SIGNATURE,

    // Chèque confirmé et contrat remis au client pour légalisation
    EN_ATTENTE_RETOUR_CONTRAT_LEGALISE,

    // Contrat légalisé reçu, facture à générer par le responsable
    EN_ATTENTE_FACTURATION,

    // Facture émise, impression puis activation des cartes en cours
    EN_PREPARATION_CARTES,

    // Toutes les cartes corporate sont activées et testées
    PRETE_A_FINALISER,

    // Le responsable a clôturé le dossier et informé le client
    FINALISEE,

    REFUSEE,

    // Aucun paiement sept jours après validation OTP
    EXPIREE,

    // Annulation volontaire
    ANNULEE
}
