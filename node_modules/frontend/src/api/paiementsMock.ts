import type { PaiementListItem, PaiementDetail } from "../features/paiements/types";
import { formatDate } from "../lib/dateUtils";

const mockPaiements: PaiementDetail[] = [
  {
    id: 1,
    reference: "PAY-2026-000001",
    montant: 1490,
    montantAbonnement: 1440,
    fraisCarteRfid: 50,
    modePaiement: "ESPECES",
    statut: "CONFIRME",
    clientNom: "Karim El Amrani",
    datePaiement: "15/01/2026",
    abonnementReference: "ABO-2026-000001",
    factureId: 1,
    factureNumero: "FACT-BEH-2026-000001",
    enregistrePar: "Agent Rachid",
  },
  {
    id: 2,
    reference: "PAY-2026-000002",
    montant: 54500,
    montantAbonnement: 54000,
    fraisCarteRfid: 500,
    modePaiement: "CHEQUE",
    statut: "CONFIRME",
    clientNom: "Société Atlas Trans",
    datePaiement: "01/06/2025",
    abonnementReference: "ABO-2026-000002",
    factureId: 2,
    factureNumero: "FACT-AGD-2026-000002",
    numeroCheque: "CHQ-ATLAS-8942",
    banque: "Attijariwafa Bank",
    enregistrePar: "M. Samir El Amrani (Superviseur)",
  },
  {
    id: 3,
    reference: "PAY-2026-000003",
    montant: 800,
    montantAbonnement: 800,
    fraisCarteRfid: 0,
    modePaiement: "CHEQUE",
    statut: "EN_ATTENTE",
    clientNom: "Sara Bennis",
    datePaiement: "30/07/2026",
    abonnementReference: "ABO-2026-000003",
    factureId: 3,
    factureNumero: "FACT-BEH-2026-000003",
    numeroCheque: "CHQ-778841",
    banque: "Banque Populaire",
    enregistrePar: "Agent Hassan",
  },
];

export async function getPaiementsMock(): Promise<PaiementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockPaiements.map((p) => ({
    id: p.id,
    reference: p.reference,
    montant: p.montant,
    montantAbonnement: p.montantAbonnement,
    fraisCarteRfid: p.fraisCarteRfid,
    modePaiement: p.modePaiement,
    statut: p.statut,
    clientNom: p.clientNom,
    datePaiement: formatDate(p.datePaiement),
    factureId: p.factureId,
    factureNumero: p.factureNumero,
  }));
}

export async function getPaiementByIdMock(id: number): Promise<PaiementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockPaiements.find((p) => p.id === id);
  if (found) {
    return {
      ...found,
      datePaiement: formatDate(found.datePaiement),
    };
  }

  const isCorp = id % 2 === 0;
  const montantAbo = isCorp ? 54000 : 1440;
  const fraisCarte = isCorp ? 500 : 50;

  return {
    id,
    reference: `PAY-2026-${String(id).padStart(6, "0")}`,
    montant: montantAbo + fraisCarte,
    montantAbonnement: montantAbo,
    fraisCarteRfid: fraisCarte,
    modePaiement: isCorp ? "CHEQUE" : "ESPECES",
    statut: "CONFIRME",
    clientNom: isCorp ? "Société Atlas Trans" : "Karim El Amrani",
    datePaiement: formatDate("15/01/2026"),
    abonnementReference: `ABO-2026-${String(id).padStart(6, "0")}`,
    factureId: id,
    factureNumero: `FACT-RRM-2026-${String(id).padStart(6, "0")}`,
    enregistrePar: "Agent Rachid",
  };
}