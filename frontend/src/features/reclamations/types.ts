export type CategorieReclamation =
  | "LPR_BARRIERE"          // Problème de Lecture LPR / Barrière non ouverte
  | "RFID_BADGE"            // Badge RFID non détecté / Carte endommagée
  | "FACTURATION_SURCHARGE" // Contestation de Facturation / Erreur de Débit
  | "DELAI_ACTIVATION"     // Retard d'Activation d'Abonnement / Erreur de Durée
  | "BORNE_PAIEMENT"        // Panne Borne de Paiement Automatique / Ticket illisible
  | "AUTRE_GENERAL";        // Autre Demande / Réclamation Générale

export const CATEGORIES_RECLAMATION_LABELS: Record<CategorieReclamation, { label: string; description: string; icon: string; color: string }> = {
  LPR_BARRIERE: {
    label: "Problème de Lecture LPR / Barrière non ouverte",
    description: "La caméra LPR n'a pas reconnu l'immatriculation ou la barrière automatique ne s'est pas levée.",
    icon: "CarOutlined",
    color: "blue",
  },
  RFID_BADGE: {
    label: "Badge RFID non détecté / Carte endommagée",
    description: "Le lecteur de la borne de sortie/entrée ne lit pas le passe physique RFID ou carte perdue.",
    icon: "IdcardOutlined",
    color: "purple",
  },
  FACTURATION_SURCHARGE: {
    label: "Contestation de Facturation / Erreur de Débit",
    description: "Montant prélevé ou tarif ticket incohérent avec la durée réelle de stationnement.",
    icon: "DollarOutlined",
    color: "gold",
  },
  DELAI_ACTIVATION: {
    label: "Retard d'Activation d'Abonnement / Erreur de Durée",
    description: "Votre contrat renouvelé ou souscrit n'a pas encore été activé au niveau des bornes.",
    icon: "ClockCircleOutlined",
    color: "orange",
  },
  BORNE_PAIEMENT: {
    label: "Panne Borne de Paiement / Ticket illisible",
    description: "La caisse automatique n'a pas rendu la monnaie, ticket de caisse bloqué ou écran hors service.",
    icon: "BuildOutlined",
    color: "red",
  },
  AUTRE_GENERAL: {
    label: "Autre Demande / Réclamation Générale",
    description: "Toute autre demande concernant les services ou les aménagements du parking.",
    icon: "InfoCircleOutlined",
    color: "cyan",
  },
};

export interface PublicReclamationInput {
  nomPrenom: string;
  email: string;
  telephone: string;
  parkingId: number;
  parkingNom: string;
  typeReclamation: CategorieReclamation;
  numeroTicketOuCarte?: string;
  immatriculation?: string;
  descriptionDetaillee: string;
}

export interface ReclamationItem extends PublicReclamationInput {
  id: number;
  reference: string;
  dateCreation: string;
  statut: "SOUMISE" | "EN_COURS" | "RESOLUE" | "REJETEE";
  reponseAgent?: string;
  traiteParNom?: string;
}
