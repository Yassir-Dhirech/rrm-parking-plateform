import { Table, Card, Typography, Button } from "antd";
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
      sorter: (a: ContratListItem, b: ContratListItem) => a.reference.localeCompare(b.reference),
    },
    {
      title: "Entreprise",
      dataIndex: "entrepriseNom",
      key: "entrepriseNom",
      sorter: (a: ContratListItem, b: ContratListItem) => a.entrepriseNom.localeCompare(b.entrepriseNom),
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
      filters: [
        { text: "Parking Agdal Gare", value: "Parking Agdal Gare" },
        { text: "Parking Bab El Had", value: "Parking Bab El Had" },
        { text: "Parking Hassan II", value: "Parking Hassan II" },
        { text: "Parking Chellah", value: "Parking Chellah" },
      ],
      onFilter: (value: any, record: ContratListItem) => record.parkingNom.includes(value as string),
      filterSearch: true,
      sorter: (a: ContratListItem, b: ContratListItem) => a.parkingNom.localeCompare(b.parkingNom),
    },
    {
      title: "Places",
      dataIndex: "nombrePlaces",
      key: "nombrePlaces",
      sorter: (a: ContratListItem, b: ContratListItem) => a.nombrePlaces - b.nombrePlaces,
    },
    {
      title: "Montant TTC / mois",
      dataIndex: "montantMensuelTTC",
      key: "montantMensuelTTC",
      sorter: (a: ContratListItem, b: ContratListItem) => a.montantMensuelTTC - b.montantMensuelTTC,
      render: (value: number) => `${value.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      filters: [
        { text: "Signé", value: "SIGNE" },
        { text: "En attente de signature", value: "EN_ATTENTE_SIGNATURE" },
        { text: "Résilié", value: "RESILIE" },
        { text: "Expiré", value: "EXPIRE" },
      ],
      onFilter: (value: any, record: ContratListItem) => record.statut === value,
      render: (statut: ContratListItem["statut"]) => (
        <StatusBadge statut={statut} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ContratListItem) => (
        <Button
          type="primary"
          size="small"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            navigate(`${basePath}/contrats/${record.id}`);
          }}
          style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700, borderRadius: 6 }}
        >
          Gérer Situation
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4} style={{ color: "#003566", margin: 0, marginBottom: 16 }}>
        Gestion de la Situation des Contrats Corporate
      </Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/contrats/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}