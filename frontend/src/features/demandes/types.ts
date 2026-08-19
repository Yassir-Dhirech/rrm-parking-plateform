import { type TypeClient, type TypeVehicule, type TypeDemande } from "../../lib/enums";

export interface PublicDemandeInput {
  parkingId: number;
  typeClient: TypeClient;
  typeDemande?: TypeDemande;
  ancienNumeroCarte?: string;
  numeroCarteAbonne?: string;
  nouveauParkingId?: number;
  nouveauParkingNom?: string;
  ancienneImmatriculation?: string;
  motifChangement?: string;
  nom?: string;
  prenom?: string;
  cin?: string;
  raisonSociale?: string;
  ice?: string;
  email: string;
  telephone: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  typeVehicule: TypeVehicule;
  forfaitId?: number;
  forfaitNom?: string;
  dureeMois?: number;
  montantTotal?: number;
}

export type StatutDemande = "SOUMISE" | "EN_COURS" | "PAIEMENT_ENREGISTRE" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";

export interface DemandeListItem {
  id: number;
  reference: string;
  typeDemande: TypeDemande;
  statut: StatutDemande;
  clientNom: string;
  parkingNom: string;
  dateCreation: string;
}

export interface DemandeSubmissionResult {
  reference: string;
}

export type BankOption = "CIH" | "ATTIJARI" | "BMCE" | "SOCIETE GENERALE" | "BANQUE POPULAIRE" | "AL BARID" | "Autre";

export interface PaymentInfoInput {
  modePaiement: "ESPECES" | "CHEQUE" | "VIREMENT";
  montant: number;
  numeroCheque?: string;
  banque?: BankOption;
  referenceVirement?: string;
  remarques?: string;
}

export interface DemandeDetail extends DemandeListItem {
  email: string;
  telephone: string;
  immatriculation: string;
  typeVehicule: string;
  numeroCarteAbonne?: string;
  nouveauParkingNom?: string;
  ancienneImmatriculation?: string;
  motifChangement?: string;
  raisonRejet?: string;
  commentaireCorrection?: string;
  paiementInfo?: PaymentInfoInput & { datePaiement?: string; validePar?: string };
}