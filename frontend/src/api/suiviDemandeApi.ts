import client from "./client";
import type { ModificationDemandeReguliereRequest, StatutDemande } from "../features/demandes/types";

export interface SuiviDemande {
  reference: string;
  typeDemande: string;
  statut: StatutDemande;
  dateCreation: string;
  clientNom: string | null;
  nom: string | null;
  prenom: string | null;
  cin: string | null;
  email: string | null;
  telephone: string | null;
  immatriculation: string | null;
  marque: string | null;
  modele: string | null;
  couleur: string | null;
  typeVehicule: "VOITURE" | "MOTO" | "AUTRE" | null;
  parkingId: number | null;
  parkingNom: string | null;
  tarifParkingId: number | null;
  forfaitNom: string | null;
  dureeMois: number | null;
  montantTotalTTC: number | null;
  modePaiement: "ESPECE" | "CHEQUE" | null;
  piecesJointes: string[];
  modifiable: boolean;
}

export type PiecesModifiees = Partial<Record<"cinRecto" | "cinVerso" | "carteGriseRecto" | "carteGriseVerso", File>>;

export async function suivreDemande(reference: string): Promise<SuiviDemande> {
  const { data } = await client.post<SuiviDemande>("/public/demandes/suivi", { reference });
  return data;
}

export async function demanderOtpModification(reference: string): Promise<void> {
  await client.post(`/public/demandes/suivi/${encodeURIComponent(reference)}/modification/otp`);
}

export async function enregistrerModification(reference: string, code: string,
  donnees: ModificationDemandeReguliereRequest, fichiers: PiecesModifiees): Promise<SuiviDemande> {
  const formulaire = new FormData();
  formulaire.append("code", code);
  formulaire.append("demande", new Blob([JSON.stringify(donnees)], { type: "application/json" }));
  Object.entries(fichiers).forEach(([nom, fichier]) => { if (fichier) formulaire.append(nom, fichier); });
  const { data } = await client.put<SuiviDemande>(
    `/public/demandes/suivi/${encodeURIComponent(reference)}/modification`, formulaire,
  );
  return data;
}
