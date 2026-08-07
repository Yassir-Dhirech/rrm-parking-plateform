export type StatutPaiement = "EN_ATTENTE" | "CONFIRME" | "ANNULE";
export type ModePaiement = "ESPECES" | "CHEQUE" ;

export interface PaiementListItem {
  id: number;
  reference: string;
  montant: number;
  modePaiement: ModePaiement;
  statut: StatutPaiement;
  clientNom: string;
  datePaiement: string;
}

export interface PaiementDetail extends PaiementListItem {
  numeroCheque?: string;
  banque?: string;
  referenceVirement?: string;
  abonnementReference: string;
  enregistrePar: string;
}