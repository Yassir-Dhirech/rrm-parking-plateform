import client from "./client";

export interface Parking {
  id: number;
  code: string;
  nom: string;
}

export async function getPublicParkings(): Promise<Parking[]> {
  const response = await client.get<Parking[]>("/public/parkings");
  return response.data;
}