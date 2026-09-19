import client from "./client";

export type StatutParking =
  | "ACTIF"
  | "SUSPENDU"
  | "ARCHIVE";

export interface Parking {
  id: number;
  code: string;
  nom: string;
  adresse: string;

  latitude: number | null;
  longitude: number | null;

  statut: StatutParking;

  capaciteTotale: number;
  capaciteReserveeAbonnements: number;
  placesOccupeesAbonnements: number;
  placesDisponiblesAbonnements: number;
  tauxOccupationAbonnements: number;

  souscriptionDisponible: boolean;
}

export interface TarifParkingPublicResponse {
  tarifParkingId: number;

  parkingId: number;

  forfaitId: number;
  forfaitCode: string;
  forfaitLibelle: string;
  forfaitDescription: string | null;

  placeReservee: boolean;
  dureeEnMois: number;

  prixMensuelHT: number;
  tauxTVA: number;
  prixMensuelTTC: number;
  montantTotalTTC: number;

  dateDebutValidite: string;
  dateFinValidite: string | null;
}

/**
 * Parkings affichés sur la carte publique.
 * Inclut les parkings actifs et suspendus.
 */
export async function getPublicParkings(): Promise<Parking[]> {
  const response = await client.get<Parking[]>("/public/parkings");
  return response.data;
}

/**
 * Parkings affichés dans la liste de choix
 * du formulaire d'abonnement.
 *
 * Retourne uniquement les parkings actifs
 * ayant des places d'abonnement disponibles.
 */
export async function getParkingsDisponiblesAbonnement(): Promise<Parking[]> {
  const response = await client.get<Parking[]>(
    "/public/parkings/disponibles-abonnement"
  );
  return response.data;
}

/**
 * Tarifs disponibles pour le parking sélectionné.
 */
export async function getTarifsParking(
  parkingId: number
): Promise<TarifParkingPublicResponse[]> {
  if (!Number.isInteger(parkingId) || parkingId <= 0) {
    throw new Error("L'identifiant du parking est invalide");
  }

  const response = await client.get<TarifParkingPublicResponse[]>(
    `/public/parkings/${parkingId}/tarifs`
  );
  return response.data;
}