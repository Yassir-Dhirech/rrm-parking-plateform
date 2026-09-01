import type { FactureListItem, FactureDetail } from "../features/factures/types";
import { formatDate } from "../lib/dateUtils";

const mockFactures: FactureDetail[] = [
  {
    id: 1,
    numero: "FACT-BEH-2026-000001",
    montantTtc: 1490,
    montantAbonnementTtc: 1440,
    fraisCarteRfid: 50,
    montantHt: 1241.67,
    tauxTva: 20,
    montantTva: 248.33,
    statut: "SIGNEE",
    clientNom: "Karim El Amrani",
    dateEmission: "15/01/2026",
    abonnementReference: "ABO-2026-000001",
    paiementReference: "PAY-2026-000001",
    paiementId: 1,
    modePaiement: "ESPECES",
    libellePrestation: "Souscription Initiale 6 Mois (+50 DH Badge RFID)",
    genereePar: "Agent Rachid (Guichet)",
    signeePar: "M. Samir El Amrani (Directeur Exploitation)",
    dateSignature: "16/01/2026",
    nombreCartes: 1,
  },
  {
    id: 2,
    numero: "FACT-AGD-2026-000002",
    montantTtc: 54500,
    montantAbonnementTtc: 54000,
    fraisCarteRfid: 500,
    nombreCartes: 10,
    montantHt: 45416.67,
    tauxTva: 20,
    montantTva: 9083.33,
    statut: "EMISE",
    clientNom: "Société Atlas Trans",
    dateEmission: "01/06/2025",
    abonnementReference: "ABO-2026-000002",
    paiementReference: "PAY-2026-000002",
    paiementId: 2,
    modePaiement: "CHEQUE",
    libellePrestation: "Contrat Corporate Flotte (10 Véhicules x 20 Ans)",
    genereePar: "M. Samir El Amrani (Superviseur)",
  },
  {
    id: 3,
    numero: "FACT-BEH-2026-000003",
    montantTtc: 800,
    montantAbonnementTtc: 800,
    fraisCarteRfid: 0,
    nombreCartes: 0,
    montantHt: 666.67,
    tauxTva: 20,
    montantTva: 133.33,
    statut: "EMISE",
    clientNom: "Sara Bennis",
    dateEmission: "30/07/2026",
    abonnementReference: "ABO-2026-000003",
    paiementReference: "PAY-2026-000003",
    paiementId: 3,
    modePaiement: "ESPECES",
    libellePrestation: "Pass Diurne 08h-20h (Trimestre)",
    genereePar: "Agent Hassan (Guichet)",
  },
  {
    id: 4,
    numero: "FACT-BEH-2026-000004",
    montantTtc: 1440,
    montantAbonnementTtc: 1440,
    fraisCarteRfid: 0,
    nombreCartes: 0,
    montantHt: 1200.00,
    tauxTva: 20,
    montantTva: 240.00,
    statut: "SIGNEE",
    clientNom: "Karim El Amrani",
    dateEmission: "15/07/2026",
    abonnementReference: "ABO-2026-000001", // Second distinct payment for same subscriber -> New distinct Facture!
    paiementReference: "PAY-2026-000004",
    paiementId: 4,
    modePaiement: "ESPECES",
    libellePrestation: "Renouvellement 6 Mois (0 DH Badge - Même carte réutilisée)",
    genereePar: "Agent Rachid (Guichet)",
    signeePar: "M. Samir El Amrani (Directeur Exploitation)",
    dateSignature: "16/07/2026",
  },
];

export async function getFacturesMock(): Promise<FactureListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockFactures.map((item) => ({
    id: item.id,
    numero: item.numero,
    montantTtc: item.montantTtc,
    statut: item.statut,
    clientNom: item.clientNom,
    dateEmission: formatDate(item.dateEmission),
    paiementId: item.paiementId,
    paiementReference: item.paiementReference,
    modePaiement: item.modePaiement,
    libellePrestation: item.libellePrestation,
    fraisCarteRfid: item.fraisCarteRfid,
    montantAbonnementTtc: item.montantAbonnementTtc,
  }));
}

