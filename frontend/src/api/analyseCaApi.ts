import apiClient from "./client";

export interface ParkingAnalyseCa {
  id: number;
  nom: string;
}

export interface MontantParkingCa {
  parkingId: number;
  montantHt: number;
}

export interface AnalyseCaPeriode {
  dateDebut: string;
  dateFin: string;
  totalHt: number;
  parkings: ParkingAnalyseCa[];
  montants: MontantParkingCa[];
}

export interface AnalyseCaMois {
  numero: number;
  libelle: string;
  aVenir: boolean;
  totalHt: number;
  montants: MontantParkingCa[];
}

export interface AnalyseCaAnnee {
  annee: number;
  parkings: ParkingAnalyseCa[];
  mois: AnalyseCaMois[];
}

export type TableauxExportCa = "PERIODE" | "MENSUEL" | "DEUX";

export async function obtenirAnalysePeriode(dateDebut: string, dateFin: string) {
  const { data } = await apiClient.get<AnalyseCaPeriode>("/comptable/analyse-ca/periode", {
    params: { dateDebut, dateFin },
  });
  return data;
}

export async function obtenirAnalyseMensuelle(annee: number) {
  const { data } = await apiClient.get<AnalyseCaAnnee>("/comptable/analyse-ca/mensuel", {
    params: { annee },
  });
  return data;
}

export async function telechargerAnalyseExcel(
  dateDebut: string, dateFin: string, annee: number, tableaux: TableauxExportCa,
) {
  const { data } = await apiClient.get<Blob>("/comptable/analyse-ca/excel", {
    params: { ...(tableaux === "MENSUEL" ? {} : { dateDebut, dateFin }), annee, tableaux },
    responseType: "blob",
  });
  return data;
}
