import type { ContratDetail, ContratListItem, ContratScanInfo } from "../features/contrats/types";
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
    referencePhysique: "PARAPH-CTR-2026-0001",
    scanInfo: undefined, // Non encore scanné
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
    referencePhysique: "PARAPH-CTR-2026-0002",
    scanInfo: {
      scanne: true,
      dateScan: "28/01/2026",
      scannePar: "Mme. Leila Benali (Responsable RRM)",
      nomFichier: "CONTRAT_SIGNE_MAROC_TELECOM_20ANS.pdf",
      tailleFichier: "2.5 Mo",
      nombrePages: 4,
      referenceParapheur: "PARAPH-CTR-2026-0002",
      notesScan: "Original paraphé et tamponné conservé au classeur d'exploitation Rabat.",
    },
  },
  {
    id: 3,
    reference: "CTR-2026-0003",
    entrepriseNom: "Société Atlas Trans",
    iceEntreprise: "002145896300054",
    parkingId: 1,
    parkingNom: "Parking Agdal Gare",
    nombrePlaces: 10,
    vehicules: [
      { id: 104, immatriculation: "54321 | أ (A) | 1", marque: "Renault", modele: "Kangoo" },
      { id: 105, immatriculation: "98765 | د (D) | 1", marque: "Mercedes", modele: "Sprinter" },
    ],
    dateDebut: "01/06/2025",
    dateFin: "01/06/2045", // 20 Ans
    montantMensuelHT: 5416.67,
    montantMensuelTTC: 6500, // 10 abonnements * 650 MAD
    statut: "SIGNE",
    dateSignature: "01/06/2025",
    signePar: "Mme. Leila Benali (Responsable)",
    referencePhysique: "PARAPH-ATLAS-2025-01",
    scanInfo: {
      scanne: true,
      dateScan: "02/06/2025",
      scannePar: "Mme. Leila Benali (Responsable RRM)",
      nomFichier: "CONTRAT_SIGNE_ATLAS_TRANS_20ANS.pdf",
      tailleFichier: "2.8 Mo",
      nombrePages: 4,
      referenceParapheur: "PARAPH-ATLAS-2025-01",
      notesScan: "Convention 20 ans certifiée conforme et archivée dans le parapheur central.",
    },
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

export interface UpdateSituationContratPayload {
  id: number;
  nouveauStatut: ContratDetail["statut"];
  dateSignaturePhysique?: string;
  signataireNom?: string;
  referencePhysique?: string;
  observations?: string;
}

export async function updateSituationContratMock(payload: UpdateSituationContratPayload): Promise<ContratDetail> {
  const contrat = mockContrats.find((c) => c.id === payload.id);
  if (!contrat) throw new Error("Contrat introuvable");

  contrat.statut = payload.nouveauStatut;
  if (payload.nouveauStatut === "SIGNE") {
    contrat.dateSignature = payload.dateSignaturePhysique ? formatDate(payload.dateSignaturePhysique) : formatDate(new Date().toISOString());
    contrat.signePar = payload.signataireNom || "Responsable RRM";
  } else if (payload.nouveauStatut === "EN_ATTENTE_SIGNATURE") {
    contrat.dateSignature = undefined;
    contrat.signePar = undefined;
  }
  if (payload.referencePhysique) contrat.referencePhysique = payload.referencePhysique;
  if (payload.observations) contrat.observations = payload.observations;

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ...contrat,
          dateDebut: formatDate(contrat.dateDebut),
          dateFin: formatDate(contrat.dateFin),
          dateSignature: contrat.dateSignature ? formatDate(contrat.dateSignature) : undefined,
        }),
      300
    )
  );
}

export async function signerContratMock(id: number): Promise<ContratDetail> {
  return updateSituationContratMock({
    id,
    nouveauStatut: "SIGNE",
    signataireNom: "Responsable RRM",
  });
}

export async function enregistrerScanContratMock(
  contratId: number,
  scanInfo: ContratScanInfo
): Promise<ContratDetail> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const contrat = mockContrats.find((c) => c.id === contratId);
  if (!contrat) throw new Error("Contrat introuvable");

  contrat.scanInfo = {
    ...scanInfo,
    dateScan: formatDate(scanInfo.dateScan || new Date().toISOString()),
  };
  if (scanInfo.referenceParapheur) {
    contrat.referencePhysique = scanInfo.referenceParapheur;
  }

  return {
    ...contrat,
    dateDebut: formatDate(contrat.dateDebut),
    dateFin: formatDate(contrat.dateFin),
    dateSignature: contrat.dateSignature ? formatDate(contrat.dateSignature) : undefined,
  };
}

export async function getContratByAbonnementRefMock(
  abonnementRef: string
): Promise<ContratDetail | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!abonnementRef) return undefined;

  // Lier ABO-2026-000002 à Atlas Trans (id: 3)
  if (abonnementRef.includes("000002") || abonnementRef.toUpperCase().includes("ATLAS")) {
    const c = mockContrats.find((item) => item.id === 3 || item.entrepriseNom.includes("Atlas"));
    if (c) {
      return {
        ...c,
        dateDebut: formatDate(c.dateDebut),
        dateFin: formatDate(c.dateFin),
        dateSignature: c.dateSignature ? formatDate(c.dateSignature) : undefined,
      };
    }
  }

  // Par défaut chercher par entreprise ou premier contrat
  const fallback = mockContrats[0];
  return {
    ...fallback,
    dateDebut: formatDate(fallback.dateDebut),
    dateFin: formatDate(fallback.dateFin),
    dateSignature: fallback.dateSignature ? formatDate(fallback.dateSignature) : undefined,
  };
}