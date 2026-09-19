import type { RecetteHebdoDetail, RecetteHebdoListItem } from "../features/recettes/types";
import { formatDate } from "../lib/dateUtils";

export const mockRecettes: RecetteHebdoDetail[] = [
  {
    id: 1,
    reference: "REC-2026-09-12-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    dateRecette: "12/09/2026",
    semaineAnnee: "Arrêté du 12/09/2026",
    dateDebut: "12/09/2026",
    dateFin: "12/09/2026",
    totalHebdo: 48500,
    totalEspeces: 20000,
    totalCheques: 18000,
    totalCarte: 9500,
    nombreCheques: 3,
    statut: "RECEIVED",
    superviseurNom: "M. Samir El Amrani",
    validePar: "M. Samir El Amrani (Superviseur)",
    dateValidation: "12/09/2026",
    transmisPar: "M. Samir El Amrani (Bordereau #BD-2026-083)",
    dateTransmission: "12/09/2026 10:30",
    comptableNom: "Mme. Fatine Chraibi (Comptabilité RRM)",
    dateEncaissementComptable: "12/09/2026 14:45",
    quittanceNumero: "QUIT-2026-00481",
    commentaires: "Versement de 20 000 MAD en espèces et 3 chèques physiques (18 000 MAD) réceptionné et confirmé par la comptabilité.",
    detailJours: [
      { date: "12/09/2026", montantEspeces: 20000, montantCheque: 18000, montantCarte: 9500, totalJournee: 48500, nombreTransactions: 56 },
    ],
    chequesRemis: [
      { id: 1, referencePaiement: "PAI-2026-0812", numeroCheque: "CHQ-0019283", banque: "Attijariwafa Bank", emetteur: "Société Atlas Trans SARL", montant: 6000, datePaiement: "12/09/2026" },
      { id: 2, referencePaiement: "PAI-2026-0834", numeroCheque: "CHQ-8820192", banque: "BMCE Bank", emetteur: "Société Rabat Logistique", montant: 7200, datePaiement: "12/09/2026" },
      { id: 3, referencePaiement: "PAI-2026-0855", numeroCheque: "CHQ-4459102", banque: "Banque Populaire", emetteur: "Imprimerie Agdal", montant: 4800, datePaiement: "12/09/2026" },
    ],
  },
  {
    id: 2,
    reference: "REC-2026-09-11-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    dateRecette: "11/09/2026",
    semaineAnnee: "Arrêté du 11/09/2026",
    dateDebut: "11/09/2026",
    dateFin: "11/09/2026",
    totalHebdo: 32400,
    totalEspeces: 12400,
    totalCheques: 12000,
    totalCarte: 8000,
    nombreCheques: 2,
    statut: "COMPLETED",
    superviseurNom: "M. Samir El Amrani",
    validePar: "M. Samir El Amrani",
    dateValidation: "11/09/2026",
    transmisPar: "M. Samir El Amrani (Bordereau #BD-2026-089)",
    dateTransmission: "11/09/2026 17:15",
    commentaires: "Recette arrêtée au 11/09/2026 par le superviseur et transmise à la comptabilité. 12 400 DH liquide + 2 chèques physiques.",
    detailJours: [
      { date: "11/09/2026", montantEspeces: 12400, montantCheque: 12000, montantCarte: 8000, totalJournee: 32400, nombreTransactions: 38 },
    ],
    chequesRemis: [
      { id: 10, referencePaiement: "PAI-2026-0888", numeroCheque: "CHQ-7712039", banque: "CIH Bank", emetteur: "Tech Solutions SARL", montant: 6000, datePaiement: "11/09/2026" },
      { id: 11, referencePaiement: "PAI-2026-0899", numeroCheque: "CHQ-3310492", banque: "Société Générale", emetteur: "Cabinet Benali & Associés", montant: 6000, datePaiement: "11/09/2026" },
    ],
  },
  {
    id: 3,
    reference: "REC-2026-09-10-P02",
    parkingNom: "Parking Hassan II",
    parkingId: 2,
    dateRecette: "10/09/2026",
    semaineAnnee: "Arrêté du 10/09/2026",
    dateDebut: "10/09/2026",
    dateFin: "10/09/2026",
    totalHebdo: 24500,
    totalEspeces: 14500,
    totalCheques: 10000,
    totalCarte: 0,
    nombreCheques: 1,
    statut: "EN_COURS",
    superviseurNom: "M. Youssef Tazi",
    detailJours: [
      { date: "10/09/2026", montantEspeces: 14500, montantCheque: 10000, montantCarte: 0, totalJournee: 24500, nombreTransactions: 28 },
    ],
    chequesRemis: [
      { id: 20, referencePaiement: "PAI-2026-0910", numeroCheque: "CHQ-5591028", banque: "Attijariwafa Bank", emetteur: "Maroc Telecom Agency", montant: 10000, datePaiement: "10/09/2026" },
    ],
  },
];

