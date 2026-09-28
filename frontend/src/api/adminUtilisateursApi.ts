import client from "./client";
import type { Role } from "../lib/roleConfig";
import { getUtilisateursMock } from "./adminMock";

export interface BackendUtilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  statut: "ACTIF" | "DESACTIVE" | "BLOQUE";
  actif: boolean;
  parkingAssigneIds?: number[];
  parkingAssigneNoms?: string[];
  dateDerniereConnexion?: string;
  dateCreation?: string;
}

export interface UserLog {
  id: number;
  dateEvenement: string;
  typeAction: string;
  resultat: string;
  message: string;
  typeObjet?: string;
  referenceObjet?: string;
  detailsTechniques?: string;
  adresseIp?: string;
}

export async function getBackendUtilisateurs(): Promise<BackendUtilisateur[]> {
  try {
    const response = await client.get<BackendUtilisateur[]>("/admin/utilisateurs");
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    throw new Error("Table vide ou en attente de rebuild");
  } catch (error) {
    console.warn("Backend /admin/utilisateurs non disponible ou en recompilation, fallback mock:", error);
    const mock = await getUtilisateursMock();
    return mock.map((m) => ({
      id: m.id,
      nom: m.nom,
      prenom: m.prenom,
      email: m.email,
      role: m.role,
      statut: m.actif ? "ACTIF" : "DESACTIVE",
      actif: m.actif,
      parkingAssigneIds: m.parkingAssigneId ? [m.parkingAssigneId] : [],
      parkingAssigneNoms: m.parkingAssigneNom ? [m.parkingAssigneNom] : [],
      dateDerniereConnexion: undefined,
      dateCreation: m.dateCreation,
    }));
  }
}

export async function modifierUtilisateur(
  id: number,
  data: Partial<BackendUtilisateur> & { motDePasse?: string }
): Promise<void> {
  await client.put(`/admin/utilisateurs/${id}`, data);
}

export async function creerUtilisateur(data: {
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  parkingAssigneIds?: number[];
  motDePasse?: string;
}): Promise<void> {
  await client.post("/admin/utilisateurs", data);
}

export async function supprimerUtilisateur(id: number): Promise<void> {
  await client.delete(`/admin/utilisateurs/${id}`);
}

export async function getUserLogs(userId: number): Promise<UserLog[]> {
  try {
    const response = await client.get<UserLog[]>(`/admin/utilisateurs/${userId}/logs`);
    return response.data;
  } catch {
    return [];
  }
}

export async function notifyBackendLogout(): Promise<void> {
  try {
    await client.post("/v1/auth/logout");
  } catch (ignored) {}
}
