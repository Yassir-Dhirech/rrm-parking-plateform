import client from "./client";
import type { TarifParkingPublicResponse } from "./parkings";

export interface AdminParking {
  id: number;
  code: string;
  nom: string;
  adresse: string;
  capaciteTotale: number;
  placesReserveesAbonnes: number;
  quotaTickets: number;
  quotaAbonnementsTotal: number;
  quotaCorporate: number;
  quotaParticulier: number;
  actif: boolean;
  verrouille: boolean;
  latitude: number;
  longitude: number;
  statut: string;
  zone?: string;
  typeOuvrage?: string;
  nombreNiveaux?: number;
  horairesOuverture?: string;
  equipements?: string;
  agentAssigneId?: number | null;
  superviseurAssigneId?: number | null;
  motifMaintenance?: string | null;
  motifDesactivation?: string | null;
  pvNom?: string | null;
  motifModification?: string;
}

export interface CreationParking {
  code: string;
  nom: string;
  adresse: string;
  zone: string;
  capaciteTotale: number;
  pourcentageTickets: number;
  pourcentageAbonnements: number;
  pourcentageCorporate: number;
  pourcentageParticulier: number;
  latitude: number;
  longitude: number;
  typeOuvrage: string;
  nombreNiveaux: number;
  horairesOuverture: string;
  equipements: string[];
  agentAssigneId: number;
  superviseurAssigneId: number;
  plans: Array<{ libelle: string; categorie: "PARTICULIER" | "CORPORATE" | "SPECIAL";
    plageHoraire: string; dureeMois: number; tarifTTC: number }>;
}

// 1. Récupération directe depuis la base de données MySQL
export async function getAdminParkings(): Promise<AdminParking[]> {
  const response = await client.get<AdminParking[]>("/admin/parkings");
  if (!Array.isArray(response.data)) throw new Error("Réponse parkings invalide");
  return response.data;
}

export async function getTarifsApplicablesParking(id: number): Promise<TarifParkingPublicResponse[]> {
  const response = await client.get<TarifParkingPublicResponse[]>(`/admin/parkings/${id}/tarifs`);
  return response.data;
}

export async function reviserTarifParking(parkingId: number, tarifId: number, prixMensuelTtc: number) {
  const response = await client.put<TarifParkingPublicResponse>(
    `/admin/parkings/${parkingId}/tarifs/${tarifId}`, { prixMensuelTtc });
  return response.data;
}

export interface NouveauForfaitParking {
  nom: string;
  description?: string;
  placeReservee: boolean;
  dureeEnMois: number;
  prixMensuelTtc: number;
  tauxTva: number;
}

export async function ajouterForfaitParking(parkingId: number, forfait: NouveauForfaitParking) {
  const response = await client.post<TarifParkingPublicResponse>(
    `/admin/parkings/${parkingId}/tarifs`, forfait);
  return response.data;
}

export async function retirerForfaitParking(parkingId: number, forfaitId: number): Promise<void> {
  await client.delete(`/admin/parkings/${parkingId}/forfaits/${forfaitId}`);
}

// 2. Création directe en base
export async function createAdminParking(data: CreationParking): Promise<AdminParking> {
  const response = await client.post<AdminParking>("/admin/parkings", data);
  return response.data;
}

// 3. Modification directe en base
export async function updateAdminParking(id: number, data: any): Promise<AdminParking> {
  const response = await client.put<AdminParking>(`/admin/parkings/${id}`, data);
  return response.data;
}

export async function deposerPvParking(id: number, fichier: File): Promise<void> {
  const formulaire = new FormData();
  formulaire.append("file", fichier);
  await client.post(`/admin/parkings/${id}/pv`, formulaire);
}

export async function telechargerPvParking(id: number): Promise<Blob> {
  const response = await client.get<Blob>(`/admin/parkings/${id}/pv`, { responseType: "blob" });
  return response.data;
}

// 4. Verrouillage Maintenance
export async function toggleLockAdminParking(id: number, lock: boolean, reason?: string): Promise<void> {
  await client.patch(`/admin/parkings/${id}/verrouiller`, { lock, reason });
}

// 5. Désactivation
export async function deactivateAdminParking(id: number, reason?: string): Promise<void> {
  await client.patch(`/admin/parkings/${id}/desactiver`, { reason });
}

// 6. Suppression
export async function deleteAdminParking(id: number): Promise<void> {
  await client.delete(`/admin/parkings/${id}`);
}
