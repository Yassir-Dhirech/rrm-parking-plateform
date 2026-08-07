import { Table, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFacturesMock } from "../../../api/facturesMock";
import type{ FactureListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title } = Typography;

export function FacturesList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["factures"],
    queryFn: getFacturesMock,
  });

  const columns = [
    { title: "Numéro", dataIndex: "numero", key: "numero" },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    {
      title: "Montant TTC",
      dataIndex: "montantTtc",
      key: "montantTtc",
      render: (value: number) => `${value.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: FactureListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Date émission", dataIndex: "dateEmission", key: "dateEmission" },
  ];

  return (
    <Card>
      <Title level={4}>Factures</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/factures/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}