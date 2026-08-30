import { Table, Card, Typography, Tag, Space, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, FileDoneOutlined, DollarOutlined } from "@ant-design/icons";
import { getPaiementsMock } from "../../../api/paiementsMock";
import type { PaiementListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { modePaiementLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";

const { Title, Text } = Typography;

export function PaiementsList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["paiements"],
    queryFn: getPaiementsMock,
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string, record: PaiementListItem) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${basePath}/paiements/${record.id}`);
          }}
          style={{ fontWeight: 700, color: "#006398" }}
        >
          {ref}
        </a>
      ),
    },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    {
      title: "Coût Abonnement",
      dataIndex: "montantAbonnement",
      key: "montantAbonnement",
      render: (val: number, record: PaiementListItem) => {
        const montantAbo = val || (record.montant - (record.fraisCarteRfid || 0));
        return `${montantAbo.toLocaleString("fr-FR")} MAD`;
      },
    },
    {
      title: "Frais Carte RFID",
      dataIndex: "fraisCarteRfid",
      key: "fraisCarteRfid",
      render: (frais: number | undefined) => {
        if (frais && frais > 0) {
          return (
            <Tag color="orange" style={{ fontWeight: 700 }}>
              +{frais.toLocaleString("fr-FR")} MAD
            </Tag>
          );
        }
        return (
          <Tag color="green" style={{ fontWeight: 700 }}>
            0 MAD (Exonéré)
          </Tag>
        );
      },
    },
    {
      title: "Total Quittancé (TTC)",
      dataIndex: "montant",
      key: "montant",
      render: (value: number) => (
        <strong style={{ color: "#16a34a", fontSize: 14 }}>
          {value.toLocaleString("fr-FR")} MAD
        </strong>
      ),
    },
    {
      title: "Mode",
      dataIndex: "modePaiement",
      key: "modePaiement",
      render: (value: PaiementListItem["modePaiement"]) => (
        <Tag color={value === "CHEQUE" ? "purple" : "blue"} style={{ fontWeight: 600 }}>
          {modePaiementLabels[value]}
        </Tag>
      ),
    },
    {
      title: "Facture Associée",
      dataIndex: "factureNumero",
      key: "factureNumero",
      render: (factureNum: string | undefined, record: PaiementListItem) => {
        const num = factureNum || `FACT-RRM-2026-00000${record.id}`;
        const targetFactureId = record.factureId || record.id;
        return (
          <Button
            size="small"
            icon={<FileDoneOutlined style={{ color: "#006398" }} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/factures/${targetFactureId}`);
            }}
            style={{ fontWeight: 700, borderColor: "#bde0fe", color: "#006398" }}
          >
            {num}
          </Button>
        );
      },
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: PaiementListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Date", dataIndex: "datePaiement", key: "datePaiement", render: (d: string) => formatDate(d) },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PaiementListItem) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`${basePath}/paiements/${record.id}`)}
          >
            Paiement
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<FileDoneOutlined />}
            onClick={() => navigate(`${basePath}/factures/${record.factureId || record.id}`)}
          >
            Facture
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: "#003566" }}>
          <DollarOutlined style={{ marginRight: 8, color: "#16a34a" }} />
          Encaissements & Règlements
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Suivi de l'ensemble des encaissements guichet avec tarification détaillée et factures rattachées (Règle des 50 DH pour carte RFID neuve).
        </Text>
      </div>

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