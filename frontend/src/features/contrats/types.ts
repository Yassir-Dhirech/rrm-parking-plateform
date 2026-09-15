export type StatutContrat = "EN_ATTENTE_SIGNATURE" | "SIGNE" | "RESILIE" | "EXPIRE";

export interface ContratScanInfo {
  scanne: boolean;
  dateScan?: string;
  scannePar?: string;
  nomFichier?: string;
  tailleFichier?: string;
  nombrePages?: number;
  referenceParapheur?: string;
  scanUrl?: string;
  notesScan?: string;
}

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
  scanInfo?: ContratScanInfo;
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
  referencePhysique?: string;
  observations?: string;
  pdfUrl?: string;
  scanInfo?: ContratScanInfo;
}