export async function getRecettesMock(): Promise<RecetteHebdoListItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockRecettes.map((r) => ({
    ...r,
    dateRecette: formatDate(r.dateRecette || r.dateDebut),
    dateDebut: formatDate(r.dateDebut),
    dateFin: formatDate(r.dateFin),
  }))), 300));
}

export async function getRecetteByIdMock(id: number): Promise<RecetteHebdoDetail | undefined> {
  const r = mockRecettes.find((item) => item.id === id);
  if (!r) return undefined;
  return new Promise((resolve) =>
    setTimeout(() => resolve({
      ...r,
      dateRecette: formatDate(r.dateRecette || r.dateDebut),
      dateDebut: formatDate(r.dateDebut),
      dateFin: formatDate(r.dateFin),
      dateValidation: r.dateValidation ? formatDate(r.dateValidation) : undefined,
      dateTransmission: r.dateTransmission ? formatDate(r.dateTransmission) : undefined,
      dateEncaissementComptable: r.dateEncaissementComptable ? formatDate(r.dateEncaissementComptable) : undefined,
      detailJours: r.detailJours.map((j) => ({ ...j, date: formatDate(j.date) })),
    }), 300)
  );
}

export async function markRecetteAsCompletedMock(id: number): Promise<RecetteHebdoDetail> {
  const recette = mockRecettes.find((r) => r.id === id);
  if (!recette) throw new Error("Recette introuvable");
  recette.statut = "COMPLETED";
  recette.validePar = "Superviseur RRM";
  recette.transmisPar = "Superviseur RRM (Bordereau #BD-" + Math.floor(100 + Math.random() * 900) + ")";
  recette.dateValidation = formatDate(new Date().toISOString());
  recette.dateTransmission = formatDate(new Date().toISOString());
  return recette;
}

export async function markRecetteAsReceivedMock(id: number): Promise<RecetteHebdoDetail> {
  const recette = mockRecettes.find((r) => r.id === id);
  if (!recette) throw new Error("Recette introuvable");
  recette.statut = "RECEIVED";
  recette.comptableNom = "Service Financier & Comptabilité RRM";
  recette.dateEncaissementComptable = formatDate(new Date().toISOString());
  recette.quittanceNumero = "QUIT-2026-" + String(Math.floor(Math.random() * 90000) + 10000);
  return recette;
}

export interface PaiementAEncasserRecette {
  id: number;
  referencePaiement: string;
  parkingId: number;
  parkingNom: string;
  clientNom: string;
  modePaiement: "ESPECES" | "CHEQUE" | "CARTE";
  montant: number;
  datePaiement: string;
  numeroCheque?: string;
  banque?: string;
}

export const mockPaiementsNonEncaisses: PaiementAEncasserRecette[] = [
  { id: 101, referencePaiement: "PAY-2026-00091", parkingId: 1, parkingNom: "Parking Agdal Gare", clientNom: "Karim El Amrani", modePaiement: "ESPECES", montant: 600, datePaiement: "18/08/2026" },
  { id: 102, referencePaiement: "PAY-2026-00092", parkingId: 1, parkingNom: "Parking Agdal Gare", clientNom: "Société Atlas Trans SARL", modePaiement: "CHEQUE", montant: 6000, datePaiement: "18/08/2026", numeroCheque: "CHQ-9912019", banque: "Attijariwafa Bank" },
  { id: 103, referencePaiement: "PAY-2026-00093", parkingId: 1, parkingNom: "Parking Agdal Gare", clientNom: "Sara Bennis", modePaiement: "ESPECES", montant: 1200, datePaiement: "19/08/2026" },
  { id: 104, referencePaiement: "PAY-2026-00094", parkingId: 1, parkingNom: "Parking Agdal Gare", clientNom: "Imprimerie Agdal", modePaiement: "CHEQUE", montant: 4800, datePaiement: "19/08/2026", numeroCheque: "CHQ-5520192", banque: "Banque Populaire" },
  { id: 105, referencePaiement: "PAY-2026-00095", parkingId: 1, parkingNom: "Parking Agdal Gare", clientNom: "Youssef Tazi", modePaiement: "ESPECES", montant: 300, datePaiement: "20/08/2026" },
  
  { id: 201, referencePaiement: "PAY-2026-00096", parkingId: 2, parkingNom: "Parking Hassan II", clientNom: "Maroc Telecom Agency", modePaiement: "CHEQUE", montant: 7200, datePaiement: "18/08/2026", numeroCheque: "CHQ-1102938", banque: "BMCE Bank" },
  { id: 202, referencePaiement: "PAY-2026-00097", parkingId: 2, parkingNom: "Parking Hassan II", clientNom: "Omar Bennani", modePaiement: "ESPECES", montant: 1500, datePaiement: "19/08/2026" },
  
  { id: 301, referencePaiement: "PAY-2026-00098", parkingId: 3, parkingNom: "Parking Bab El Had", clientNom: "Cabinet Benali", modePaiement: "ESPECES", montant: 1800, datePaiement: "20/08/2026" },
];

