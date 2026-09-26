export type StatutFactureApi = "BROUILLON" | "EMISE" | "ANNULEE";

export interface DemandeFacturationResponse {
  demandeId: number;
  referenceDemande: string;
  statutDemande: "VALIDEE";
  dateModification: string | null;
  clientNom: string;
  cin: string;
  email: string | null;
  parkingNom: string;
  abonnementReference: string;
  montantAbonnementTtc: number;
  fraisCarteTtc: number;
  montantTotalTtc: number;
  paiementId: number;
  paiementReference: string;
  factureId: number | null;
  factureNumero: string | null;
  factureStatut: StatutFactureApi | null;
  dateEmission: string | null;
}

export interface FactureLigneResponse {
  id: number | null;
  typeLigne: "ABONNEMENT" | "CARTE_ACCES" | "AUTRE";
  description: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
  montantHt: number;
  montantTva: number;
  montantTtc: number;
}

export interface FactureResponse {
  id: number;
  numero: string;
  statut: StatutFactureApi;
  dateCreation: string;
  dateEmission: string | null;
  paiementId: number;
  paiementReference: string;
  demandeId: number;
  referenceDemande: string;
  clientNom: string;
  clientIdentifiant: string | null;
  email: string | null;
  abonnementReference: string | null;
  parkingNom: string | null;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  lignes: FactureLigneResponse[];
}
