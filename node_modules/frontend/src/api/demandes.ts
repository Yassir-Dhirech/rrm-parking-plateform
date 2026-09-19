import client from "./client";
import { type PublicDemandeInput, type DemandeSubmissionResult, type DemandeDetail } from "../features/demandes/types";
import { addPublicDemandeMock, searchDemandeByReferenceMock, updatePublicDemandeMock } from "./demandesMock";

export async function submitPublicDemande(
  input: PublicDemandeInput
): Promise<DemandeSubmissionResult> {
  try {
    const response = await client.post<DemandeSubmissionResult>(
      "/public/demandes",
      input
    );
    return response.data;
  } catch {
    return await addPublicDemandeMock(input);
  }
}

export async function searchPublicDemandeByRef(query: string): Promise<DemandeDetail | null> {
  try {
    const response = await client.get<DemandeDetail>(`/public/demandes/suivi?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch {
    return await searchDemandeByReferenceMock(query);
  }
}

export async function updatePublicDemande(reference: string, updates: Partial<DemandeDetail>): Promise<DemandeDetail> {
  try {
    const response = await client.patch<DemandeDetail>(`/public/demandes/${encodeURIComponent(reference)}`, updates);
    return response.data;
  } catch {
    return await updatePublicDemandeMock(reference, updates);
  }
}