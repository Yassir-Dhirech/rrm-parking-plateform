import axios from "axios";
import client from "./client";
import type {
  DemandeFacturationResponse,
  FactureResponse,
} from "../features/factures/facturationTypes";

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
