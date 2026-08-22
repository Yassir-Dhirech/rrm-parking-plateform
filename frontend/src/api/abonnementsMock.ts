import type { AbonnementListItem, AbonnementDetail, TypeAbonnement } from "../features/abonnements/types";
import { formatDate } from "../lib/dateUtils";
import { reserverPlaceParkingMock } from "./adminMock";

const mockAbonnements: AbonnementListItem[] = [
  {
    id: 1,
    reference: "ABO-2026-000001",
    type: "REGULIER",
    statut: "ACTIF",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateDebut: "15/01/2026",
    dateFin: "15/07/2026",
  },
  {
    id: 2,
    reference: "ABO-2026-000002",
    type: "ENTREPRISE",
    statut: "ACTIF",
    clientNom: "Société Atlas Trans",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "01/06/2025",
    dateFin: "01/06/2030",
  },
  {
    id: 3,
    reference: "ABO-2026-000003",
    type: "REGULIER",
    statut: "EXPIRE",
    clientNom: "Sara Bennis",
    parkingNom: "Parking Bab El Had",
    dateDebut: "01/10/2025",
    dateFin: "01/04/2026",
  },
  {
    id: 4,
    reference: "ABO-STF-2026-000101",
    type: "STAFF",
    statut: "ACTIF",
    clientNom: "Youssef Tazi (Agent RRM)",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "01/01/2026",
    dateFin: "31/12/2026",
  },
  {
    id: 5,
    reference: "ABO-STF-2026-000102",
    type: "STAFF",
    statut: "ACTIF",
    clientNom: "Meriem Filali (Superviseur RRM)",
    parkingNom: "Parking Hassan II",
    dateDebut: "01/01/2026",
    dateFin: "31/12/2026",
  },
];

const suspendedMotifs: Record<number, string> = {};

export async function getAbonnementsMock(): Promise<AbonnementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockAbonnements];
}

export interface CreateStaffAbonnementInput {
  type: TypeAbonnement;
  clientNom: string;
  parkingNom: string;
  immatriculation: string;
  numeroMatriculeStaff?: string;
  dureeMois: number;
  exonereStaff: boolean;
}

export async function createStaffAbonnementMock(input: CreateStaffAbonnementInput): Promise<AbonnementListItem> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const newId = mockAbonnements.length + 1;
  const isStaff = input.type === "STAFF";
  const refPrefix = isStaff ? "ABO-STF" : "ABO";
  const reference = `${refPrefix}-2026-${String(newId).padStart(6, "0")}`;

  const today = new Date();
  const dateDebut = formatDate(today.toISOString());
  const endDateObj = new Date(today.setMonth(today.getMonth() + input.dureeMois));
  const dateFin = formatDate(endDateObj.toISOString());

  const newItem: AbonnementListItem = {
    id: newId,
    reference,
    type: input.type,
    statut: "ACTIF",
    clientNom: isStaff ? `${input.clientNom} (Staff RRM)` : input.clientNom,
    parkingNom: input.parkingNom,
    dateDebut,
    dateFin,
  };

  const typeClientTarget = input.type === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";
  reserverPlaceParkingMock(1, typeClientTarget, 1);

  mockAbonnements.unshift(newItem);
  return newItem;
}

export interface SuspendAbonnementInput {
  id: number;
  motif: string;
}

export async function suspendAbonnementMock({ id, motif }: SuspendAbonnementInput): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);
  if (found) {
    found.statut = "SUSPENDU";
    suspendedMotifs[id] = motif;
  }
  return getAbonnementByIdMock(id);
}

export async function reactivateAbonnementMock(id: number): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);
  if (found) {
    found.statut = "ACTIF";
    delete suspendedMotifs[id];
  }
  return getAbonnementByIdMock(id);
}

export async function getAbonnementByIdMock(id: number): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);

  return {
    id,
    reference: found?.reference || `ABO-2026-00000${id}`,
    type: found?.type || "REGULIER",
    statut: found?.statut || "ACTIF",
    clientNom: found?.clientNom || "Karim El Amrani",
    parkingNom: found?.parkingNom || "Parking Bab El Had",
    dateDebut: formatDate(found?.dateDebut || "15/01/2026"),
    dateFin: formatDate(found?.dateFin || "15/07/2026"),
    vehiculeImmatriculation: "12345-A-6",
    planTarifaireNom: found?.type === "STAFF" ? "Pass Exonéré Staff RRM" : "Voiture - 6 mois",
    montantTotal: found?.type === "STAFF" ? 0 : 1200,
    motifSuspension: suspendedMotifs[id] || (found?.statut === "SUSPENDU" ? "Suspension administrative" : undefined),
  };
}