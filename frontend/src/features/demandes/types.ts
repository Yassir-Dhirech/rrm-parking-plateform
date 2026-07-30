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

export interface DemandeSubmissionResult {
  reference: string;
}