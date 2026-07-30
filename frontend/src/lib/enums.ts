export type TypeClient = "PARTICULIER" | "ENTREPRISE";

export type TypeVehicule = "VOITURE" | "MOTO" | "CAMIONNETTE";

export type TypeDemande = "NOUVEL_ABONNEMENT" | "RENOUVELLEMENT";

export const typeVehiculeLabels: Record<TypeVehicule, string> = {
  VOITURE: "Voiture",
  MOTO: "Moto",
  CAMIONNETTE: "Camionnette",
};

// export const typeClientLabels: Record<TypeClient, string> = {
//   PARTICULIER: "Particulier",
//   ENTREPRISE: "Entreprise",
// };

// export const typeDemandeLabels: Record<TypeDemande, string> = {
//   NOUVEL_ABONNEMENT: "Nouvel Abonnement",
//   RENOUVELLEMENT: "Renouvellement",
// };