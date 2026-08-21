import type { AuditLog, Parking, PlanTarifaire, Utilisateur } from "../features/admin/types";
import { formatDate } from "../lib/dateUtils";

export const mockUtilisateurs: Utilisateur[] = [
  { id: 1, nom: "El Amrani", prenom: "Simo", email: "s.elamrani@rrm.ma", role: "SUPERVISEUR", parkingAssigneId: 1, parkingAssigneNom: "Parking Agdal Gare", actif: true, dateCreation: "10/01/2026" },
  { id: 2, nom: "Benali", prenom: "Khadija", email: "k.benali@rrm.ma", role: "AGENT", parkingAssigneId: 1, parkingAssigneNom: "Parking Agdal Gare", actif: true, dateCreation: "15/01/2026" },
  { id: 3, nom: "Chraibi", prenom: "Omar", email: "o.chraibi@rrm.ma", role: "RESPONSABLE", actif: true, dateCreation: "05/01/2026" },
  { id: 4, nom: "Tazi", prenom: "Fatima", email: "f.tazi@rrm.ma", role: "COMPTABLE", actif: true, dateCreation: "20/01/2026" },
];

export const mockParkings: Parking[] = [
  { id: 1, code: "PRK-AGD", nom: "Parking Agdal Gare", adresse: "Avenue Hajj Ahmed Balafrej, Rabat", capaciteTotale: 450, placesReserveesAbonnes: 150, actif: true },
  { id: 2, code: "PRK-HSN", nom: "Parking Hassan II", adresse: "Boulevard Hassan II, Rabat", capaciteTotale: 300, placesReserveesAbonnes: 100, actif: true },
  { id: 3, code: "PRK-BAB", nom: "Parking Bab El Had", adresse: "Place Bab El Had, Rabat", capaciteTotale: 200, placesReserveesAbonnes: 50, actif: true },
];

export const mockTarifs: PlanTarifaire[] = [
  { id: 1, libelle: "Abonnement Permanent 24h/7j", typeAbonnement: "PERMANENT_24_7", plageHoraire: "24h / 7j", dureeMois: 1, tarifHT: 500, tarifTTC: 600, parkingId: 1, parkingNom: "Parking Agdal Gare", actif: true },
  { id: 2, libelle: "Abonnement Jour (Diurne)", typeAbonnement: "JOUR_8H_20H", plageHoraire: "08:00 - 20:00", dureeMois: 1, tarifHT: 350, tarifTTC: 420, parkingId: 1, parkingNom: "Parking Agdal Gare", actif: true },
  { id: 3, libelle: "Abonnement Nuit (Nocturne)", typeAbonnement: "NUIT_19H_8H", plageHoraire: "19:00 - 08:00", dureeMois: 1, tarifHT: 250, tarifTTC: 300, parkingId: 1, parkingNom: "Parking Agdal Gare", actif: true },
  { id: 4, libelle: "Abonnement Corporate (Flotte)", typeAbonnement: "CORPORATE", plageHoraire: "Sur mesure", dureeMois: 12, tarifHT: 4500, tarifTTC: 5400, parkingId: 1, parkingNom: "Parking Agdal Gare", actif: true },
  
  { id: 5, libelle: "Abonnement Permanent 24h/7j", typeAbonnement: "PERMANENT_24_7", plageHoraire: "24h / 7j", dureeMois: 1, tarifHT: 600, tarifTTC: 720, parkingId: 2, parkingNom: "Parking Hassan II", actif: true },
  { id: 6, libelle: "Abonnement Jour (Diurne)", typeAbonnement: "JOUR_8H_20H", plageHoraire: "08:00 - 20:00", dureeMois: 1, tarifHT: 400, tarifTTC: 480, parkingId: 2, parkingNom: "Parking Hassan II", actif: true },
  { id: 7, libelle: "Abonnement Nuit (Nocturne)", typeAbonnement: "NUIT_19H_8H", plageHoraire: "19:00 - 08:00", dureeMois: 1, tarifHT: 300, tarifTTC: 360, parkingId: 2, parkingNom: "Parking Hassan II", actif: true },
  { id: 8, libelle: "Abonnement Corporate (Flotte)", typeAbonnement: "CORPORATE", plageHoraire: "Sur mesure", dureeMois: 12, tarifHT: 5000, tarifTTC: 6000, parkingId: 2, parkingNom: "Parking Hassan II", actif: true },

  { id: 9, libelle: "Abonnement Permanent 24h/7j", typeAbonnement: "PERMANENT_24_7", plageHoraire: "24h / 7j", dureeMois: 1, tarifHT: 450, tarifTTC: 540, parkingId: 3, parkingNom: "Parking Bab El Had", actif: true },
  { id: 10, libelle: "Abonnement Jour (Diurne)", typeAbonnement: "JOUR_8H_20H", plageHoraire: "08:00 - 20:00", dureeMois: 1, tarifHT: 300, tarifTTC: 360, parkingId: 3, parkingNom: "Parking Bab El Had", actif: true },
];

export const mockLogs: AuditLog[] = [
  { id: 1, timestamp: "09/08/2026 14:22", utilisateurEmail: "s.elamrani@rrm.ma", role: "SUPERVISEUR", action: "VALIDATION_RECETTE", entite: "RecetteHebdo", entiteId: "REC-2026-W31-P01", adresseIp: "196.200.14.12", details: "Validation recette semaine 31" },
  { id: 2, timestamp: "09/08/2026 11:05", utilisateurEmail: "o.chraibi@rrm.ma", role: "RESPONSABLE", action: "SIGNATURE_CONTRAT", entite: "ContratCorporate", entiteId: "CTR-2026-0002", adresseIp: "196.200.14.18", details: "Signature du contrat Maroc Telecom Agency" },
  { id: 3, timestamp: "08/08/2026 16:40", utilisateurEmail: "k.benali@rrm.ma", role: "AGENT", action: "CREATION_PAIEMENT", entite: "Paiement", entiteId: "PAI-2026-0891", adresseIp: "196.200.14.33", details: "Enregistrement paiement espèces 600 MAD" },
];

// Async Mocks
export async function getUtilisateursMock(): Promise<Utilisateur[]> {
  return new Promise((res) => setTimeout(() => res(mockUtilisateurs.map((u) => ({ ...u, dateCreation: formatDate(u.dateCreation) }))), 300));
}
export async function getParkingsMock(): Promise<Parking[]> {
  return new Promise((res) => setTimeout(() => res(mockParkings), 300));
}
export async function getTarifsMock(): Promise<PlanTarifaire[]> {
  return new Promise((res) => setTimeout(() => res(mockTarifs), 300));
}
export async function getLogsMock(): Promise<AuditLog[]> {
  return new Promise((res) => setTimeout(() => res(mockLogs.map((l) => ({ ...l, timestamp: formatDate(l.timestamp) }))), 300));
}