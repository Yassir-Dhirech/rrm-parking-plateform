import { type TypeClient, type TypeVehicule, type TypeDemande } from "../../lib/enums";

export type ModePaiement = "ESPECE" | "CHEQUE";

export interface DemandeAbonnementRegulierRequest {
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string;

  numeroImmatriculation: string;
  serieImmatriculation: string;
  codeRegion: string;
  marque?: string;
  modele?: string;
  couleur?: string;
  typeVehicule: string;

  tarifParkingId: number;
  modePaiement: ModePaiement;
  conditionsAcceptees: boolean;
}

export interface DocumentsDemande {
  cinRecto: File;
  cinVerso: File;
  carteGriseRecto: File;
  carteGriseVerso: File;
}

export interface DemandeAbonnementRegulierResponse {
  reference: string;
  statut: "SOUMISE" | string;
  dateSoumission: string;
  dateExpirationOtp: string;
  tentativesRestantes: number;
  canalOtp: "SMS" | "EMAIL";
  destinationMasquee: string;
}

export interface ValidationOtpResponse {
  reference: string;
  otpValide: boolean;
  statutDemande: string;
  tentativesRestantes: number;
  dateValidation: string | null;
  message: string;
}

export interface ApiProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  date?: string;
  chemin?: string;
}

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
  rcEntreprise?: string;
  ifEntreprise?: string;
  nomRepresentant?: string;
  fonctionRepresentant?: string;
  email: string;
  telephone: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  typeVehicule: TypeVehicule;
  forfaitId?: number;
  forfaitNom?: string;
  dureeMois?: number;
  categorieDuree?: "COURTE" | "LONGUE";
  nombreAbonnements?: number;
  montantTotal?: number;
  cinRectoUrl?: string;
  cinVersoUrl?: string;
  carteGriseRectoUrl?: string;
  carteGriseVersoUrl?: string;
}

export type StatutDemande = "SOUMISE" | "EN_COURS" | "EN_ATTENTE_PAIEMENT" | "PAIEMENT_ENREGISTRE" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";

export type StatutSla = "DANS_LES_DELAIS" | "ALERT_5_JOURS" | "ALERT_3_JOURS" | "ALERT_1_JOUR" | "DEPASSE";

export interface DemandeListItem {
  id: number;
  reference: string;
  typeDemande: TypeDemande;
  statut: StatutDemande;
  clientNom: string;
  parkingNom: string;
  dateCreation: string;
  // Performance & SLA Tracking
  agentAffecteNom?: string;
  traiteParNom?: string;
  roleTraitePar?: "AGENT" | "SUPERVISEUR" | "RESPONSABLE";
  dateTraitement?: string;
  dureeTraitementJours?: number;
  slaRestantJours?: number;
  slaStatut?: StatutSla;
}

export interface DemandeSubmissionResult {
  reference: string;
}

export type BankOption = "CIH" | "ATTIJARI" | "BMCE" | "SOCIETE GENERALE" | "BANQUE POPULAIRE" | "AL BARID" | "Autre";

export interface PaymentInfoInput {
  modePaiement: "ESPECES" | "CHEQUE" | "ESPECE";
  montant: number;
  numeroCheque?: string;
  banque?: BankOption;
  remarques?: string;
}

export interface DemandeDetail extends DemandeListItem {
  email: string;
  telephone: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  typeVehicule: string;
  typeClient?: TypeClient;
  cin?: string;
  ice?: string;
  rc?: string;
  numeroCarteAbonne?: string;
  nouveauParkingNom?: string;
  ancienneImmatriculation?: string;
  motifChangement?: string;
  motifPerte?: string;
  fraisDuplicata?: number;
  statutCarteAncienne?: string;
  formuleCode?: string;
  forfaitNom?: string;
  dureeMois?: number;
  nombreAbonnements?: number;
  montantTotal?: number;
  modePaiement?: "ESPECES" | "CHEQUE" | "ESPECE";
  raisonRejet?: string;
  commentaireCorrection?: string;
  cinRectoUrl?: string;
  cinVersoUrl?: string;
  carteGriseRectoUrl?: string;
  carteGriseVersoUrl?: string;
  paiementInfo?: PaymentInfoInput & { datePaiement?: string; validePar?: string };
}