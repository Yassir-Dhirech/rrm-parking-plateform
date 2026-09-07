import {
  type TypeClient,
  type TypeVehicule,
  type TypeDemande,
} from "../../lib/enums";

/*
 * Types utilisés par les véritables API backend.
 */

export type ModePaiement =
  | "ESPECE"
  | "CHEQUE";

export type CanalOtp =
  | "SMS"
  | "WHATSAPP";

export type StatutDemandeApi =
  | "SOUMISE"
  | "EN_ATTENTE_PAIEMENT"
  | "EN_ATTENTE_CONFIRMATION_PAIEMENT"
  | "EN_INSTRUCTION"
  | "EN_ATTENTE_VALIDATION_SUPERVISEUR"
  | "EN_ATTENTE_VALIDATION_RESPONSABLE"
  | "VALIDEE"
  | "REFUSEE"
  | "ANNULEE";

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

  typeVehicule: TypeVehicule;

  tarifParkingId: number;
  modePaiement: ModePaiement;
  canalOtp: CanalOtp;
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
  statut: StatutDemandeApi;
  dateSoumission: string;
  dateExpirationOtp: string;
  tentativesRestantes: number;
  canalOtp: CanalOtp;
  destinationMasquee: string;
}

export interface ValidationOtpResponse {
  reference: string;
  otpValide: boolean;
  statutDemande: StatutDemandeApi;
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

/*
 * Modèle actuellement utilisé par les anciens écrans
 * et les données mock.
 *
 * Il sera progressivement remplacé par les DTO réels.
 */

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

/*
 * Statuts historiques utilisés uniquement par les écrans mock.
 * Ne pas utiliser ce type pour appeler le backend.
 */
export type StatutDemande =
  | "SOUMISE"
  | "EN_COURS"
  | "EN_ATTENTE_PAIEMENT"
  | "PAIEMENT_ENREGISTRE"
  | "VALIDEE"
  | "REJETEE"
  | "CORRIGEE"
  | "COMPLETEE";

export type StatutSla =
  | "DANS_LES_DELAIS"
  | "ALERT_5_JOURS"
  | "ALERT_3_JOURS"
  | "ALERT_1_JOUR"
  | "DEPASSE";

export interface DemandeListItem {
  id: number;
  reference: string;
  typeDemande: TypeDemande;
  statut: StatutDemande;

  clientNom: string;
  parkingNom: string;
  dateCreation: string;

  agentAffecteNom?: string;
  traiteParNom?: string;

  roleTraitePar?:
    | "AGENT"
    | "SUPERVISEUR"
    | "RESPONSABLE";

  dateTraitement?: string;
  dureeTraitementJours?: number;
  slaRestantJours?: number;
  slaStatut?: StatutSla;
}

export interface DemandeSubmissionResult {
  reference: string;
}

export type BankOption =
  | "CIH"
  | "ATTIJARI"
  | "BMCE"
  | "SOCIETE GENERALE"
  | "BANQUE POPULAIRE"
  | "AL BARID"
  | "Autre";

/*
 * Ce modèle est encore utilisé par les écrans mock.
 * L'API réelle de paiement utilisera ModePaiement.
 */
export interface PaymentInfoInput {
  modePaiement:
    | "ESPECES"
    | "ESPECE"
    | "CHEQUE";

  montant: number;
  numeroCheque?: string;
  banque?: BankOption;
  remarques?: string;
}

export interface DemandeDetail
  extends DemandeListItem {

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

  modePaiement?:
    | "ESPECES"
    | "ESPECE"
    | "CHEQUE";

  raisonRejet?: string;
  commentaireCorrection?: string;

  cinRectoUrl?: string;
  cinVersoUrl?: string;DemandeAbonnementRegulierRequest
  carteGriseRectoUrl?: string;
  carteGriseVersoUrl?: string;

  paiementInfo?: PaymentInfoInput & {
    datePaiement?: string;
    validePar?: string;
  };
}