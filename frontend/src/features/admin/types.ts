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
}

// Plans Tarifaires
export interface PlanTarifaire {
  id: number;
  libelle: string;
  typeAbonnement: "PARTICULIER" | "CORPORATE";
  dureeMois: number;
  tarifHT: number;
  tarifTTC: number;
  parkingId?: number;
  parkingNom?: string; // Si null => Applicable à tous les parkings
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