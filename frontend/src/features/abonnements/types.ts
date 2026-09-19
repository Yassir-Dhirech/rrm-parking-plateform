import type { ContratScanInfo } from "../contrats/types";

export type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "EXPIRE" | "RESILIE";

export type TypeAbonnement = "REGULIER" | "ENTREPRISE" | "STAFF";

export interface AbonnementListItem {
  id: number;
  reference: string;
  type: TypeAbonnement;
  statut: StatutAbonnement;
  clientNom: string;
  parkingNom: string;
  dateDebut: string;
  dateFin: string;
  traiteParNom?: string; // Intervenant (Agent/Superviseur) ayant validé/traité l'abonnement
  dateTraitement?: string;
  relanceStatut?: "VALIDE" | "RELANCE_J10" | "RELANCE_J4" | "EXPIRE";
}

export type PalierRelanceType = "J_MOINS_10" | "J_MOINS_4" | "EXPIRE";

export interface EtapeRelanceDetail {
  palier: PalierRelanceType;
  titre: string;
  joursAvantFin: number;
  datePrevue: string;
  estAtteinte: boolean;
  estEnvoyee: boolean;
  dateDernierEnvoi?: string;
  canal?: "EMAIL" | "SMS" | "BOTH";
}

export interface EcheancierRelanceInfo {
  joursRestants: number;
  estExpire: boolean;
  palierActuel: "VALIDE" | "J_MOINS_10" | "J_MOINS_4" | "EXPIRE";
  etapes: EtapeRelanceDetail[];
}

export interface AbonnementDetail extends AbonnementListItem {
  vehiculeImmatriculation?: string;
  planTarifaireNom?: string;
  nombreAbonnements?: number;
  contratReference?: string;
  contratId?: number;
  contratScanInfo?: ContratScanInfo;
  montantTotal: number;
  motifSuspension?: string;
  echeancierRelance?: EcheancierRelanceInfo;
}