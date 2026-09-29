import axios from "axios";
import client from "./client";
import type {
  DemandeFacturationResponse,
  FactureResponse,
} from "../features/factures/facturationTypes";

export interface PageFacturesComptable {
  content: FactureResponse[];
  totalElements: number;
  number: number;
  size: number;
}

export interface FiltresFacturesComptable {
  recherche?: string;
  statut?: "BROUILLON" | "EMISE" | "ANNULEE";
  modePaiement?: "ESPECE" | "CHEQUE";
  dateDebut?: string;
  dateFin?: string;
}

export interface FacturesComptableResponse {
  factures: PageFacturesComptable;
  totalFactures: number;
  nombreCheques: number;
  nombreEspeces: number;
}

export type PorteeFactures = "comptable" | "superviseur" | "responsable";

export async function listerFacturesComptable(
  page: number,
  filtres: FiltresFacturesComptable,
  taille = 12,
  portee: PorteeFactures = "comptable",
): Promise<FacturesComptableResponse> {
  const response = await client.get<FacturesComptableResponse>(`/${portee}/factures`, {
    params: { page, taille, ...filtres },
  });
  return response.data;
}

export async function consulterFactureComptable(id: number, portee: PorteeFactures = "comptable"): Promise<FactureResponse> {
  const response = await client.get<FactureResponse>(`/${portee}/factures/${id}`);
  return response.data;
}

export async function telechargerFactureComptablePdf(id: number, portee: PorteeFactures = "comptable"): Promise<Blob> {
  const response = await client.get<Blob>(`/${portee}/factures/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

export async function listerDemandesValideesPourFacturation(
  recherche: string,
  ordre: "ANCIEN" | "RECENT"
): Promise<DemandeFacturationResponse[]> {
  const response = await client.get<DemandeFacturationResponse[]>(
    "/factures/demandes-validees",
    {
      params: {
        recherche: recherche.trim() || undefined,
        ordre,
      },
    }
  );
  return response.data;
}

export async function genererFacturePourDemande(
  demandeId: number
): Promise<FactureResponse> {
  const response = await client.post<FactureResponse>(
    `/factures/demandes/${demandeId}`
  );
  return response.data;
}

export async function telechargerFacturePdf(
  factureId: number
): Promise<string> {
  const response = await client.get<Blob>(
    `/factures/${factureId}/pdf`,
    { responseType: "blob" }
  );
  return URL.createObjectURL(response.data);
}

export function extraireErreurFacturation(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;
    if (detail) return detail;
  }
  if (error instanceof Error) return error.message;
  return "Une erreur est survenue pendant la facturation.";
}
