export type TypeClient = "PARTICULIER" | "ENTREPRISE" | "STAFF";

export type TypeVehicule = "VOITURE" | "MOTO" | "CAMIONNETTE";

export type TypeDemande = "NOUVEL_ABONNEMENT" | "RENOUVELLEMENT" | "CHANGEMENT_PARKING" | "CHANGEMENT_VEHICULE";

export type ModePaiement = "ESPECES" | "CHEQUE";

export const typeClientLabels: Record<TypeClient, { label: string; color: string }> = {
  PARTICULIER: { label: "Particulier", color: "blue" },
  ENTREPRISE: { label: "Entreprise", color: "purple" },
  STAFF: { label: "Staff RRM / Personnel", color: "gold" },
};

export const typeVehiculeLabels: Record<TypeVehicule, string> = {
  VOITURE: "Voiture",
  MOTO: "Moto",
  CAMIONNETTE: "Camionnette",
};

export const modePaiementLabels: Record<ModePaiement, string> = {
  ESPECES: "Espèces",
  CHEQUE: "Chèque",
};

export const typeDemandeLabels: Record<TypeDemande, { label: string; color: string }> = {
  NOUVEL_ABONNEMENT: { label: "Nouvel Abonnement", color: "blue" },
  RENOUVELLEMENT: { label: "Renouvellement", color: "purple" },
  CHANGEMENT_PARKING: { label: "Changement de Parking", color: "orange" },
  CHANGEMENT_VEHICULE: { label: "Changement de Véhicule", color: "cyan" },
};