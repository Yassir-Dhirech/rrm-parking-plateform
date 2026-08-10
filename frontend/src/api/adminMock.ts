import { UtilisateursList } from "../features/admin/pages/UtilisateursList";
import type{ AuditLog, Parking, PlanTarifaire, Utilisateur } from "../features/admin/types";

export const mockUtilisateurs: Utilisateur[] =[
  { id: 1, nom: "El Amrani", prenom: "Simo", email: "s.elamrani@rrm.ma", role: "SUPERVISEUR", parkingAssigneId: 1, parkingAssigneNom: "Parking Agdal Gare", actif: true, dateCreation: "2026-01-10" },
  { id: 2, nom: "Benali", prenom: "Khadija", email: "k.benali@rrm.ma", role: "AGENT", parkingAssigneId: 1, parkingAssigneNom: "Parking Agdal Gare", actif: true, dateCreation: "2026-01-15" },
  { id: 3, nom: "Chraibi", prenom: "Omar", email: "o.chraibi@rrm.ma", role: "RESPONSABLE", actif: true, dateCreation: "2026-01-05" },
  { id: 4, nom: "Tazi", prenom: "Fatima", email: "f.tazi@rrm.ma", role: "COMPTABLE", actif: true, dateCreation: "2026-01-20" },
];

export const mockParkings: Parking[] = [
  { id: 1, code: "PRK-AGD", nom: "Parking Agdal Gare", adresse: "Avenue Hajj Ahmed Balafrej, Rabat", capaciteTotale: 450, placesReserveesAbonnes: 150, actif: true },
  { id: 2, code: "PRK-HSN", nom: "Parking Hassan II", adresse: "Boulevard Hassan II, Rabat", capaciteTotale: 300, placesReserveesAbonnes: 100, actif: true },
  { id: 3, code: "PRK-BAB", nom: "Parking Bab El Had", adresse: "Place Bab El Had, Rabat", capaciteTotale: 200, placesReserveesAbonnes: 50, actif: true },
];

export const mockTarifs: PlanTarifaire[] = [
  { id: 1, libelle: "Pass Mensuel Particulier Standard", typeAbonnement: "PARTICULIER", dureeMois: 1, tarifHT: 500, tarifTTC: 600, actif: true },
  { id: 2, libelle: "Pass Annuel Particulier Premium", typeAbonnement: "PARTICULIER", dureeMois: 12, tarifHT: 5000, tarifTTC: 6000, actif: true },
  { id: 3, libelle: "Forfait Corporate Flotte 5+", typeAbonnement: "CORPORATE", dureeMois: 12, tarifHT: 4500, tarifTTC: 5400, actif: true },
];

export const mockLogs: AuditLog[] = [
  { id: 1, timestamp: "2026-08-09 14:22:10", utilisateurEmail: "s.elamrani@rrm.ma", role: "SUPERVISEUR", action: "VALIDATION_RECETTE", entite: "RecetteHebdo", entiteId: "REC-2026-W31-P01", adresseIp: "196.200.14.12", details: "Validation recette semaine 31" },
  { id: 2, timestamp: "2026-08-09 11:05:44", utilisateurEmail: "o.chraibi@rrm.ma", role: "RESPONSABLE", action: "SIGNATURE_CONTRAT", entite: "ContratCorporate", entiteId: "CTR-2026-0002", adresseIp: "196.200.14.18", details: "Signature du contrat Maroc Telecom Agency" },
  { id: 3, timestamp: "2026-08-08 16:40:02", utilisateurEmail: "k.benali@rrm.ma", role: "AGENT", action: "CREATION_PAIEMENT", entite: "Paiement", entiteId: "PAI-2026-0891", adresseIp: "196.200.14.33", details: "Enregistrement paiement espèces 600 MAD" },
];

// Async Mocks
export async function getUtilisateursMock(): Promise<Utilisateur[]> {
  return new Promise((res) => setTimeout(() => res(mockUtilisateurs), 300));
}
export async function getParkingsMock(): Promise<Parking[]> {
  return new Promise((res) => setTimeout(() => res(mockParkings), 300));
}
export async function getTarifsMock(): Promise<PlanTarifaire[]> {
  return new Promise((res) => setTimeout(() => res(mockTarifs), 300));
}
export async function getLogsMock(): Promise<AuditLog[]> {
  return new Promise((res) => setTimeout(() => res(mockLogs), 300));
}