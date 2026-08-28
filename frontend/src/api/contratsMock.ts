import type { ContratDetail, ContratListItem } from "../features/contrats/types";
import { formatDate } from "../lib/dateUtils";

export const mockContrats: ContratDetail[] = [
  {
    id: 1,
    reference: "CTR-2026-0001",
    entrepriseNom: "Tech Solutions SARL",
    iceEntreprise: "001524389000045",
    parkingId: 1,
    parkingNom: "Parking Agdal Gare",
    nombrePlaces: 5,
    vehicules: [
      { id: 101, immatriculation: "12345 | أ (A) | 1", marque: "Dacia", modele: "Logan" },
      { id: 102, immatriculation: "67890 | ب (B) | 1", marque: "Peugeot", modele: "208" },
    ],
    dateDebut: "01/01/2026",
    dateFin: "31/12/2045", // Contrat 20 Ans fixe
    montantMensuelHT: 2708,
    montantMensuelTTC: 3250, // 5 places * 650 DH/mois
    statut: "EN_ATTENTE_SIGNATURE",
  },
  {
    id: 2,
    reference: "CTR-2026-0002",
    entrepriseNom: "Maroc Telecom Agency",
    iceEntreprise: "002849102000012",
    parkingId: 2,
    parkingNom: "Parking Hassan II",
    nombrePlaces: 10,
    vehicules: [
      { id: 103, immatriculation: "99887 | ب (B) | 1", marque: "Peugeot", modele: "Boxer" },
    ],
    dateDebut: "01/02/2026",
    dateFin: "31/01/2046", // Contrat 20 Ans fixe
    montantMensuelHT: 5416,
    montantMensuelTTC: 6500, // 10 places * 650 DH/mois
    statut: "SIGNE",
    dateSignature: "28/01/2026",
    signePar: "Mme. Leila Benali (Responsable)",
  },
];

export async function getContratsMock(): Promise<ContratListItem[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          mockContrats.map((c) => ({
            ...c,
            dateDebut: formatDate(c.dateDebut),
            dateFin: formatDate(c.dateFin),
          }))
        ),
      300
    )
  );
}

export async function getContratByIdMock(id: number): Promise<ContratDetail | undefined> {
  const c = mockContrats.find((item) => item.id === id);
  if (!c) return undefined;
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...c,
          dateDebut: formatDate(c.dateDebut),
          dateFin: formatDate(c.dateFin),
          dateSignature: c.dateSignature ? formatDate(c.dateSignature) : undefined,
        }),
      300
    )
  );
}

export async function signerContratMock(id: number): Promise<ContratDetail> {
  const contrat = mockContrats.find((c) => c.id === id);
  if (!contrat) throw new Error("Contrat introuvable");

  contrat.statut = "SIGNE";
  contrat.dateSignature = formatDate(new Date().toISOString());
  contrat.signePar = "Responsable RRM";
  return {
    ...contrat,
    dateDebut: formatDate(contrat.dateDebut),
    dateFin: formatDate(contrat.dateFin),
    dateSignature: formatDate(contrat.dateSignature),
  };
}