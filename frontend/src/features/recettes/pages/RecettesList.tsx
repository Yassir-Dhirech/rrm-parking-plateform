import { Table, Card, Typography, Row, Col, Statistic, Tag, Button, Modal, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getRecettesMock } from "../../../api/recettesMock";
import type { RecetteHebdoListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { DollarOutlined, AuditOutlined, SyncOutlined, BankOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function RecettesList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["recettes"],
    queryFn: getRecettesMock,
  });

  const totalGlobal = data?.reduce((acc, r) => acc + r.totalHebdo, 0) || 0;
  const totalEspeces = data?.reduce((acc, r) => acc + (r.totalEspeces || 0), 0) || 0;
  const totalCheques = data?.reduce((acc, r) => acc + (r.totalCheques || 0), 0) || 0;
  const countCheques = data?.reduce((acc, r) => acc + (r.nombreCheques || 0), 0) || 0;

  const handleAutoGenerateRecette = () => {
    Modal.info({
      title: "Automatisation de la Recette Hebdomadaire (W34)",
      content: (
        <div style={{ marginTop: 10 }}>
          <p>La plateforme a agrégé automatiquement toutes les transactions enregistrées par les agents cette semaine :</p>
          <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
            <li><strong>Espèces Liquide collecté :</strong> 18 500 DH</li>
            <li><strong>Chèques Physiques reçus :</strong> 2 chèques (14 000 DH)</li>
            <li><strong>Nombre total de souscriptions :</strong> 32 demandes</li>
          </ul>
          <p style={{ color: "#0284c7", fontWeight: 600, marginTop: 10 }}>
            Le bordereau de remise de caisse a été généré automatiquement pour transmission au service financier.
          </p>
        </div>
      ),
      okText: "Fermer & Consulter",
      onOk: () => message.success("Arrêté de caisse hebdo W34 généré avec succès !"),
    });
  };

  const columns = [
    {
      title: "Référence Bordereau",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{ref}</Tag>,
    },
    { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
    { title: "Période", dataIndex: "semaineAnnee", key: "semaineAnnee" },
    {
      title: "Total Espèces (Liquide)",
      dataIndex: "totalEspeces",
      key: "totalEspeces",
      render: (val: number) => <span style={{ color: "#16a34a", fontWeight: 600 }}>{(val || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "Total Chèques",
      dataIndex: "totalCheques",
      key: "totalCheques",
      render: (val: number, record: RecetteHebdoListItem) => (
        <span>
          {(val || 0).toLocaleString("fr-FR")} DH{" "}
          {record.nombreCheques ? <Tag color="purple" style={{ marginLeft: 4 }}>{record.nombreCheques} chèque(s)</Tag> : null}
        </span>
      ),
    },
    {
      title: "Recette Totale Hebdo",
      dataIndex: "totalHebdo",
      key: "totalHebdo",
      render: (val: number) => <strong style={{ color: "#0369a1", fontSize: 14 }}>{val.toLocaleString("fr-FR")} DH TTC</strong>,
    },
    {
      title: "Statut Règlement",
      dataIndex: "statut",
      key: "statut",
      render: (statut: RecetteHebdoListItem["statut"]) => <StatusBadge statut={statut} />,
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion & Remise des Recettes Hebdomadaires</Title>
          <Text type="secondary">Centralisation des encaissements (Espèces & Chèques) vers le Service Financier / Comptabilité</Text>
        </div>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={handleAutoGenerateRecette}
          style={{ backgroundColor: "#0284c7" }}
        >
          Générer la Recette Hebdomadaire Auto
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
            <Statistic
              title="Recette Hebdo Cumulée"
              value={totalGlobal}
              suffix="DH"
              prefix={<DollarOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ color: "#0369a1", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <Statistic
              title="Espèces à Verser (Liquide)"
              value={totalEspeces}
              suffix="DH"
              prefix={<BankOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#15803d", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
            <Statistic
              title="Chèques à Remettre"
              value={totalCheques}
              suffix={`DH (${countCheques} chq)`}
              prefix={<FileTextOutlined style={{ color: "#9333ea" }} />}
              valueStyle={{ color: "#7e22ce", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#fff7ed", borderColor: "#ffedd5" }}>
            <Statistic
              title="Transmissions Comptables"
              value={data?.filter((r) => r.statut === "VALIDEE_COMPTABILITE" || r.statut === "TRANSMIS_COMPTABILITE").length || 0}
              suffix={`/ ${data?.length || 0}`}
              prefix={<AuditOutlined style={{ color: "#ea580c" }} />}
              valueStyle={{ color: "#c2410c", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

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