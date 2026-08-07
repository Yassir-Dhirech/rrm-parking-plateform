import { Table, Card, Typography, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAbonnementsMock } from "../../../api/abonnementsMock";
import type { AbonnementListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title } = Typography;

export function AbonnementsList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["abonnements"],
    queryFn: getAbonnementsMock,
  });

  const columns = [
    { title: "Référence", dataIndex: "reference", key: "reference" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string) => (
        <Tag color={value === "REGULIER" ? "cyan" : "purple"}>
          {value === "REGULIER" ? "Régulier" : "Entreprise"}
        </Tag>
      ),
    },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: AbonnementListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Début", dataIndex: "dateDebut", key: "dateDebut" },
    { title: "Fin", dataIndex: "dateFin", key: "dateFin" },
  ];

  return (
    <Card>
      <Title level={4}>Abonnements</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/abonnements/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}