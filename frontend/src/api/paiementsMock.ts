import type{ PaiementListItem, PaiementDetail } from "../features/paiements/types";

const mockPaiements: PaiementListItem[] = [
  {
    id: 1,
    reference: "PAY-2026-000001",
    montant: 1200,
    modePaiement: "ESPECES",
    statut: "CONFIRME",
    clientNom: "Karim El Amrani",
    datePaiement: "2026-01-15",
  },
  {
    id: 2,
    reference: "PAY-2026-000002",
    montant: 45000,
    modePaiement: "CHEQUE",
    statut: "CONFIRME",
    clientNom: "Société Atlas Trans",
    datePaiement: "2025-06-01",
  },
  {
    id: 3,
    reference: "PAY-2026-000003",
    montant: 800,
    modePaiement: "CHEQUE",
    statut: "EN_ATTENTE",
    clientNom: "Sara Bennis",
    datePaiement: "2026-07-30",
  },
];

export async function getPaiementsMock(): Promise<PaiementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockPaiements;
}

export async function getPaiementByIdMock(id: number): Promise<PaiementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id,
    reference: `PAY-2026-00000${id}`,
    montant: 1200,
    modePaiement: "ESPECES",
    statut: "CONFIRME",
    clientNom: "Karim El Amrani",
    datePaiement: "2026-01-15",
    abonnementReference: "ABO-2026-000001",
    enregistrePar: "Agent Rachid",
  };
}