import type{ RecetteHebdoDetail, RecetteHebdoListItem } from "../features/recettes/types";

export const mockRecettes: RecetteHebdoDetail[] = [
  {
    id: 1,
    reference: "REC-2026-W31-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    semaineAnnee: "Semaine 31 (2026)",
    dateDebut: "2026-07-27",
    dateFin: "2026-08-02",
    totalHebdo: 48500,
    statut: "VALIDEE_SUPERVISEUR",
    validePar: "M. El Amrani (Superviseur)",
    dateValidation: "2026-08-03",
    detailJours: [
      { date: "2026-07-27", montantEspeces: 3000, montantCarte: 4000, montantVirement: 0, totalJournee: 7000, nombreTransactions: 24 },
      { date: "2026-07-28", montantEspeces: 2500, montantCarte: 3500, montantVirement: 0, totalJournee: 6000, nombreTransactions: 19 },
      { date: "2026-07-29", montantEspeces: 4000, montantCarte: 3000, montantVirement: 1000, totalJournee: 8000, nombreTransactions: 28 },
      { date: "2026-07-30", montantEspeces: 2000, montantCarte: 5000, montantVirement: 0, totalJournee: 7000, nombreTransactions: 22 },
      { date: "2026-07-31", montantEspeces: 3500, montantCarte: 4500, montantVirement: 0, totalJournee: 8000, nombreTransactions: 30 },
      { date: "2026-08-01", montantEspeces: 3000, montantCarte: 3500, montantVirement: 0, totalJournee: 6500, nombreTransactions: 21 },
      { date: "2026-08-02", montantEspeces: 2000, montantCarte: 4000, montantVirement: 0, totalJournee: 6000, nombreTransactions: 18 },
    ],
  },
  {
    id: 2,
    reference: "REC-2026-W32-P01",
    parkingNom: "Parking Agdal Gare",
    parkingId: 1,
    semaineAnnee: "Semaine 32 (2026)",
    dateDebut: "2026-08-03",
    dateFin: "2026-08-09",
    totalHebdo: 32400,
    statut: "EN_COURS",
    detailJours: [
      { date: "2026-08-03", montantEspeces: 2200, montantCarte: 3800, montantVirement: 0, totalJournee: 6000, nombreTransactions: 20 },
      { date: "2026-08-04", montantEspeces: 1800, montantCarte: 4200, montantVirement: 0, totalJournee: 6000, nombreTransactions: 21 },
      { date: "2026-08-05", montantEspeces: 3100, montantCarte: 2900, montantVirement: 0, totalJournee: 6000, nombreTransactions: 19 },
      { date: "2026-08-06", montantEspeces: 2500, montantCarte: 3900, montantVirement: 800, totalJournee: 7200, nombreTransactions: 25 },
      { date: "2026-08-07", montantEspeces: 2800, montantCarte: 4400, montantVirement: 0, totalJournee: 7200, nombreTransactions: 26 },
    ],
  },
];

export async function getRecettesMock(): Promise<RecetteHebdoListItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockRecettes), 300));
}

export async function getRecetteByIdMock(id: number): Promise<RecetteHebdoDetail | undefined> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockRecettes.find((r) => r.id === id)), 300)
  );
}

export async function validerRecetteMock(id: number): Promise<RecetteHebdoDetail> {
  const recette = mockRecettes.find((r) => r.id === id);
  if (!recette) throw new Error("Recette introuvable");
  recette.statut = "VALIDEE_SUPERVISEUR";
  recette.validePar = "Superviseur RRM";
  recette.dateValidation = new Date().toISOString().split("T")[0];
  return recette;
}