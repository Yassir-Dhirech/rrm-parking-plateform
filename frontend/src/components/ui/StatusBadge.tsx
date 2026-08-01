import { Tag } from "antd";

type StatutDemande = "SOUMISE" | "EN_COURS" | "VALIDEE" | "REJETEE" | "CORRIGEE" | "COMPLETEE";

const colorMap: Record<StatutDemande, string> = {
  SOUMISE: "blue",
  EN_COURS: "gold",
  VALIDEE: "green",
  REJETEE: "red",
  CORRIGEE: "orange",
  COMPLETEE: "default",
};

const labelMap: Record<StatutDemande, string> = {
  SOUMISE: "Soumise",
  EN_COURS: "En cours",
  VALIDEE: "Validée",
  REJETEE: "Rejetée",
  CORRIGEE: "Corrigée",
  COMPLETEE: "Complétée",
};

interface Props {
  statut: StatutDemande;
}

export function StatusBadge({ statut }: Props) {
  return <Tag color={colorMap[statut]}>{labelMap[statut]}</Tag>;
}