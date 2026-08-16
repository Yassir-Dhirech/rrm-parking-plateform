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
  capaciteTotale: number;
  placesReserveesAbonnes: number;
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