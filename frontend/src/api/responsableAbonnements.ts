import client from "./client";
import type { FactureResponse } from "../features/factures/facturationTypes";

export interface RelanceAbonnement {
  type: string;
  statut: string;
  sujet: string;
  canal: string;
  destination: string;
  datePrevue: string;
  dateEnvoi: string | null;
  erreur: string | null;
}

export interface AbonnementResponsable {
  id: number;
  reference: string;
  type: "REGULIER" | "REGULIER_ENTREPRISE" | "CORPORATE";
  clientNom: string;
  clientEmail: string | null;
  entrepriseIce: string | null;
  parkingNom: string | null;
  statut: string;
  dateDebut: string | null;
  dateFin: string | null;
  immatriculation: string | null;
  prixTtcPeriode: number | null;
  dateCreation: string;
  factures: FactureResponse[];
  relances: RelanceAbonnement[];
  cartes: Array<{ reference: string; numero: string | null; statut: string; immatriculation: string | null }>;
}

export interface PageAbonnementsResponsable {
  content: AbonnementResponsable[];
  totalElements: number;
  number: number;
  size: number;
}

export async function listerAbonnementsResponsable(page: number, recherche: string, statut: string, taille = 20) {
  const response = await client.get<PageAbonnementsResponsable>("/responsable/abonnements", {
    params: { page, taille, recherche: recherche.trim() || undefined, statut: statut === "TOUS" ? undefined : statut },
  });
  return response.data;
}

export async function consulterAbonnementResponsable(id: number) {
  const response = await client.get<AbonnementResponsable>(`/responsable/abonnements/${id}`);
  return response.data;
}

export async function suspendreAbonnementResponsable(id: number, motif: string) {
  const response = await client.post<AbonnementResponsable>(`/responsable/abonnements/${id}/suspension`, { motif });
  return response.data;
}
