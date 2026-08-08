import { Table, Card, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getContratsMock } from "../../../api/contratsMock";
import { type ContratListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title } = Typography;

export function ContratsList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["contrats"],
    queryFn: getContratsMock,
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Entreprise",
      dataIndex: "entrepriseNom",
      key: "entrepriseNom",
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
    },
    {
      title: "Places",
      dataIndex: "nombrePlaces",
      key: "nombrePlaces",
    },
    {
      title: "Montant TTC / mois",
      dataIndex: "montantMensuelTTC",
      key: "montantMensuelTTC",
      render: (value: number) => `${value.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: ContratListItem["statut"]) => (
        <StatusBadge statut={statut} />
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>Contrats Corporate</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/contrats/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}