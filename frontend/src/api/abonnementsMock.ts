import type { AbonnementListItem, AbonnementDetail, TypeAbonnement } from "../features/abonnements/types";

const mockAbonnements: AbonnementListItem[] = [
  {
    id: 1,
    reference: "ABO-2026-000001",
    type: "REGULIER",
    statut: "ACTIF",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateDebut: "2026-01-15",
    dateFin: "2026-07-15",
  },
  {
    id: 2,
    reference: "ABO-2026-000002",
    type: "ENTREPRISE",
    statut: "ACTIF",
    clientNom: "Société Atlas Trans",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "2025-06-01",
    dateFin: "2030-06-01",
  },
  {
    id: 3,
    reference: "ABO-2026-000003",
    type: "REGULIER",
    statut: "EXPIRE",
    clientNom: "Sara Bennis",
    parkingNom: "Parking Bab El Had",
    dateDebut: "2025-10-01",
    dateFin: "2026-04-01",
  },
  {
    id: 4,
    reference: "ABO-STF-2026-000101",
    type: "STAFF",
    statut: "ACTIF",
    clientNom: "Youssef Tazi (Agent RRM)",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "2026-01-01",
    dateFin: "2026-12-31",
  },
  {
    id: 5,
    reference: "ABO-STF-2026-000102",
    type: "STAFF",
    statut: "ACTIF",
    clientNom: "Meriem Filali (Superviseur RRM)",
    parkingNom: "Parking Hassan II",
    dateDebut: "2026-01-01",
    dateFin: "2026-12-31",
  },
];

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
  const dateDebut = today.toISOString().split("T")[0];
  const endDateObj = new Date(today.setMonth(today.getMonth() + input.dureeMois));
  const dateFin = endDateObj.toISOString().split("T")[0];

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

  mockAbonnements.unshift(newItem);
  return newItem;
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
    dateDebut: found?.dateDebut || "2026-01-15",
    dateFin: found?.dateFin || "2026-07-15",
    vehiculeImmatriculation: "12345-A-6",
    planTarifaireNom: found?.type === "STAFF" ? "Pass Exonéré Staff RRM" : "Voiture - 6 mois",
    montantTotal: found?.type === "STAFF" ? 0 : 1200,
  };
}