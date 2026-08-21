import type { RecetteHebdoDetail, RecetteHebdoListItem } from "../features/recettes/types";
import { formatDate } from "../lib/dateUtils";

export const mockRecettes: RecetteHebdoDetail[] = [
  {
    id: 1,
    reference: "REC-2026-W31-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    semaineAnnee: "Semaine 31 (2026)",
    dateDebut: "27/07/2026",
    dateFin: "02/08/2026",
    totalHebdo: 48500,
    statut: "VALIDEE_SUPERVISEUR",
    validePar: "M. El Amrani (Superviseur)",
    dateValidation: "03/08/2026",
    detailJours: [
      { date: "27/07/2026", montantEspeces: 3000, montantCarte: 4000, montantVirement: 0, totalJournee: 7000, nombreTransactions: 24 },
      { date: "28/07/2026", montantEspeces: 2500, montantCarte: 3500, montantVirement: 0, totalJournee: 6000, nombreTransactions: 19 },
      { date: "29/07/2026", montantEspeces: 4000, montantCarte: 3000, montantVirement: 1000, totalJournee: 8000, nombreTransactions: 28 },
      { date: "30/07/2026", montantEspeces: 2000, montantCarte: 5000, montantVirement: 0, totalJournee: 7000, nombreTransactions: 22 },
      { date: "31/07/2026", montantEspeces: 3500, montantCarte: 4500, montantVirement: 0, totalJournee: 8000, nombreTransactions: 30 },
      { date: "01/08/2026", montantEspeces: 3000, montantCarte: 3500, montantVirement: 0, totalJournee: 6500, nombreTransactions: 21 },
      { date: "02/08/2026", montantEspeces: 2000, montantCarte: 4000, montantVirement: 0, totalJournee: 6000, nombreTransactions: 18 },
    ],
  },
  {
    id: 2,
    reference: "REC-2026-W32-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    semaineAnnee: "Semaine 32 (2026)",
    dateDebut: "03/08/2026",
    dateFin: "09/08/2026",
    totalHebdo: 32400,
    statut: "EN_COURS",
    detailJours: [
      { date: "03/08/2026", montantEspeces: 2200, montantCarte: 3800, montantVirement: 0, totalJournee: 6000, nombreTransactions: 20 },
      { date: "04/08/2026", montantEspeces: 1800, montantCarte: 4200, montantVirement: 0, totalJournee: 6000, nombreTransactions: 21 },
      { date: "05/08/2026", montantEspeces: 3100, montantCarte: 2900, montantVirement: 0, totalJournee: 6000, nombreTransactions: 19 },
      { date: "06/08/2026", montantEspeces: 2500, montantCarte: 3900, montantVirement: 800, totalJournee: 7200, nombreTransactions: 25 },
      { date: "07/08/2026", montantEspeces: 2800, montantCarte: 4400, montantVirement: 0, totalJournee: 7200, nombreTransactions: 26 },
    ],
  },
];

export async function getRecettesMock(): Promise<RecetteHebdoListItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockRecettes.map((r) => ({
    ...r,
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
      dateDebut: formatDate(r.dateDebut),
      dateFin: formatDate(r.dateFin),
      dateValidation: r.dateValidation ? formatDate(r.dateValidation) : undefined,
      detailJours: r.detailJours.map((j) => ({ ...j, date: formatDate(j.date) })),
    }), 300)
  );
}

export async function validerRecetteMock(id: number): Promise<RecetteHebdoDetail> {
  const recette = mockRecettes.find((r) => r.id === id);
  if (!recette) throw new Error("Recette introuvable");
  recette.statut = "VALIDEE_SUPERVISEUR";
  recette.validePar = "Superviseur RRM";
  recette.dateValidation = formatDate(new Date().toISOString());
  return recette;
}