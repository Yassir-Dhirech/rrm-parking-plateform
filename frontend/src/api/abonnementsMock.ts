import type { AbonnementListItem, AbonnementDetail } from "../features/abonnements/types";

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
    parkingNom: "Parking Agdal",
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
];

export async function getAbonnementsMock(): Promise<AbonnementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockAbonnements;
}

export async function getAbonnementByIdMock(id: number): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id,
    reference: `ABO-2026-00000${id}`,
    type: "REGULIER",
    statut: "ACTIF",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateDebut: "2026-01-15",
    dateFin: "2026-07-15",
    vehiculeImmatriculation: "12345-A-6",
    planTarifaireNom: "Voiture - 6 mois",
    montantTotal: 1200,
  };
}