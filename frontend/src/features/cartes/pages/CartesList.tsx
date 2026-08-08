import { Table, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCartesMock } from "../../../api/cartesMock";
import type{ CarteListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title } = Typography;

export function CartesList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["cartes"],
    queryFn: getCartesMock,
  });

  const columns = [
    { title: "N° Carte", dataIndex: "numeroCarte", key: "numeroCarte" },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    { title: "Abonnement", dataIndex: "abonnementReference", key: "abonnementReference" },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: CarteListItem["statut"]) => <StatusBadge statut={statut} />,
    },
  ];

  return (
    <Card>
      <Title level={4}>Cartes d'accès</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/cartes/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}