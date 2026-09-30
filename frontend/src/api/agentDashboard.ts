import client from "./client";

export interface RepartitionDossiers {
  total: number;
  enAttentePaiement: number;
  payees: number;
  validees: number;
  finalisees: number;
  autres: number;
  pctEnAttentePaiement: number;
  pctPayees: number;
  pctValidees: number;
  pctFinalisees: number;
  pctAutres: number;
}

export interface AgentDashboardKpis {
  parkingId: number;
  parkingNom: string;
  dateReference: string;
  demandesAEncaisser: number;
  encaissementsJourTtc: number;
  nombreEncaissementsJour: number;
  cartesAImprimer: number;
  cartesARemettre: number;
  repartitionDossiers?: RepartitionDossiers;
}

export async function getAgentDashboardKpis(): Promise<AgentDashboardKpis> {
  const response = await client.get<AgentDashboardKpis>(
    "/agent/dashboard/kpis",
  );
  return response.data;
}

export interface AgentAction {
  type: "PAIEMENT" | "IMPRESSION" | "REMISE";
  id: number;
  reference: string;
  nomClient: string | null;
  identifiantClient: string | null;
  depuis: string | null;
  ancienneteHeures: number;
  enRetard: boolean;
  lien: string;
}

export interface AgentActions {
  actions: AgentAction[];
  alertesRetard: number;
}

export interface AgentResultatRecherche {
  type: "DEMANDE" | "CARTE";
  id: number;
  reference: string;
  nomClient: string | null;
  identifiantClient: string | null;
  statut: string;
  parkingNom: string | null;
  lien: string;
}

export async function getAgentActions(limite = 8): Promise<AgentActions> {
  const response = await client.get<AgentActions>("/agent/dashboard/actions", { params: { limite } });
  return response.data;
}

export async function rechercherAgent(terme: string): Promise<AgentResultatRecherche[]> {
  const response = await client.get<{ resultats: AgentResultatRecherche[] }>(
    "/agent/dashboard/recherche", { params: { terme } },
  );
  return response.data.resultats;
}
