export type StatutContrat = "EN_ATTENTE_SIGNATURE" | "SIGNE" | "RESILIE" | "EXPIRE";

export interface VehiculeContrat {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
}

export interface ContratListItem {
  dateDebut: string;
  parkingId: number;
  id: number;
  reference: string;
  entrepriseNom: string;
  parkingNom: string;
  nombrePlaces: number;
  montantMensuelTTC: number;
  statut: StatutContrat;
}

export interface ContratDetail extends ContratListItem {
  iceEntreprise: string;
  parkingId: number;
  vehicules: VehiculeContrat[];
  dateDebut: string;
  dateFin: string;
  montantMensuelHT: number;
  dateSignature?: string;
  signePar?: string;
  pdfUrl?: string;
}