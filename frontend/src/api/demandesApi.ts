import axios from "axios";
import client, { API_BASE_URL } from "./client";
import type {
  DemandeAbonnementRegulierRequest,
  DocumentsDemande,
  DemandeAbonnementRegulierResponse,
  ValidationOtpResponse,
  ApiProblemDetails,
  DemandeRechercheResponse,
  DemandeDetailResponse,
  EnregistrementPaiementRequest,
  EnregistrementPaiementResponse,
  DecisionDemandeResponse,
} from "../features/demandes/types";

export async function creerDemandeAbonnementRegulier(
  demande: DemandeAbonnementRegulierRequest,
  documents: DocumentsDemande
): Promise<DemandeAbonnementRegulierResponse> {
  const formData = new FormData();

  formData.append(
    "demande",
    new Blob([JSON.stringify(demande)], {
      type: "application/json",
    })
  );

  formData.append("cinRecto", documents.cinRecto);
  formData.append("cinVerso", documents.cinVerso);
  formData.append("carteGriseRecto", documents.carteGriseRecto);
  formData.append("carteGriseVerso", documents.carteGriseVerso);

  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/abonnements-reguliers`,
    {
      method: "POST",
      body: formData,
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw body;
  }

  return body as DemandeAbonnementRegulierResponse;
}

export async function validerOtp(
  reference: string,
  code: string
): Promise<ValidationOtpResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/abonnements-reguliers/` +
      `${encodeURIComponent(reference)}/otp/validation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw body;
  }

  return body as ValidationOtpResponse;
}

export async function rechercherDemandesParReference(
  reference: string
): Promise<DemandeRechercheResponse[]> {
  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/recherche",
    {
      params: {
        reference: reference.trim(),
      },
    }
  );

  return response.data;
}

export async function rechercherDemandesParCin(
  cin: string
): Promise<DemandeRechercheResponse[]> {
  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/recherche",
    {
      params: {
        cin: cin.trim(),
      },
    }
  );

  return response.data;
}

export async function listerDemandesEnAttentePaiement(): Promise<
  DemandeRechercheResponse[]
> {
  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/en-attente-paiement"
  );

  return response.data;
}

export async function listerDemandesAValider(
  recherche: string,
  ordre: "ANCIEN" | "RECENT"
): Promise<DemandeRechercheResponse[]> {
  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/a-valider",
    {
      params: {
        recherche: recherche.trim() || undefined,
        ordre,
      },
    }
  );

  return response.data;
}

export async function validerDemandeFinalement(
  demandeId: number
): Promise<DecisionDemandeResponse> {
  const response = await client.post<DecisionDemandeResponse>(
    `/demandes/${demandeId}/validation-finale`
  );

  return response.data;
}

export async function demanderCorrectionDemande(
  demandeId: number,
  motif: string
): Promise<DecisionDemandeResponse> {
  const response = await client.post<DecisionDemandeResponse>(
    `/demandes/${demandeId}/demande-correction`,
    { motif }
  );

  return response.data;
}

export async function obtenirDetailDemande(
  id: number
): Promise<DemandeDetailResponse> {
  const response = await client.get<DemandeDetailResponse>(
    `/demandes/${id}`
  );

  return response.data;
}

export async function enregistrerPaiement(
  demandeId: number,
  requete: EnregistrementPaiementRequest
): Promise<EnregistrementPaiementResponse> {
  const response =
    await client.post<EnregistrementPaiementResponse>(
      `/demandes/${demandeId}/paiements`,
      requete
    );

  return response.data;
}

export async function chargerContenuPieceJointe(
  id: number
): Promise<string> {
  const response = await client.get<Blob>(
    `/pieces-jointes/${id}/contenu`,
    {
      responseType: "blob",
    }
  );

  return URL.createObjectURL(response.data);
}

export function extraireMessageErreur(error: unknown): string {
  if (axios.isAxiosError<ApiProblemDetails>(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    typeof (error as ApiProblemDetails).detail === "string"
  ) {
    return (error as ApiProblemDetails).detail!;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur technique est survenue. Veuillez réessayer.";
}
