export type TypeOperationCarte = "IMPRESSION" | "ACTIVATION" | "REMISE";

export interface DemandeOperationnelleCarte {
  id: number;
  reference: string;
  typeOperation: TypeOperationCarte;
  statut: "CREEE" | "AFFECTEE" | "EN_COURS" | "TERMINEE";
  dateCreation: string;
  dateExecution: string | null;
  carteId: number;
  referenceCarte: string;
  numeroCarte: string | null;
  statutCarte: string;
  referenceAbonnement: string;
  demandeClientId: number;
  referenceDemandeClient: string;
  nomClient: string;
  cin: string;
  email: string;
  immatriculation: string;
  parkingNom: string;
  factureId: number | null;
  numeroFacture: string | null;
}
