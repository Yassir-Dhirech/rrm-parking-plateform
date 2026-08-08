import type { CarteListItem, CarteDetail } from "../features/cartes/types";

const mockCartes: CarteListItem[] = [
  {
    id: 1,
    numeroCarte: "CARD-000123",
    statut: "A_ACTIVER",
    abonnementReference: "ABO-2026-000001",
    clientNom: "Karim El Amrani",
  },
  {
    id: 2,
    numeroCarte: "CARD-000124",
    statut: "ACTIVE",
    abonnementReference: "ABO-2026-000002",
    clientNom: "Société Atlas Trans",
  },
];

export async function getCartesMock(): Promise<CarteListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockCartes;
}

export async function getCarteByIdMock(id: number): Promise<CarteDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id,
    numeroCarte: "CARD-000123",
    statut: "A_ACTIVER",
    abonnementReference: "ABO-2026-000001",
    clientNom: "Karim El Amrani",
    datePreparation: "2026-01-16",
    preparePar: "Agent Rachid",
  };
}

export async function activerCarteMock(id: number, note: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`Carte ${id} activée (mock), note: ${note}`);
}