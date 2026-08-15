import client from "./client";

export interface Parking {
  id: number;
  code: string;
  nom: string;
}

export async function getPublicParkings(): Promise<Parking[]> {
  try {
    const response = await client.get<Parking[]>("/public/parkings");
    return response.data;
  } catch {
    return [
      { id: 1, code: "PRK-AGD", nom: "Parking Agdal Gare" },
      { id: 2, code: "PRK-HSN", nom: "Parking Hassan II" },
      { id: 3, code: "PRK-BAB", nom: "Parking Bab El Had" },
      { id: 4, code: "PRK-CHL", nom: "Parking Chellah" },
      { id: 5, code: "PRK-SIN", nom: "Parking Ibn Sina" },
    ];
  }
}