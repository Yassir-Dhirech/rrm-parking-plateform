import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import {
  getCartesAgent,
  type CarteAgent,
  type StatutCarteAgent,
} from "../../../api/agentParkingRegistre";

const { Title, Text } = Typography;

const statuts: Array<{ value: StatutCarteAgent; label: string }> = [
  { value: "EN_PREPARATION", label: "En préparation" },
  { value: "A_IMPRIMER", label: "À imprimer" },
  { value: "IMPRIMEE", label: "Imprimée" },
  { value: "A_ACTIVER", label: "À activer" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDUE", label: "Suspendue" },
  { value: "DESACTIVEE", label: "Désactivée" },
  { value: "EXPIREE", label: "Expirée" },
];

const colonnes: TableProps<CarteAgent>["columns"] = [
  {
    title: "Carte",
    dataIndex: "numeroCarte",
    render: (numero: string | null, ligne) => {
      const numAffiche = numero && numero.startsWith("CRT-")
        ? numero
        :`CRT-${new Date().getFullYear()}-${String(ligne.id).padStart(4, "0")}`;
;
      return (
        <Space direction="vertical" size={0}>
          <Tag color="blue" style={{ fontWeight: 700, fontSize: 13, padding: "2px 8px" }}>
            {numAffiche}
          </Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>{ligne.reference}</Text>
        </Space>
      );
    },
  },

  { title: "Titulaire", dataIndex: "clientNom" },
  { title: "Abonnement", dataIndex: "referenceAbonnement" },
  {
    title: "Type",
    dataIndex: "typeAbonnement",
    render: (type: CarteAgent["typeAbonnement"]) =>
      type === "CORPORATE" ? "Corporate" : "Régulier",
  },
  {
    title: "Statut",
    dataIndex: "statut",
    render: (statut: StatutCarteAgent) => (
      <Tag color={statut === "ACTIVE" ? "green" : "blue"}>
        {statuts.find((option) => option.value === statut)?.label || statut}
      </Tag>
    ),
  },
  { title: "Immatriculation", dataIndex: "immatriculation", render: (v: string | null) => v || "—" },
];

export function CartesAgentRegistrePage() {
  const [params] = useSearchParams();
  const [recherche, setRecherche] = useState(() => params.get("recherche") || "");
  const terme = useDeferredValue(recherche);
  const [statut, setStatut] = useState<StatutCarteAgent | undefined>();
  const [type, setType] = useState<"REGULIER" | "CORPORATE" | undefined>();
  const { data, isPending, error } = useQuery({
    queryKey: ["agent", "cartes", terme, statut, type],
    queryFn: () => getCartesAgent({ recherche: terme.trim(), statut, type }),
  });

  return (
    <Card>
      <Title level={3}>Cartes d'accès de mon parking</Title>
      <Text type="secondary">
        {data?.[0]?.parkingNom || "Parking auquel vous êtes affecté"} · {data?.length ?? 0} carte(s)
      </Text>
      <Space wrap style={{ width: "100%", margin: "20px 0" }}>
        <Input
          aria-label="Rechercher une carte"
          prefix={<SearchOutlined />}
          placeholder="Carte, titulaire, abonnement, immatriculation…"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          allowClear
          style={{ minWidth: 290 }}
        />
        <Select
          aria-label="Filtrer par statut"
          placeholder="Tous les statuts"
          allowClear
          options={statuts}
          value={statut}
          onChange={setStatut}
          style={{ width: 180 }}
        />
        <Select
          aria-label="Filtrer par type d'abonnement"
          placeholder="Tous les types"
          allowClear
          value={type}
          options={[
            { value: "REGULIER", label: "Régulier" },
            { value: "CORPORATE", label: "Corporate" },
          ]}
          onChange={setType}
          style={{ width: 170 }}
        />
      </Space>
      {error && (
        <Alert type="error" showIcon message="Impossible de charger les cartes de votre parking" />
      )}
            <Table<CarteAgent>
        rowKey="id"
        dataSource={data ?? []}
        columns={colonnes}
        loading={isPending}
        scroll={{ y: 550, x: 1000 }}
        pagination={false}
      />

    </Card>
  );
}
