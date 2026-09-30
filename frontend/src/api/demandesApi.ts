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
  RechercheRenouvellementRequest,
  RenouvellementConsultationResponse,
  DemandeRenouvellementRequest,
  DemandeCorporateRequest,
  DemandeCorporateResponse,
  DemandeCorporateDetailResponse,
  DecisionCorporateResponse,
  ConvocationCorporateResponse,
  ModificationDemandeReguliereRequest,
  DocumentsModificationDemande,
} from "../features/demandes/types";

async function lireReponseJson<T>(response: Response): Promise<T> {
  const body = await response.json();

  if (!response.ok) {
    throw body;
  }

  return body as T;
}

export async function creerDemandeAbonnementRegulier(
  demande: DemandeAbonnementRegulierRequest,
  documents: DocumentsDemande
): Promise<DemandeAbonnementRegulierResponse> {
  const formData = construireFormDataDemandeReguliere(demande, documents);

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

function construireFormDataDemandeReguliere(
  demande: DemandeAbonnementRegulierRequest,
  documents: DocumentsDemande
): FormData {
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

  return formData;
}

export async function creerDemandeAbonnementRegulierAssistee(
  demande: DemandeAbonnementRegulierRequest,
  documents: DocumentsDemande
): Promise<DemandeAbonnementRegulierResponse> {
  const formData = construireFormDataDemandeReguliere(demande, documents);

  const response = await client.post<DemandeAbonnementRegulierResponse>(
    "/agent/demandes/abonnements-reguliers",
    formData
  );

  return response.data;
}

export async function validerOtpAssisteParAgent(
  reference: string,
  code: string
): Promise<ValidationOtpResponse> {
  const response = await client.post<ValidationOtpResponse>(
    `/agent/demandes/abonnements-reguliers/${encodeURIComponent(reference)}/otp/validation`,
    { code }
  );

  return response.data;
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

export async function rechercherRenouvellement(
  requete: RechercheRenouvellementRequest
): Promise<RenouvellementConsultationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/renouvellements/recherche`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requete),
    }
  );

  return lireReponseJson<RenouvellementConsultationResponse>(response);
}

export async function creerDemandeRenouvellement(
  requete: DemandeRenouvellementRequest
): Promise<DemandeAbonnementRegulierResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/renouvellements`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requete),
    }
  );

  return lireReponseJson<DemandeAbonnementRegulierResponse>(response);
}

export async function validerOtpRenouvellement(
  reference: string,
  code: string
): Promise<ValidationOtpResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/renouvellements/` +
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

  return lireReponseJson<ValidationOtpResponse>(response);
}

export async function renvoyerOtpRenouvellement(
  reference: string
): Promise<DemandeAbonnementRegulierResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/renouvellements/` +
      `${encodeURIComponent(reference)}/otp/renvoi`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
    }
  );

  return lireReponseJson<DemandeAbonnementRegulierResponse>(response);
}

export async function creerDemandeCorporate(
  requete: DemandeCorporateRequest
): Promise<DemandeCorporateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/corporate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requete),
    }
  );

  return lireReponseJson<DemandeCorporateResponse>(response);
}

