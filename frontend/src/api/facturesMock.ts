import type { FactureListItem, FactureDetail } from "../features/factures/types";
import { formatDate } from "../lib/dateUtils";

const mockFactures: FactureListItem[] = [
  {
    id: 1,
    numero: "FACT-BEH-2026-000001",
    montantTtc: 1440,
    statut: "SIGNEE",
    clientNom: "Karim El Amrani",
    dateEmission: "16/01/2026",
  },
  {
    id: 2,
    numero: "FACT-AGD-2026-000002",
    montantTtc: 54000,
    statut: "EMISE",
    clientNom: "Société Atlas Trans",
    dateEmission: "02/06/2025",
  },
];

export async function getFacturesMock(): Promise<FactureListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockFactures.map((item) => ({
    ...item,
    dateEmission: formatDate(item.dateEmission),
  }));
}

export async function getFactureByIdMock(id: number): Promise<FactureDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockFactures.find((f) => f.id === id);
  return {
    id,
    numero: found?.numero || `FACT-BEH-2026-00000${id}`,
    montantTtc: found?.montantTtc || 1440,
    montantHt: 1200,
    tauxTva: 20,
    montantTva: 240,
    statut: found?.statut || "EMISE",
    clientNom: found?.clientNom || "Karim El Amrani",
    dateEmission: formatDate(found?.dateEmission || "16/01/2026"),
    abonnementReference: "ABO-2026-000001",
    genereePar: "Superviseur Nadia",
  };
}

export interface CreerFacturePayload {
  clientNom: string;
  abonnementReference: string;
  montantTtc: number;
  genereePar?: string;
  modePaiement?: string;
}

export async function creerFactureMock(payload: CreerFacturePayload): Promise<FactureDetail> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const newId = mockFactures.length + 1;
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const numero = `FACT-RRM-${now.getFullYear()}-${String(newId).padStart(6, "0")}`;

  const montantHt = Math.round((payload.montantTtc / 1.2) * 100) / 100;
  const montantTva = Math.round((payload.montantTtc - montantHt) * 100) / 100;

  const newFactureItem: FactureListItem = {
    id: newId,
    numero,
    montantTtc: payload.montantTtc,
    statut: "EMISE",
    clientNom: payload.clientNom,
    dateEmission: dateFormatted,
  };

  mockFactures.unshift(newFactureItem);

  return {
    ...newFactureItem,
    montantHt,
    tauxTva: 20,
    montantTva,
    abonnementReference: payload.abonnementReference,
    genereePar: payload.genereePar || "Superviseur Exploitation",
  };
}

export async function signerFactureMock(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockFactures.find((f) => f.id === id);
  if (found) {
    found.statut = "SIGNEE";
  }
}