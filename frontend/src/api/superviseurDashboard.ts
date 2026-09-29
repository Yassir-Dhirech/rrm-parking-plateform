import client from "./client";

export interface SuperviseurParking {
  id: number; code: string; nom: string; adresse: string;
  latitude: string | null; longitude: string | null; statut: string;
  quotaAbonnements: number; placesOccupees: number; placesLibres: number;
  abonnementsReguliersActifs: number; contratsCorporateActifs: number;
  placesCorporateReservees: number; actionsCartesEnAttente: number;
  demandesAValider: number;
}

export interface SuperviseurArrete {
  id: number; reference: string; parkingId: number; parkingNom: string;
  dateArret: string; statut: string; nombrePaiements: number;
}

export interface SuperviseurAction {
  type: "DEMANDE" | "IMPRESSION" | "ACTIVATION" | "DESACTIVATION" | "RECETTE";
  id: number; reference: string; parkingId: number; parkingNom: string; depuis: string | null;
  libelle: string; chemin: string;
}

export interface SuperviseurDashboardData {
  dateDebut: string; dateFin: string; actualiseLe: string;
  actionsCartesEnAttente: number; arretesEffectues: number;
  demandesAValider: number; parkingsAffectes: number;
  abonnementsReguliersActifs: number; contratsCorporateActifs: number;
  placesCorporateReservees: number;
  parkings: SuperviseurParking[]; arretes: SuperviseurArrete[];
  actions: SuperviseurAction[];
}

export async function getSuperviseurDashboard(debut: string, fin: string): Promise<SuperviseurDashboardData> {
  return (await client.get<SuperviseurDashboardData>("/superviseur/dashboard", {
    params: { debut, fin },
  })).data;
}
