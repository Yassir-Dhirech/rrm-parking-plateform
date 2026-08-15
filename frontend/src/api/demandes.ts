import client from "./client";
import { type PublicDemandeInput, type DemandeSubmissionResult } from "../features/demandes/types";
import { addPublicDemandeMock } from "./demandesMock";

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