export async function validerOtpCorporate(
  reference: string,
  code: string
): Promise<ValidationOtpResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/public/demandes/corporate/` +
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

  return lireReponseJson<ValidationOtpResponse>(response);
}

export async function listerDemandesCorporateAValider(
  recherche: string,
  ordre: "ANCIEN" | "RECENT"
): Promise<DemandeRechercheResponse[]> {
  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/corporate/responsable/a-valider",
    {
      params: {
        recherche: recherche.trim() || undefined,
        ordre,
      },
    }
  );
  return response.data;
}

export async function obtenirDetailDemandeCorporate(
  demandeId: number
): Promise<DemandeCorporateDetailResponse> {
  const response = await client.get<DemandeCorporateDetailResponse>(
    `/demandes/corporate/responsable/${demandeId}`
  );
  return response.data;
}

export async function validerDemandeCorporate(
  demandeId: number
): Promise<DecisionCorporateResponse> {
  const response = await client.post<DecisionCorporateResponse>(
    `/demandes/corporate/responsable/${demandeId}/validation`
  );
  return response.data;
}

export async function refuserDemandeCorporate(
  demandeId: number,
  motif: string
): Promise<DecisionCorporateResponse> {
  const response = await client.post<DecisionCorporateResponse>(
    `/demandes/corporate/responsable/${demandeId}/refus`,
    { motif }
  );
  return response.data;
}

export async function convoquerClientCorporate(
  demandeId: number
): Promise<ConvocationCorporateResponse> {
  const response = await client.post<ConvocationCorporateResponse>(
    `/demandes/corporate/responsable/${demandeId}/convocation`
  );
  return response.data;
}

export async function enregistrerPaiementCorporate(
  demandeId: number,
  requete: EnregistrementPaiementRequest
): Promise<DemandeCorporateDetailResponse> {
  const response = await client.post<DemandeCorporateDetailResponse>(
    `/demandes/corporate/responsable/${demandeId}/paiement-cheque`,
    requete
  );
  return response.data;
}

export async function declarerRetourContratCorporate(
  demandeId: number
): Promise<DemandeCorporateDetailResponse> {
  const response = await client.post<DemandeCorporateDetailResponse>(
    `/demandes/corporate/responsable/${demandeId}/retour-contrat-legalise`
  );
  return response.data;
}

export async function genererFactureCorporate(
  demandeId: number
): Promise<DemandeCorporateDetailResponse> {
  const response = await client.post<DemandeCorporateDetailResponse>(
    `/demandes/corporate/responsable/${demandeId}/facturation`
  );
  return response.data;
}

export async function finaliserDemandeCorporate(
  demandeId: number
): Promise<DemandeCorporateDetailResponse> {
  const response = await client.post<DemandeCorporateDetailResponse>(
    `/demandes/corporate/responsable/${demandeId}/finalisation`
  );
  return response.data;
}

export async function telechargerContratCorporatePdf(
  demandeId: number
): Promise<string> {
  const response = await client.get<Blob>(
    `/demandes/corporate/responsable/${demandeId}/contrat/pdf`,
    { responseType: "blob" }
  );
  return URL.createObjectURL(response.data);
}
export async function rechercherDemandes(
  terme?: string
): Promise<DemandeRechercheResponse[]> {
  const params: Record<string, string> = {};
  const valeur = terme?.trim();

  if (valeur) {
    params.terme = valeur;
  }

  const response = await client.get<DemandeRechercheResponse[]>(
    "/demandes/recherche",
    { params }
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

export async function modifierDemandeAgent(
  demandeId: number,
  demande: ModificationDemandeReguliereRequest,
  documents: DocumentsModificationDemande
): Promise<DemandeDetailResponse> {
  const formData = new FormData();
  formData.append(
    "demande",
    new Blob([JSON.stringify(demande)], { type: "application/json" })
  );

  Object.entries(documents).forEach(([nom, fichier]) => {
    if (fichier) {
      formData.append(nom, fichier);
    }
  });

  const response = await client.put<DemandeDetailResponse>(
    `/agent/demandes/${demandeId}`,
    formData
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

export interface InfoCartePerdueResponse {
  clientNom: string;
  cin: string;
  telephoneMasque: string;
  numeroCarte: string;
  parkingNom: string;
  dateFinAbonnement: string;
}

export async function rechercherCartePerdueParCin(
  cin: string
): Promise<InfoCartePerdueResponse> {
  const response = await client.post<InfoCartePerdueResponse>(
    "/api/public/demandes/perte-carte/recherche",
    { cin }
  );
  return response.data;
}

export async function declarerPerteCarte(
  cin: string,
  modePaiement: ModePaiement
): Promise<DemandeAbonnementRegulierResponse> {
  const response = await client.post<DemandeAbonnementRegulierResponse>(
    "/api/public/demandes/perte-carte/declarer",
    { cin, modePaiement }
  );
  return response.data;
}

export async function validerOtpPerteCarte(
  reference: string,
  code: string
): Promise<ValidationOtpResponse> {
  const response = await client.post<ValidationOtpResponse>(
    `/api/public/demandes/perte-carte/${encodeURIComponent(reference)}/otp/validation`,
    { code }
  );
  return response.data;
}

export function extraireMessageErreur(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string; message?: string; error?: string }>(error)) {
    const data = error.response?.data;

    // 1. RFC 7807 problem detail
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    // 2. Spring Boot standard error message
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    // 3. Status-specific friendly messages
    if (error.response?.status === 404) {
      return "Aucun élément trouvé pour cette recherche.";
    }
    if (error.response?.status === 403) {
      return "Accès refusé : vous n'avez pas l'autorisation requise (DEMANDE_CONSULTER).";
    }
    if (error.response?.status === 401) {
      return "Session expirée. Veuillez vous reconnecter.";
    }
    if (error.response?.status === 500) {
      return "Erreur serveur lors du traitement. Veuillez vérifier les données.";
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
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
