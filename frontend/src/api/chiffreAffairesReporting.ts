import apiClient from "./client";

export type TypeAbonnementReporting = "TOUS" | "REGULIER" | "CORPORATE";

export interface ChiffreAffairesFilters {
  dateDebut?: string;
  dateFin?: string;
  annee?: number;
  mois?: number;
  parkingId?: number;
  typeAbonnement?: TypeAbonnementReporting;
}

export interface ChiffreAffairesFiltresAppliques {
  dateDebut: string;
  dateFin: string;
  dateDebutPrecedente: string;
  dateFinPrecedente: string;
  annee: number | null;
  mois: number | null;
  parkingId: number | null;
  typeAbonnement: TypeAbonnementReporting;
}

export interface ChiffreAffairesSynthese {
  caActuelHt: number;
  caPrecedentHt: number;
  evolutionPourcentage: number | null;
  caAnnuelHt: number;
  caRegulierHt: number;
  caCorporateHt: number;
  totalGeneralHt: number;
  partRegulierPourcentage: number;
  partCorporatePourcentage: number;
}

export interface ChiffreAffairesMensuel {
  annee: number;
  mois: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  chiffreAffairesHt: number;
}

export interface ChiffreAffairesParking {
  parkingId: number;
  parkingNom: string;
  chiffreAffairesHt: number;
  partPourcentage: number;
}

export interface ChiffreAffairesDashboardResponse {
  filtres: ChiffreAffairesFiltresAppliques;
  synthese: ChiffreAffairesSynthese;
  douzeDerniersMois: ChiffreAffairesMensuel[];
  repartitionParParking: ChiffreAffairesParking[];
}

export async function getChiffreAffairesDashboard(
  filters: ChiffreAffairesFilters,
): Promise<ChiffreAffairesDashboardResponse> {
  const response = await apiClient.get<ChiffreAffairesDashboardResponse>(
    "/reporting/chiffre-affaires/dashboard",
    { params: filters },
  );

  return response.data;
}