export async function getFactureByIdMock(id: number): Promise<FactureDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockFactures.find((f) => f.id === id);
  if (found) {
    return {
      ...found,
      dateEmission: formatDate(found.dateEmission),
      dateSignature: found.dateSignature ? formatDate(found.dateSignature) : undefined,
    };
  }

  const isCorp = id % 2 === 0;
  const montantAbonnement = isCorp ? 54000 : 1440;
  const fraisCarte = isCorp ? 500 : 50;
  const montantTtc = montantAbonnement + fraisCarte;
  const montantHt = Math.round((montantTtc / 1.2) * 100) / 100;
  const montantTva = Math.round((montantTtc - montantHt) * 100) / 100;

  return {
    id,
    numero: `FACT-RRM-2026-${String(id).padStart(6, "0")}`,
    montantTtc,
    montantAbonnementTtc: montantAbonnement,
    fraisCarteRfid: fraisCarte,
    nombreCartes: isCorp ? 10 : 1,
    montantHt,
    tauxTva: 20,
    montantTva,
    statut: "EMISE",
    clientNom: isCorp ? "Société Atlas Trans" : "Karim El Amrani",
    dateEmission: formatDate("15/01/2026"),
    abonnementReference: `ABO-2026-00000${id}`,
    paiementReference: `PAY-2026-00000${id}`,
    paiementId: id,
    genereePar: "Superviseur Nadia",
  };
}

export interface CreerFacturePayload {
  clientNom: string;
  abonnementReference: string;
  montantTtc: number;
  montantAbonnementTtc?: number;
  fraisCarteRfid?: number;
  paiementReference?: string;
  paiementId?: number;
  genereePar?: string;
  modePaiement?: "ESPECES" | "CHEQUE";
  libellePrestation?: string;
}

export async function creerFactureMock(payload: CreerFacturePayload): Promise<FactureDetail> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const newId = mockFactures.length + 1;
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const numero = `FACT-RRM-${now.getFullYear()}-${String(newId).padStart(6, "0")}`;

  const fraisCarteRfid = payload.fraisCarteRfid !== undefined ? payload.fraisCarteRfid : 50;
  const montantTtc = payload.montantTtc;
  const montantAbonnementTtc = payload.montantAbonnementTtc || (montantTtc - fraisCarteRfid);

  const montantHt = Math.round((montantTtc / 1.2) * 100) / 100;
  const montantTva = Math.round((montantTtc - montantHt) * 100) / 100;

  const newFacture: FactureDetail = {
    id: newId,
    numero,
    montantTtc,
    montantAbonnementTtc,
    fraisCarteRfid,
    nombreCartes: fraisCarteRfid > 0 ? (fraisCarteRfid >= 50 ? Math.floor(fraisCarteRfid / 50) : 1) : 0,
    montantHt,
    tauxTva: 20,
    montantTva,
    statut: "EMISE",
    clientNom: payload.clientNom,
    dateEmission: dateFormatted,
    abonnementReference: payload.abonnementReference,
    paiementReference: payload.paiementReference || `PAY-2026-${String(newId).padStart(6, "0")}`,
    paiementId: payload.paiementId || newId,
    modePaiement: payload.modePaiement || "ESPECES",
    libellePrestation: payload.libellePrestation || "Règlement Abonnement de Stationnement",
    genereePar: payload.genereePar || "Superviseur Exploitation",
  };

  mockFactures.unshift(newFacture);

  return newFacture;
}

export async function getFacturesByAbonnementRefMock(abonnementReference: string): Promise<FactureDetail[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (!abonnementReference) return [];
  const refClean = abonnementReference.trim().toUpperCase();
  return mockFactures.filter((f) => f.abonnementReference?.trim().toUpperCase() === refClean);
}

export async function signerFactureMock(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockFactures.find((f) => f.id === id);
  if (found) {
    found.statut = "SIGNEE";
    found.signeePar = "M. Samir El Amrani (Directeur Exploitation)";
    found.dateSignature = formatDate(new Date().toISOString());
  }
}