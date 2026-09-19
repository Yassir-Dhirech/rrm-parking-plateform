export type StatutFacture = "BROUILLON" | "EMISE" | "SIGNEE" | "ANNULEE";

export interface FactureListItem {
  id: number;
  numero: string;
  montantTtc: number;
  statut: StatutFacture;
  clientNom: string;
  dateEmission: string;
  paiementId?: number;
  paiementReference?: string;
  modePaiement?: "ESPECES" | "CHEQUE";
  libellePrestation?: string;
  fraisCarteRfid?: number;
  montantAbonnementTtc?: number;
}

export interface FactureDetail extends FactureListItem {
  montantHt: number;
  tauxTva: number;
  montantTva: number;
  abonnementReference: string;
  genereePar: string;
  signeePar?: string;
  dateSignature?: string;
  nombreCartes?: number;
}