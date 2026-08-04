import {type TypeClient, type TypeVehicule } from "../../lib/enums";

export interface PublicDemandeInput {
  parkingId: number;
  typeClient: TypeClient;
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
}

export type StatutDemande = "SOUMISE" | "EN_COURS" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";

export interface DemandeListItem {
  id: number;
  reference: string;
  typeDemande: "NOUVEL_ABONNEMENT" | "RENOUVELLEMENT";
  statut: StatutDemande;
  clientNom: string;
  parkingNom: string;
  dateCreation: string;
}

export interface DemandeSubmissionResult {
  reference: string;
}

export interface DemandeDetail extends DemandeListItem {
  email: string;
  telephone: string;
  immatriculation: string;
  typeVehicule: string;
  raisonRejet?: string;
}