import client from "./client";

export type StatutRecetteReelle = "BROUILLON" | "TRANSMISE" | "RECUE" | "RECUE_AVEC_RESERVES" | "ANNULEE";
export interface ParkingRecette { id: number; nom: string }
export interface PaiementDisponible {
  id: number; reference: string; clientNom: string; referenceAbonnement: string | null;
  numeroFacture: string | null; modePaiement: "ESPECE" | "CHEQUE";
  numeroCheque: string | null; banqueCheque: string | null; montant: number;
  datePaiement: string; typeAbonnement: string; observation: string;
}
export interface LigneRecette {
  id: number; paiementId: number; referencePaiement: string; numeroFacture: string | null;
  referenceAbonnement: string | null; clientNom: string; modePaiement: "ESPECE" | "CHEQUE";
  numeroCheque: string | null; banqueCheque: string | null; typeAbonnement: string;
  dateDebutAbonnement: string | null; dateFinAbonnement: string | null;
  venteCarte: boolean; montant: number; datePaiement: string; observation: string;
}
export interface Recette {
  id: number; reference: string; parkingId: number; parkingNom: string; dateArret: string;
  periodeDu: string | null; periodeAu: string | null;
  dateCreation: string; dateTransmission: string | null; dateReception: string | null;
  statut: StatutRecetteReelle; superviseurNom: string; comptableNom: string | null;
  totalEspeces: number; totalCheques: number; total: number;
  nombrePaiements: number; nombreEspeces: number; nombreCheques: number;
  montantEspecesRecu: number | null; montantChequesRecu: number | null;
  nombreChequesRecus: number | null; observationReception: string | null;
  accuseNumero: string | null; lignes: LigneRecette[];
}
export const listerRecettes = async (): Promise<Recette[]> => (await client.get<Recette[]>("/recettes")).data;
export const detailRecette = async (id: number): Promise<Recette> => (await client.get<Recette>(`/recettes/${id}`)).data;
export const parkingsRecettes = async (): Promise<ParkingRecette[]> => (await client.get<ParkingRecette[]>("/recettes/parkings")).data;
export const paiementsDisponibles = async (parkingId: number, dateArret: string): Promise<PaiementDisponible[]> =>
  (await client.get<PaiementDisponible[]>("/recettes/paiements-disponibles", { params: { parkingId, dateArret } })).data;
export const creerRecette = async (input: { parkingId: number; dateArret: string; paiementIds: number[] }): Promise<Recette> =>
  (await client.post<Recette>("/recettes", input)).data;
export const transmettreRecette = async (id: number): Promise<Recette> => (await client.post<Recette>(`/recettes/${id}/transmettre`)).data;
export const annulerRecette = async (id: number): Promise<Recette> => (await client.post<Recette>(`/recettes/${id}/annuler`)).data;
export const receptionnerRecette = async (id: number, input: { montantEspecesRecu: number; montantChequesRecu: number; nombreChequesRecus: number; observation: string }): Promise<Recette> =>
  (await client.post<Recette>(`/recettes/${id}/receptionner`, input)).data;
export async function telechargerDocumentRecette(id: number, type: "excel" | "accuse", reference: string) {
  const response = await client.get<Blob>(`/recettes/${id}/${type}`, {
    responseType: "blob", params: { t: Date.now() },
  });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${type === "excel" ? "recette" : "accuse"}-${reference}.${type === "excel" ? "xlsx" : "pdf"}`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
