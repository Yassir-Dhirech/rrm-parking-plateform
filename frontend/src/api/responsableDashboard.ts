import apiClient from "./client";

export interface ResponsableDashboardKpis {
  dateDebut: string;
  dateFin: string;
  chiffreAffairesHt: number;
  evolutionChiffreAffairesPct: number | null;
  chiffreAffairesDisponible: boolean;
  placesOccupees: number;
  placesReservees: number;
  tauxOccupationPct: number;
  occupationDisponible: boolean;
  abonnementsActifs: number;
  evolutionAbonnementsActifsPct: number | null;
  delaiMoyenTraitementMinutes: number | null;
  evolutionDelaiMoyenPct: number | null;
  delaiDisponible: boolean;
}

export interface ResponsableDashboardKpiParams {
  parkingId?: number | null;
  dateDebut?: string;
  dateFin?: string;
}

export async function getResponsableDashboardKpis(
  params: ResponsableDashboardKpiParams = {},
): Promise<ResponsableDashboardKpis> {
  const response = await apiClient.get<ResponsableDashboardKpis>(
    "/responsable/dashboard/kpis",
    {
      params: {
        parkingId: params.parkingId ?? undefined,
        dateDebut: params.dateDebut,
        dateFin: params.dateFin,
      },
    },
  );

  return response.data;
}


export interface ActiveSubscriptionsByParkingItem {
  parkingId: number;
  parkingNom: string;
  nombreAbonnements: number;
}

export interface ActiveSubscriptionsByParkingResponse {
  dateReference: string;
  totalAbonnements: number;
  parkings: ActiveSubscriptionsByParkingItem[];
}

export async function getActiveSubscriptionsByParking(): Promise<ActiveSubscriptionsByParkingResponse> {
  const response = await apiClient.get<ActiveSubscriptionsByParkingResponse>(
    "/responsable/dashboard/charts/abonnements-actifs-par-parking",
  );

  return response.data;
}


export interface MonthlyRevenueItem {
  mois: number;
  libelle: string;
  chiffreAffairesHt: number;
}

export interface MonthlyRevenueResponse {
  annee: number;
  totalAnnuelHt: number;
  mois: MonthlyRevenueItem[];
}

export async function getMonthlyRevenue(
  annee: number,
): Promise<MonthlyRevenueResponse> {
  const response = await apiClient.get<MonthlyRevenueResponse>(
    "/responsable/dashboard/charts/chiffre-affaires-mensuel",
    {
      params: { annee },
    },
  );

  return response.data;
}


export interface PendingValidationRequestItem {
  id: number;
  reference: string;
  client: string;
  statut: string;
}

export interface PendingValidationResponse {
  total: number;
  demandes: PendingValidationRequestItem[];
}

export async function getPendingValidationRequests(): Promise<PendingValidationResponse> {
  const response = await apiClient.get<PendingValidationResponse>(
    "/responsable/dashboard/demandes-en-attente-validation",
  );

  return response.data;
}

export interface ParkingMixResponse {
  dateReference: string;
  placesRegulieres: number;
  placesCorporate: number;
  totalPlacesActives: number;
  partRegulierPct: number;
  partCorporatePct: number;
}

export async function getParkingMix(): Promise<ParkingMixResponse> {
  const response = await apiClient.get<ParkingMixResponse>(
    "/responsable/dashboard/charts/repartition-places-actives",
  );

  return response.data;
}
