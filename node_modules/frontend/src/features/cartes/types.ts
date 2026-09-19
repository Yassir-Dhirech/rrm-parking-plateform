export type StatutCarte = "EN_ATTENTE_IMPRESSION" | "IMPRIMEE_NON_TESTEE" | "TESTEE_PRET_A_RECUPERER" | "DELIVREE_ACTIVE" | "A_PREPARER" | "A_ACTIVER" | "ACTIVE" | "EXPIREE" | "DESACTIVEE";

export interface CarteListItem {
  id: number;
  numeroCarte: string;
  statut: StatutCarte;
  abonnementReference: string;
  clientNom: string;
  estImprimee?: boolean;
  dateImpression?: string;
  estTestee?: boolean;
  dateTest?: string;
  testePar?: string;
  estDelivree?: boolean;
  dateDelivrance?: string;
  delivreePar?: string;
}

export interface CarteDetail extends CarteListItem {
  datePreparation?: string;
  dateActivation?: string;
  noteActivation?: string;
  preparePar?: string;
  activePar?: string;
}