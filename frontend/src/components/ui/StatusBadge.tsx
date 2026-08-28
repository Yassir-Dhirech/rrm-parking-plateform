import { Tag } from "antd";

type StatutDemande = "SOUMISE" | "EN_COURS" | "PAIEMENT_ENREGISTRE" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";
type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "EXPIRE" | "RESILIE";
type StatutPaiement = "EN_ATTENTE" | "CONFIRME" | "ANNULE";
type StatutFacture = "BROUILLON" | "EMISE" | "SIGNEE" | "ANNULEE";
type StatutCarte = "EN_ATTENTE_IMPRESSION" | "IMPRIMEE_NON_TESTEE" | "TESTEE_PRET_A_RECUPERER" | "DELIVREE_ACTIVE" | "A_PREPARER" | "A_ACTIVER" | "ACTIVE" | "EXPIREE" | "DESACTIVEE";
type StatutContrat = 'EN_ATTENTE_SIGNATURE' | 'SIGNE' | 'RESILIE' | 'EXPIRE';
type StatutRecette = 
  | "EN_COURS"
  | "COMPLETED" 
  | "RECEIVED";

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
  EN_ATTENTE_IMPRESSION: "gold",
  IMPRIMEE_NON_TESTEE: "blue",
  TESTEE_PRET_A_RECUPERER: "cyan",
  DELIVREE_ACTIVE: "green",
  A_PREPARER: "default",
  A_ACTIVER: "gold",
  DESACTIVEE: "red",
  EXPIREE: "default",
  ACTIVE: "green",
  EN_ATTENTE_SIGNATURE: "gold",
  SIGNE: "green",
  COMPLETED: "purple",
  RECEIVED: "green",
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
  EN_ATTENTE_IMPRESSION: "Payé — En attente d'impression",
  IMPRIMEE_NON_TESTEE: "Imprimée — Non testée",
  TESTEE_PRET_A_RECUPERER: "Testée — Prête à récupérer",
  DELIVREE_ACTIVE: "Délivrée au guichet (Active)",
  A_PREPARER: "À préparer",
  A_ACTIVER: "À activer",
  DESACTIVEE: "Désactivée",
  EXPIREE: "Expirée",
  ACTIVE: "Active",
  EN_ATTENTE_SIGNATURE: "En attente de signature",
  SIGNE: "Signé",
  COMPLETED: "Completed (Complétée par Superviseur)",
  RECEIVED: "Received (Reçue par Comptabilité)",
};

interface Props {
  statut: AnyStatut;
}

export function StatusBadge({ statut }: Props) {
  return <Tag color={colorMap[statut]}>{labelMap[statut]} </Tag>;
}