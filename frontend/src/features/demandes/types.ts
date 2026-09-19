import {
  type TypeClient,
  type TypeVehicule,
  type TypeDemande,
} from "../../lib/enums";

/*
 * Types utilisés par les véritables API backend.
 */

export type ModePaiement = "ESPECE" | "CHEQUE";

export type StatutPaiement =
  | "EN_ATTENTE"
  | "CONFIRME"
  | "REJETE"
  | "ANNULE";

export interface EnregistrementPaiementRequest {
  numeroCheque: string | null;
  banqueCheque: string | null;
  dateEmissionCheque: string | null;
}

export interface EnregistrementPaiementResponse {
  id: number;
  reference: string;
  demandeId: number;
  referenceDemande: string;
  montant: number;
  modePaiement: ModePaiement;
  statutPaiement: StatutPaiement;
  statutDemande: StatutDemande;
  dateConfirmation: string;
}

export type CanalOtp = "EMAIL" | "SMS";

export type StatutDemande =
  | "SOUMISE"
  | "EN_ATTENTE_PAIEMENT"
  | "PAYEE"
  | "EN_ATTENTE_CORRECTION"
  | "VALIDEE"
  | "REFUSEE"
  | "EXPIREE"
  | "ANNULEE";

export interface DecisionDemandeResponse {
  demandeId: number;
  referenceDemande: string;
  statutDemande: StatutDemande;
  abonnementId: number | null;
  referenceAbonnement: string | null;
  carteId: number | null;
  referenceCarte: string | null;
  demandeImpressionId: number | null;
  referenceDemandeImpression: string | null;
}

export type StatutDemandeApi = StatutDemande;

export type CanalInitiation =
  | "EN_LIGNE"
  | "ASSISTE_PAR_AGENT";

export type TypeDemandeRecherche =
  | "NOUVEL_ABONNEMENT_REGULIER"
  | "RENOUVELLEMENT_REGULIER"
  | "CHANGEMENT_PARKING"
  | "CHANGEMENT_VEHICULE"
  | "NOUVEAU_CONTRAT_CORPORATE"
  | "AUTRE";

export type TypeClientRecherche =
  | "PARTICULIER"
  | "ENTREPRISE"
  | "INCONNU";

export interface DemandeRechercheResponse {
  id: number;
  reference: string;
  typeDemande: TypeDemandeRecherche;
  statut: StatutDemande;
  canalInitiation: CanalInitiation;

  dateSoumission: string;
  dateValidationOtp: string | null;
  dateModification: string | null;

  clientId: number;
  typeClient: TypeClientRecherche;
  nomClient: string | null;
  identifiantClient: string | null;
  email: string | null;
  telephone: string | null;
}

export type TypePieceJointe =
  | "CIN_RECTO"
  | "CIN_VERSO"
  | "CARTE_GRISE_RECTO"
  | "CARTE_GRISE_VERSO";

export type StatutPieceJointe =
  | "TELEVERSEE"
  | "VALIDEE"
  | "REJETEE"
  | "ARCHIVEE";

export interface PieceJointeDetailResponse {
  id: number;
  reference: string;
  typePiece: TypePieceJointe;
  statut: StatutPieceJointe;
  nomFichierOriginal: string;
  typeMime: string;
  tailleOctets: number;
  dateDepot: string;
  contenuUrl: string;
}

export interface DemandeDetailResponse {
  id: number;
  reference: string;
  typeDemande: "NOUVEL_ABONNEMENT_REGULIER";
  statut: StatutDemande;
  canalInitiation: CanalInitiation;

  dateCreation: string;
  dateSoumission: string;
  dateValidationOtp: string | null;
  dateModification: string;
  motifRefus: string | null;

  clientId: number;
  typeClient: TypeClientRecherche;
  clientNom: string;
  cin: string;
  email: string;
  telephone: string;

  vehiculeId: number;
  immatriculation: string;
  marque: string | null;
  modele: string | null;
  couleur: string | null;
  typeVehicule: TypeVehicule;

  tarifParkingId: number;
  parkingId: number;
  parkingNom: string;
  forfaitId: number;
  forfaitNom: string;
  dureeMois: number;
  prixHT: number;
  tauxTVA: number;
  montantAbonnementTTC: number;
  fraisCarteTTC: number;
  montantTotalTTC: number;
  modePaiementSouhaite: ModePaiement;

  piecesJointes: PieceJointeDetailResponse[];
}

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
  statut: StatutDemande;
  dateSoumission: string;
  dateExpirationOtp: string;
  tentativesRestantes: number;
  canalOtp: CanalOtp;
  destinationMasquee: string;
}

export interface ValidationOtpResponse {
  reference: string;
  otpValide: boolean;
  statutDemande: StatutDemande;
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
  dateExpiration?: string;
  delaiJoursRestants?: number;

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
  modePaiement: ModePaiement;
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
  typeVehicule: TypeVehicule;

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
  modePaiement?: ModePaiement;
  raisonRejet?: string;
  commentaireCorrection?: string;

  cinRectoUrl?: string;
  cinVersoUrl?: string;
  carteGriseRectoUrl?: string;
  carteGriseVersoUrl?: string;

  paiementInfo?: PaymentInfoInput & {
    datePaiement?: string;
    validePar?: string;
  };
}
