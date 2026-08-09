export type StatutRecette = "EN_COURS" | "VALIDEE_SUPERVISEUR" | "CLOTUREE";

export interface RecetteJournee {
  date: string;
  montantEspeces: number;
  montantCarte: number;
  montantVirement: number;
  totalJournee: number;
  nombreTransactions: number;
}

export interface RecetteHebdoListItem {
  id: number;
  reference: string; // Ex: REC-2026-W32-P1
  parkingNom: string;
  parkingId: number;
  semaineAnnee: string; // Ex: "Semaine 32 (2026)"
  dateDebut: string;
  dateFin: string;
  totalHebdo: number;
  statut: StatutRecette;
}

export interface RecetteHebdoDetail extends RecetteHebdoListItem {
  validePar?: string;
  dateValidation?: string;
  commentaires?: string;
  detailJours: RecetteJournee[];
}