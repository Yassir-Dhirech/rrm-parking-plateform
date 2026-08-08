import { Tag } from "antd";

type StatutDemande = "SOUMISE" | "EN_COURS" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";
type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "EXPIRE" | "RESILIE";
type StatutPaiement = "EN_ATTENTE" | "CONFIRME" | "ANNULE";
type StatutFacture = "BROUILLON" | "EMISE" | "SIGNEE" | "ANNULEE";
type StatutCarte = "A_PREPARER" | "A_ACTIVER" | "ACTIVE" | "EXPIREE" | "DESACTIVEE";
 type StatutContrat = 'EN_ATTENTE_SIGNATURE' | 'SIGNE' | 'RESILIE' | 'EXPIRE';


type AnyStatut = StatutDemande | 
StatutAbonnement | StatutPaiement | StatutFacture
 | StatutCarte | StatutContrat;

const colorMap: Record<AnyStatut, string> = {
  SOUMISE: "blue",
  EN_COURS: "gold",
  VALIDEE: "green",
  REJETEE: "red",
  CORRIGEE: "orange",
  COMPLETEE: "default",
  EN_ATTENTE: "blue",
  ACTIF: "green",
  SUSPENDU: "orange",
  EXPIRE: "default",
  RESILIE: "red",
  CONFIRME: "green",
  ANNULE: "red",
  BROUILLON: "default",
  EMISE: "blue",
  SIGNEE: "green",
  ANNULEE: "red",
  A_PREPARER: "default",
  A_ACTIVER: "gold",
  DESACTIVEE: "red",
  EXPIREE: "default",
  ACTIVE: "green",
  EN_ATTENTE_SIGNATURE: "gold",
  SIGNE: "green",
};

const labelMap: Record<AnyStatut, string> = {
  SOUMISE: "Soumise",
  EN_COURS: "En cours",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
  CORRIGEE: "Corrigée",
  COMPLETEE: "Complétée",
  EN_ATTENTE: "En attente",
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  EXPIRE: "Expiré",
  RESILIE: "Résilié",
  CONFIRME: "Confirmé",
  ANNULE: "Annulé",
  BROUILLON: "Brouillon",
  EMISE: "Émise",
  SIGNEE: "Signée",
  ANNULEE: "Annulée",
  A_PREPARER: "À préparer",
  A_ACTIVER: "À activer",
  DESACTIVEE: "Désactivée",
  EXPIREE: "Expirée",
  ACTIVE: "Active",
  EN_ATTENTE_SIGNATURE: "En attente de signature",
  SIGNE: "Signé"
};

interface Props {
  statut: AnyStatut;
}

export function StatusBadge({ statut }: Props) {
  return <Tag color={colorMap[statut]}>{labelMap[statut]}</Tag>;
}