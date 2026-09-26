import client from "./client";

export type StatutCarteAgent =
  | "EN_PREPARATION"
  | "A_IMPRIMER"
  | "IMPRIMEE"
  | "A_ACTIVER"
  | "ACTIVE"
  | "SUSPENDUE"
  | "DESACTIVEE"
  | "EXPIREE";

export interface CarteAgent {
  id: number;
  reference: string;
  numeroCarte: string | null;
  statut: StatutCarteAgent;
  referenceAbonnement: string;
  clientNom: string;
  immatriculation: string | null;
  typeAbonnement: "REGULIER" | "CORPORATE";
  parkingId: number;
  parkingNom: string;
  dateCreation: string;
}

export interface AbonnementsMensuelsAgent {
  parkingId: number;
  parkingNom: string;
  annee: number;
  mois: Array<{ numero: number; nombreAbonnements: number }>;
}

export async function getCartesAgent(filtres: {
  recherche?: string;
  statut?: StatutCarteAgent;
  type?: "REGULIER" | "CORPORATE";
}): Promise<CarteAgent[]> {
  const response = await client.get<CarteAgent[]>("/agent/cartes", {
    params: filtres,
  });
  return response.data;
}

export async function getAbonnementsMensuelsAgent(
  annee: number,
): Promise<AbonnementsMensuelsAgent> {
  const response = await client.get<AbonnementsMensuelsAgent>(
    "/agent/abonnements-mensuels",
    { params: { annee } },
  );
  return response.data;
}
