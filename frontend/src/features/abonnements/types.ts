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
}

export interface AbonnementDetail extends AbonnementListItem {
  vehiculeImmatriculation?: string;
  planTarifaireNom?: string;
  contratReference?: string;
  montantTotal: number;
}