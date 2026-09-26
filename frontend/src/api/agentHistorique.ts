import client from "./client";

export interface HistoriqueDemandeCreee {
  id: number;
  reference: string;
  typeDemande: string;
  statut: string;
  nomClient: string;
  parkingNom: string | null;
  dateCreation: string;
}

export interface HistoriquePaiementValide {
  id: number;
  reference: string;
  referenceDemande: string;
  nomClient: string;
  parkingNom: string | null;
  modePaiement: string;
  montantTtc: number;
  dateValidation: string;
}

export interface HistoriqueOperationCarte {
  id: number;
  reference: string;
  referenceDemande: string | null;
  nomClient: string | null;
  parkingNom: string | null;
  referenceCarte: string;
  numeroCarte: string | null;
  dateDeclaration: string;
}

export interface HistoriqueModificationDemande {
  id: number;
  demandeId: number;
  referenceDemande: string;
  parkingNom: string | null;
  resume: string;
  detailsAvantApres: string;
  dateModification: string;
}

export interface AgentHistorique {
  demandesCreees: HistoriqueDemandeCreee[];
  paiementsValides: HistoriquePaiementValide[];
  impressionsDeclarees: HistoriqueOperationCarte[];
  remisesDeclarees: HistoriqueOperationCarte[];
  modificationsDemandes: HistoriqueModificationDemande[];
}

export async function getAgentHistorique(): Promise<AgentHistorique> {
  const response = await client.get<AgentHistorique>("/agent/historique");
  return response.data;
}
