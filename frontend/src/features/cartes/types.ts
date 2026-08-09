export type StatutCarte = "A_PREPARER" | "A_ACTIVER" | "ACTIVE" | "EXPIREE" | "DESACTIVEE";

export interface CarteListItem {
  id: number;
  numeroCarte: string;
  statut: StatutCarte;
  abonnementReference: string;
  clientNom: string;
}

export interface CarteDetail extends CarteListItem {
  datePreparation?: string;
  dateActivation?: string;
  noteActivation?: string;
  preparePar?: string;
  activePar?: string;
}