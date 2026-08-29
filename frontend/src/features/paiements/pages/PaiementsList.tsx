import { Table, Card, Typography, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPaiementsMock } from "../../../api/paiementsMock";
import type { PaiementListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { modePaiementLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";

const { Title } = Typography;

export function PaiementsList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["paiements"],
    queryFn: getPaiementsMock,
  });

  const columns = [
    { title: "Référence", dataIndex: "reference", key: "reference" },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    {
      title: "Montant",
      dataIndex: "montant",
      key: "montant",
      render: (value: number) => `${value.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Mode",
      dataIndex: "modePaiement",
      key: "modePaiement",
      render: (value: PaiementListItem["modePaiement"]) => (
        <Tag>{modePaiementLabels[value]}</Tag>
      ),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: PaiementListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Date", dataIndex: "datePaiement", key: "datePaiement", render: (d: string) => formatDate(d) },
  ];

  return (
    <Card>
      <Title level={4}>Paiements</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        scroll={{ x: "max-content" }}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/paiements/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
}