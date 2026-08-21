import { Tag } from "antd";

type StatutDemande = "SOUMISE" | "EN_COURS" | "PAIEMENT_ENREGISTRE" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";
type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "EXPIRE" | "RESILIE";
type StatutPaiement = "EN_ATTENTE" | "CONFIRME" | "ANNULE";
type StatutFacture = "BROUILLON" | "EMISE" | "SIGNEE" | "ANNULEE";
type StatutCarte = "A_PREPARER" | "A_ACTIVER" | "ACTIVE" | "EXPIREE" | "DESACTIVEE";
 type StatutContrat = 'EN_ATTENTE_SIGNATURE' | 'SIGNE' | 'RESILIE' | 'EXPIRE';
type StatutRecette = 
  | "EN_COURS" 
  | "EN_ATTENTE_TRANSMISSION" 
  | "TRANSMIS_COMPTABILITE" 
  | "VALIDEE_SUPERVISEUR" 
  | "VALIDEE_COMPTABILITE" 
  | "CLOTUREE";

type AnyStatut = StatutDemande | 
StatutAbonnement | StatutPaiement | StatutFacture
 | StatutCarte | StatutContrat | StatutRecette;


const colorMap: Record<AnyStatut, string> = {
  SOUMISE: "blue",
  EN_COURS: "gold",
  PAIEMENT_ENREGISTRE: "cyan",
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
  EN_ATTENTE_TRANSMISSION: "cyan",
  TRANSMIS_COMPTABILITE: "purple",
  VALIDEE_SUPERVISEUR: "blue",
  VALIDEE_COMPTABILITE: "green",
  CLOTUREE: "green",
};

const labelMap: Record<AnyStatut, string> = {
  SOUMISE: "Soumise",
  EN_COURS: "En cours",
  PAIEMENT_ENREGISTRE: "Paiement Enregistré",
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
  SIGNE: "Signé",
  EN_ATTENTE_TRANSMISSION: "Prêt à transmettre",
  TRANSMIS_COMPTABILITE: "Transmis Comptabilité",
  VALIDEE_SUPERVISEUR: "Validée Superviseur",
  VALIDEE_COMPTABILITE: "Validée Comptabilité",
  CLOTUREE: "Clôturée",
};

interface Props {
  statut: AnyStatut;
}

export function StatusBadge({ statut }: Props) {
  return <Tag color={colorMap[statut]}>{labelMap[statut]} </Tag>;
}