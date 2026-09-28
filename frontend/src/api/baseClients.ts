import client from "./client";

export type StatutClient = "ACTIF" | "ARCHIVE";

export interface PageClients<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
}

interface ClientCommun {
  id: number;
  email: string | null;
  telephone: string | null;
  statut: StatutClient;
  dateCreation: string;
}

export interface ClientRegulierListe extends ClientCommun {
  nomComplet: string;
  cin: string;
}

export interface ClientCorporateListe extends ClientCommun {
  raisonSociale: string;
  ice: string;
}

export interface VehiculeClient {
  id: number;
  immatriculation: string;
  marque: string | null;
  modele: string | null;
  couleur: string | null;
  type: string;
  statut: string;
}

export interface PeriodeClient {
  numero: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  prixHT: number;
}

export interface AffectationClient {
  parkingId: number;
  parkingNom: string;
  dateDebut: string;
  dateFin: string | null;
}

export interface AbonnementClient {
  id: number;
  reference: string;
  statut: string;
  dateCreation: string;
  periodes: PeriodeClient[];
  affectations: AffectationClient[];
}

export interface DemandeClient {
  reference: string;
  statut: string;
  canalInitiation: string;
  dateCreation: string;
  dateSoumission: string | null;
}

export interface ClientRegulierDetail extends ClientCommun {
  nom: string;
  prenom: string;
  cin: string;
  dateModification: string;
  vehicules: VehiculeClient[];
  abonnements: AbonnementClient[];
  demandes: DemandeClient[];
}

export interface ContratClient {
  id: number;
  reference: string;
  statut: string;
  nombrePlaces: number;
  dateCreation: string;
  dateDebut: string | null;
  dateFin: string | null;
  abonnementReference: string | null;
  abonnementStatut: string | null;
}

export interface ClientCorporateDetail extends ClientCommun {
  raisonSociale: string;
  ice: string;
  numeroRC: string | null;
  adresseSiege: string;
  nomContactPrincipal: string | null;
  prenomContactPrincipal: string | null;
  fonctionContactPrincipal: string | null;
  dateModification: string;
  vehicules: VehiculeClient[];
  contrats: ContratClient[];
  demandes: DemandeClient[];
}

export interface FiltresBaseClients {
  recherche: string;
  statut: StatutClient | "";
  dateDebut: string;
  dateFin: string;
  page: number;
}

function params(filtres: FiltresBaseClients) {
  return {
    ...(filtres.recherche.trim() && { recherche: filtres.recherche.trim() }),
    ...(filtres.statut && { statut: filtres.statut }),
    ...(filtres.dateDebut && { dateDebut: filtres.dateDebut }),
    ...(filtres.dateFin && { dateFin: filtres.dateFin }),
    page: filtres.page,
    taille: 12,
  };
}

export async function listerClientsReguliers(filtres: FiltresBaseClients) {
  const response = await client.get<PageClients<ClientRegulierListe>>(
    "/responsable/clients/reguliers", { params: params(filtres) });
  return response.data;
}

export async function listerClientsCorporate(filtres: FiltresBaseClients) {
  const response = await client.get<PageClients<ClientCorporateListe>>(
    "/responsable/clients/corporate", { params: params(filtres) });
  return response.data;
}

export async function consulterClientRegulier(id: number) {
  const response = await client.get<ClientRegulierDetail>(`/responsable/clients/reguliers/${id}`);
  return response.data;
}

export async function consulterClientCorporate(id: number) {
  const response = await client.get<ClientCorporateDetail>(`/responsable/clients/corporate/${id}`);
  return response.data;
}
