import { Tag } from "antd";

type StatutDemande = "SOUMISE" | "EN_COURS" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";
type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "EXPIRE" | "RESILIE";

type AnyStatut = StatutDemande | StatutAbonnement;

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
};

interface Props {
  statut: AnyStatut;
}

export function StatusBadge({ statut }: Props) {
  return <Tag color={colorMap[statut]}>{labelMap[statut]}</Tag>;
}