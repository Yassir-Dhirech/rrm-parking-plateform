import type { PaiementListItem, PaiementDetail } from "../features/paiements/types";
import { formatDate } from "../lib/dateUtils";

const mockPaiements: PaiementListItem[] = [
  {
    id: 1,
    reference: "PAY-2026-000001",
    montant: 1200,
    modePaiement: "ESPECES",
    statut: "CONFIRME",
    clientNom: "Karim El Amrani",
    datePaiement: "15/01/2026",
  },
  {
    id: 2,
    reference: "PAY-2026-000002",
    montant: 45000,
    modePaiement: "CHEQUE",
    statut: "CONFIRME",
    clientNom: "Société Atlas Trans",
    datePaiement: "01/06/2025",
  },
  {
    id: 3,
    reference: "PAY-2026-000003",
    montant: 800,
    modePaiement: "CHEQUE",
    statut: "EN_ATTENTE",
    clientNom: "Sara Bennis",
    datePaiement: "30/07/2026",
  },
];

export async function getPaiementsMock(): Promise<PaiementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockPaiements.map((p) => ({
    ...p,
    datePaiement: formatDate(p.datePaiement),
  }));
}

export async function getPaiementByIdMock(id: number): Promise<PaiementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockPaiements.find((p) => p.id === id);
  return {
    id,
    reference: found?.reference || `PAY-2026-00000${id}`,
    montant: found?.montant || 1200,
    modePaiement: found?.modePaiement || "ESPECES",
    statut: found?.statut || "CONFIRME",
    clientNom: found?.clientNom || "Karim El Amrani",
    datePaiement: formatDate(found?.datePaiement || "15/01/2026"),
    abonnementReference: "ABO-2026-000001",
    enregistrePar: "Agent Rachid",
  };
}