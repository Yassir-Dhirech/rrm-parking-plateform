import client from "./client";

export type StatutEcheanceCorporate = "A_TRAITER" | "DEMANDEE" | "DECLAREE" | "CLOTUREE";

export interface CarteCorporateEcheance {
  id: number;
  reference: string;
  numero: string | null;
  immatriculation: string | null;
  abonnementReference: string;
  entrepriseNom: string;
  parkingNom: string | null;
  dateActivation: string;
  dateRappelAnticipe: string;
  dateEcheance: string;
  rappelAnticipeEnvoye: string | null;
  rappelEcheanceEnvoye: string | null;
  dossierId: number | null;
  statutDossier: StatutEcheanceCorporate | null;
}

export interface DossierCorporateEcheance {
  id: number;
  carteId: number;
  carteReference: string;
  entrepriseNom: string;
  parkingNom: string | null;
  activationReference: string;
  dateEcheance: string;
  statut: StatutEcheanceCorporate;
  operationId: number | null;
  operationReference: string | null;
  dateDemande: string | null;
  dateDeclaration: string | null;
  dateCloture: string | null;
  demandeur: string | null;
  superviseur: string | null;
  clotureur: string | null;
}

export interface EcheancesCartesCorporateResponse {
  cartes: CarteCorporateEcheance[];
  historique: DossierCorporateEcheance[];
}

const base = "/responsable/cartes-corporate/echeances";

export async function listerEcheancesCartesCorporate() {
  const reponse = await client.get<EcheancesCartesCorporateResponse>(base);
  return reponse.data;
}

export async function genererDemandeReactivationCorporate(carteId: number) {
  const reponse = await client.post<DossierCorporateEcheance>(`${base}/cartes/${carteId}/demande`);
  return reponse.data;
}

export async function cloturerReactivationCorporate(dossierId: number) {
  const reponse = await client.post<DossierCorporateEcheance>(`${base}/${dossierId}/cloture`);
  return reponse.data;
}
