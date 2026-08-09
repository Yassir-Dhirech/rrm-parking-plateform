import { Table, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getRecettesMock } from "../../../api/recettesMock";
import type{ RecetteHebdoListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title } = Typography;

export function RecettesList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["recettes"],
    queryFn: getRecettesMock,
  });

  const columns = [
    { title: "Référence", dataIndex: "reference", key: "reference" },
    { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
    { title: "Période", dataIndex: "semaineAnnee", key: "semaineAnnee" },
    {
      title: "Recette Totale",
      dataIndex: "totalHebdo",
      key: "totalHebdo",
      render: (val: number) => `${val.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: RecetteHebdoListItem["statut"]) => <StatusBadge statut={statut} />,
    },
  ];

  return (
    <Card>
      <Title level={4}>Synthèse des Recettes Hebdomadaires</Title>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/recettes/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}