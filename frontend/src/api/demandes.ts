import client from "./client";
import { type PublicDemandeInput, type DemandeSubmissionResult } from "../features/demandes/types";

export async function submitPublicDemande(
  input: PublicDemandeInput
): Promise<DemandeSubmissionResult> {
  const response = await client.post<DemandeSubmissionResult>(
    "/public/demandes",
    input
  );
  return response.data;
}