export async function getPaiementsAEncasserMock(parkingId?: number): Promise<PaiementAEncasserRecette[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!parkingId) resolve(mockPaiementsNonEncaisses);
      else resolve(mockPaiementsNonEncaisses.filter((p) => p.parkingId === parkingId));
    }, 200);
  });
}

export async function creerRecetteSupervisorMock(input: {
  parkingId: number;
  parkingNom: string;
  dateRecette?: string;
  semaineAnnee?: string;
  paiementsChoisis: PaiementAEncasserRecette[];
}): Promise<RecetteHebdoDetail> {
  const totalEspeces = input.paiementsChoisis.filter(p => p.modePaiement === "ESPECES").reduce((a, b) => a + b.montant, 0);
  const chequesPaiements = input.paiementsChoisis.filter(p => p.modePaiement === "CHEQUE");
  const totalCheques = chequesPaiements.reduce((a, b) => a + b.montant, 0);
  const totalHebdo = totalEspeces + totalCheques;
  const targetDate = input.dateRecette || formatDate(new Date().toISOString());
  const dateSuffix = targetDate.replace(/\//g, "-");

  const newRecette: RecetteHebdoDetail = {
    id: mockRecettes.length + 1,
    reference: `REC-${dateSuffix}-P0${input.parkingId}`,
    parkingId: input.parkingId,
    parkingNom: input.parkingNom,
    dateRecette: targetDate,
    semaineAnnee: `Arrêté du ${targetDate}`,
    dateDebut: targetDate,
    dateFin: targetDate,
    totalHebdo,
    totalEspeces,
    totalCheques,
    totalCarte: 0,
    nombreCheques: chequesPaiements.length,
    statut: "COMPLETED",
    superviseurNom: "M. Samir El Amrani (Superviseur)",
    validePar: "M. Samir El Amrani (Superviseur)",
    dateValidation: targetDate,
    transmisPar: "M. Samir El Amrani (Bordereau #BD-" + Math.floor(100 + Math.random() * 900) + ")",
    dateTransmission: targetDate,
    detailJours: [
      {
        date: targetDate,
        montantEspeces: totalEspeces,
        montantCheque: totalCheques,
        montantCarte: 0,
        totalJournee: totalHebdo,
        nombreTransactions: input.paiementsChoisis.length,
      }
    ],
    chequesRemis: chequesPaiements.map((c, idx) => ({
      id: idx + 100,
      referencePaiement: c.referencePaiement,
      numeroCheque: c.numeroCheque || `CHQ-${100000 + idx}`,
      banque: c.banque || "Attijariwafa Bank",
      emetteur: c.clientNom,
      montant: c.montant,
      datePaiement: c.datePaiement,
    })),
  };

  mockRecettes.unshift(newRecette);
  return newRecette;
}

export interface RejeterChequeInput {
  recetteId: number;
  chequeId: number;
  motifRejet: string;
}

export async function rejeterChequeEtSuspendreCarteMock({
  recetteId,
  chequeId,
  motifRejet,
}: RejeterChequeInput): Promise<RecetteHebdoDetail> {
  const recette = mockRecettes.find((r) => r.id === recetteId);
  if (!recette) throw new Error("Recette introuvable");

  const cheque = recette.chequesRemis.find((c) => c.id === chequeId);
  if (!cheque) throw new Error("Chèque introuvable");

  cheque.statut = "REJETE";
  cheque.motifRejet = motifRejet;
  cheque.dateRejet = formatDate(new Date().toISOString());

  return recette;
}