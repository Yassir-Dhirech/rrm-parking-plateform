export type StatutRecette = 
  | "EN_COURS"
  | "COMPLETED" 
  | "RECEIVED";

export interface ChequeRemiseDetail {
  id: number;
  referencePaiement: string;
  numeroCheque: string;
  banque: string;
  emetteur: string;
  montant: number;
  datePaiement: string;
  statut?: "CONFIRME" | "REJETE"; // "CONFIRME" par présomption de validité
  motifRejet?: string;
  dateRejet?: string;
  abonnementReference?: string;
}

export interface RecetteJournee {
  date: string;
  montantEspeces: number;
  montantCarte: number;
  montantCheque: number;
  montantVirement: number;
  totalJournee: number;
  nombreTransactions: number;
}

export interface RecetteHebdoListItem {
  id: number;
  reference: string;
  parkingNom: string;
  parkingId: number;
  semaineAnnee: string;
  dateDebut: string;
  dateFin: string;
  totalHebdo: number;
  totalEspeces: number;
  totalCheques: number;
  totalCarte: number;
  totalVirement: number;
  nombreCheques: number;
  statut: StatutRecette;
}

export interface RecetteHebdoDetail extends RecetteHebdoListItem {
  superviseurNom?: string;
  validePar?: string;
  dateValidation?: string;
  transmisPar?: string;
  dateTransmission?: string;
  comptableNom?: string;
  dateEncaissementComptable?: string;
  quittanceNumero?: string;
  commentaires?: string;
  detailJours: RecetteJournee[];
  chequesRemis: ChequeRemiseDetail[];
}