import client from "./client";

export interface CreerAvis {
  typeAvis: "SUGGESTION" | "SATISFACTION" | "RECLAMATION" | "AUTRE";
  noteSatisfaction: number;
  parkingId?: number;
  message: string;
  nomContact?: string;
  contactInfo?: string;
}

export interface Avis extends CreerAvis {
  id: number;
  parkingNom: string | null;
  dateCreation: string;
}

export interface RepartitionAvis {
  note: number;
  nombre: number;
  pourcentage: number;
}

export interface StatistiquesAvis {
  total: number;
  moyenne: number;
  cinqEtoiles: number;
  repartition: RepartitionAvis[];
}

export interface PageAvis {
  content: Avis[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export async function envoyerAvis(donnees: CreerAvis): Promise<Avis> {
  const { data } = await client.post<Avis>("/public/avis", donnees);
  return data;
}

export async function consulterAvis(page: number): Promise<PageAvis> {
  const { data } = await client.get<PageAvis>("/responsable/avis", { params: { page, taille: 10 } });
  return data;
}

export async function statistiquesAvis(): Promise<StatistiquesAvis> {
  const { data } = await client.get<StatistiquesAvis>("/responsable/avis/statistiques");
  return data;
}

export async function rapportAvis(): Promise<Blob> {
  const { data } = await client.get<Blob>("/responsable/avis/rapport", { responseType: "blob" });
  return data;
}
