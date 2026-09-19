import axios from "axios";
import client from "./client";
import type { DemandeOperationnelleCarte } from "../features/cartes/operationCarteTypes";

export async function listerDemandesImpression(): Promise<DemandeOperationnelleCarte[]> {
  const response = await client.get<DemandeOperationnelleCarte[]>(
    "/operations-cartes/impressions"
  );
  return response.data;
}

export async function declarerCarteImprimee(
  operationId: number,
  numeroCarte: string
): Promise<DemandeOperationnelleCarte> {
  const response = await client.post<DemandeOperationnelleCarte>(
    `/operations-cartes/${operationId}/impression-terminee`,
    { numeroCarte: numeroCarte.trim() }
  );
  return response.data;
}

export async function listerDemandesActivation(): Promise<DemandeOperationnelleCarte[]> {
  const response = await client.get<DemandeOperationnelleCarte[]>(
    "/operations-cartes/activations"
  );
  return response.data;
}

export async function declarerCarteActivee(
  operationId: number
): Promise<DemandeOperationnelleCarte> {
  const response = await client.post<DemandeOperationnelleCarte>(
    `/operations-cartes/${operationId}/activation-terminee`
  );
  return response.data;
}

export async function listerCartesARemettre(): Promise<DemandeOperationnelleCarte[]> {
  const response = await client.get<DemandeOperationnelleCarte[]>(
    "/operations-cartes/remises"
  );
  return response.data;
}

export async function confirmerRemiseCarte(
  operationId: number
): Promise<DemandeOperationnelleCarte> {
  const response = await client.post<DemandeOperationnelleCarte>(
    `/operations-cartes/${operationId}/remise-terminee`
  );
  return response.data;
}

export function extraireErreurOperationCarte(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? "L'opération a échoué.";
  }
  return error instanceof Error ? error.message : "L'opération a échoué.";
}
