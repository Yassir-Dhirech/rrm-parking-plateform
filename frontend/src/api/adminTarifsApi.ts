import client from "./client";
import { getTarifsMock } from "./adminMock";
import type { PlanTarifaire } from "../features/admin/types";
import { getPublicParkings, getTarifsParking } from "./parkings";

export async function getAdminTarifs(): Promise<PlanTarifaire[]> {
  try {
    // 1. Tenter l'endpoint dédié /admin/tarifs
    try {
      const response = await client.get<PlanTarifaire[]>("/admin/tarifs");
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Déduplication par Parking + Formule (supprime les doublons de durées 3, 6, 9, 12 mois)
        const map = new Map<string, PlanTarifaire>();
        for (const t of response.data) {
          const key = `${t.parkingId}_${t.typeAbonnement || t.libelle}`;
          if (!map.has(key)) {
            map.set(key, t);
          }
        }
        return Array.from(map.values());
      }
    } catch {
      // Si l'endpoint admin est en cours de rebuild, on interroge directement la base via les endpoints actifs
    }

    // 2. Récupérer TOUS les vrais tarifs de la Base de Données MySQL pour chaque parking
    const parkings = await getPublicParkings();
    if (!parkings || parkings.length === 0) {
      return getTarifsMock();
    }

    const allTarifsPromises = parkings.map(async (p) => {
      try {
        const pTarifs = await getTarifsParking(p.id);
        const map = new Map<string, PlanTarifaire>();
        for (const t of pTarifs) {
          const key = `${p.id}_${t.forfaitCode || t.forfaitLibelle}`;
          if (!map.has(key)) {
            map.set(key, {
              id: t.tarifParkingId,
              libelle: t.forfaitLibelle,
              typeAbonnement: t.forfaitCode,
              plageHoraire: t.forfaitDescription || (t.placeReservee ? "Place Réservée" : "24h / 7j"),
              dureeMois: t.dureeEnMois,
              tarifHT: Number(t.prixMensuelHT),
              tarifTTC: Number(t.prixMensuelTTC),
              parkingId: p.id,
              parkingNom: p.nom,
              actif: true,
            } as PlanTarifaire);
          }
        }
        return Array.from(map.values());
      } catch {
        return [];
      }
    });

    const results = await Promise.all(allTarifsPromises);
    const flattened = results.flat();
    
    if (flattened.length > 0) {
      return flattened;
    }

    return getTarifsMock();
  } catch (err) {
    console.warn("Erreur chargement tarifs MySQL, utilisation fallback:", err);
    return getTarifsMock();
  }
}

export async function deleteAdminTarif(id: number): Promise<{ message: string; warning?: boolean }> {
  const response = await client.delete<{ message: string; warning?: boolean }>(`/admin/tarifs/${id}`);
  return response.data;
}

export async function createAdminTarif(data: any): Promise<any> {
  const response = await client.post("/admin/tarifs", data);
  return response.data;
}

export async function updateAdminTarif(id: number, data: any): Promise<any> {
  const response = await client.put(`/admin/tarifs/${id}`, data);
  return response.data;
}


