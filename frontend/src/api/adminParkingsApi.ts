import client from "./client";
import { getParkingsMock } from "./adminMock";

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
  motifModification?: string;
  motifVerrouillage?: string;
  motifDesactivation?: string;
}

// 1. Récupération directe depuis la base de données MySQL
export async function getAdminParkings(): Promise<AdminParking[]> {
  try {
    const response = await client.get<AdminParking[]>("/admin/parkings");
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    throw new Error("Table parkings vide ou en cours de rebuild");
  } catch (error) {
    console.warn("Backend /admin/parkings non disponible, utilisation du fallback:", error);
    const mock = await getParkingsMock();
    return mock.map((p) => ({
      ...p,
      statut: p.actif ? (p.verrouille ? "SUSPENDU" : "ACTIF") : "ARCHIVE",
      verrouille: Boolean(p.verrouille),
      latitude: p.latitude ?? 34.02088,
      longitude: p.longitude ?? -6.84165,
    }));
  }
}

// 2. Création directe en base
export async function createAdminParking(data: any): Promise<AdminParking> {
  const response = await client.post<AdminParking>("/admin/parkings", data);
  return response.data;
}

// 3. Modification directe en base
export async function updateAdminParking(id: number, data: any): Promise<AdminParking> {
  const response = await client.put<AdminParking>(`/admin/parkings/${id}`, data);
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
