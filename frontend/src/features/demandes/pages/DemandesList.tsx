import { Table, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getDemandesMock } from "../../../api/demandesMock";
import { type DemandeListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export function DemandesList() {
    const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Type",
      dataIndex: "typeDemande",
      key: "typeDemande",
      render: (value: string) =>
        value === "NOUVEL_ABONNEMENT" ? "Nouvel abonnement" : "Renouvellement",
    },
    {
      title: "Client",
      dataIndex: "clientNom",
      key: "clientNom",
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: DemandeListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    {
      title: "Date",
      dataIndex: "dateCreation",
      key: "dateCreation",
    },
  ];

  return (
    <Card>
      <Title level={4}>Demandes</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={(record) => ({
    onClick: () => navigate(`/agent/demandes/${record.id}`),
    style: { cursor: "pointer" },
  })}
      />
    </Card>
  );
}