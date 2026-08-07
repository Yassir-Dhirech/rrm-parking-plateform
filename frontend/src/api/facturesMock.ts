import type{ FactureListItem, FactureDetail } from "../features/factures/types";

const mockFactures: FactureListItem[] = [
  {
    id: 1,
    numero: "FACT-BEH-2026-000001",
    montantTtc: 1440,
    statut: "SIGNEE",
    clientNom: "Karim El Amrani",
    dateEmission: "2026-01-16",
  },
  {
    id: 2,
    numero: "FACT-AGD-2026-000002",
    montantTtc: 54000,
    statut: "EMISE",
    clientNom: "Société Atlas Trans",
    dateEmission: "2025-06-02",
  },
];

export async function getFacturesMock(): Promise<FactureListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockFactures;
}

export async function getFactureByIdMock(id: number): Promise<FactureDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id,
    numero: `FACT-BEH-2026-00000${id}`,
    montantTtc: 1440,
    montantHt: 1200,
    tauxTva: 20,
    montantTva: 240,
    statut: "EMISE",
    clientNom: "Karim El Amrani",
    dateEmission: "2026-01-16",
    abonnementReference: "ABO-2026-000001",
    genereePar: "Superviseur Nadia",
  };
}

export async function signerFactureMock(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`Facture ${id} signée (mock)`);
}