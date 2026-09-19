import type { Role } from "../../lib/roleConfig";

// Utilisateurs
export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  parkingAssigneId?: number;
  parkingAssigneNom?: string;
  actif: boolean;
  dateCreation: string;
}

// Parkings
export interface Parking {
  id: number;
  nom: string;
  code: string;
  adresse: string;
  zone?: string;
  capaciteTotale: number; // Ex: 450 places
  placesReserveesAbonnes: number;

  // Répartition par pourcentages configurés par le Responsable
  pourcentageTickets: number; // Ex: 50%
  pourcentageAbonnements: number; // Ex: 50%
  pourcentageCorporate: number; // Ex: 60% des abonnements pour les entreprises
  pourcentageParticulier: number; // Ex: 40% des abonnements pour les particuliers

  // Quotas calculés en nombre de places
  quotaTickets: number; // Math.round(capaciteTotale * pourcentageTickets / 100)
  quotaAbonnementsTotal: number; // Math.round(capaciteTotale * pourcentageAbonnements / 100)
  quotaCorporate: number; // Math.round(quotaAbonnementsTotal * pourcentageCorporate / 100)
  quotaParticulier: number; // Math.round(quotaAbonnementsTotal * pourcentageParticulier / 100)

  // Nombre d'abonnements actifs occupant une place (Occupation réelle)
  abonnementsParticulierActifs: number; // Ex: 42
  abonnementsCorporateActifs: number; // Ex: 78

  // Places restantes calculées
  placesRestantesParticulier: number; // quotaParticulier - abonnementsParticulierActifs
  placesRestantesCorporate: number; // quotaCorporate - abonnementsCorporateActifs

  actif: boolean;
  verrouille?: boolean;
  motifVerrouillage?: string;
  motifDesactivation?: string;
  latitude?: number;
  longitude?: number;
}

export type TypeAbonnementOption =
  | "PERMANENT_24_7"
  | "JOUR_8H_20H"
  | "NUIT_19H_8H"
  | "CORPORATE"
  | "DEUX_ROUES"
  | "PARTICULIER";

// Plans Tarifaires
export interface PlanTarifaire {
  id: number;
  libelle: string;
  typeAbonnement: TypeAbonnementOption | string;
  plageHoraire?: string;
  dureeMois: number;
  tarifHT: number;
  tarifTTC: number;
  typeVehicule?: "V" | "M" | "VOITURE" | "MOTO";
  parkingId?: number;
  parkingNom?: string;
  actif: boolean;
}

// Audit Logs
export interface AuditLog {
  id: number;
  timestamp: string;
  utilisateurEmail: string;
  role: Role;
  action: string;
  entite: string;
  entiteId?: string;
  adresseIp: string;
  details: string;
}