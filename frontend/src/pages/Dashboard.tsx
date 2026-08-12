import { useState } from "react";
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space } from "antd";
import {
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";
import { GlobalFilterBar, type GlobalFilters } from "../components/ui/GlobalFilterBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getRecettesMock } from "../api/recettesMock";
import { getContratsMock } from "../api/contratsMock";

// const { Title, Paragraph } = Typography;

export function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GlobalFilters>({});

  const currentRoleConfig = role ? roleConfig[role] : null;
  const basePath = currentRoleConfig ? currentRoleConfig.homePath : "";

  // Requêtes de synthèse réelles
  const { data: recettes } = useQuery({ queryKey: ["recettes"], queryFn: getRecettesMock });
  const { data: contrats } = useQuery({ queryKey: ["contrats"], queryFn: getContratsMock });

  // Calculs dynamiques de statistiques
  const totalCAHebdo = recettes?.reduce((acc, r) => acc + r.totalHebdo, 0) || 0;
  const recettesEnAttente = recettes?.filter((r) => r.statut === "EN_COURS").length || 0;
  const contratsEnAttenteSign = contrats?.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* En-tête de l'Espace */}
      {/* <Card
        style={{
          background: "linear-gradient(135deg, #003566 0%, #001E3D 100%)",
          color: "#fff",
          borderRadius: 16,
          boxShadow: "var(--shadow-md)",
          border: "none",
        }}
        styles={{ body: { padding: "28px 32px" } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
              {currentRoleConfig?.title || "Tableau de bord RRM"}
            </Title>
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.85)", margin: "4px 0 0 0", fontSize: 14 }}>
              Plateforme centralisée de gestion des parkings — Rabat Région Mobilité
            </Paragraph>
          </Col>
          <Col>
            <Tag
              style={{
                fontSize: "13px",
                padding: "6px 14px",
                fontWeight: 600,
                background: "var(--color-secondary)",
                color: "var(--color-primary-dark)",
                border: "none",
                borderRadius: 20,
              }}
            >
              Rôle actif : {role}
            </Tag>
          </Col>
        </Row>
      </Card> */}

      {/* Barre de Filtres Globaux */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* Cartes KPIs Réelles */}
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderLeft: "4px solid #003566", boxShadow: "var(--shadow-sm)", borderRadius: 12 }}>
            <Statistic
              title="Recettes Totales Cumulées"
              value={totalCAHebdo}
              suffix="MAD"
              precision={2}
              valueStyle={{ color: "#003566", fontWeight: 700 }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderLeft: "4px solid #d97706", boxShadow: "var(--shadow-sm)", borderRadius: 12 }}>
            <Statistic
              title="Recettes à Valider"
              value={recettesEnAttente}
              valueStyle={{ color: "#d97706", fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderLeft: "4px solid #982B5E", boxShadow: "var(--shadow-sm)", borderRadius: 12 }}>
            <Statistic
              title="Contrats à Signer"
              value={contratsEnAttenteSign}
              valueStyle={{ color: "#982B5E", fontWeight: 700 }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderLeft: "4px solid #10b981", boxShadow: "var(--shadow-sm)", borderRadius: 12 }}>
            <Statistic
              title="Parkings en Exploitation"
              value={17}
              valueStyle={{ color: "#10b981", fontWeight: 700 }}
              prefix={<CreditCardOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions Rapides & Vues Métier */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Dernières Recettes Hebdomadaires">
            <Table
              dataSource={recettes?.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => navigate(`${basePath}/recettes/${record.id}`),
                style: { cursor: "pointer" },
              })}
              columns={[
                { title: "Référence", dataIndex: "reference", key: "reference" },
                { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
                { title: "Période", dataIndex: "semaineAnnee", key: "semaineAnnee" },
                {
                  title: "Total",
                  dataIndex: "totalHebdo",
                  key: "totalHebdo",
                  render: (v: number) => `${v.toLocaleString("fr-FR")} MAD`,
                },
                {
                  title: "Statut",
                  dataIndex: "statut",
                  key: "statut",
                  render: (s) => <StatusBadge statut={s} />,
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Raccourcis Espace">
            <Space direction="vertical" style={{ width: "100%" }}>
              {currentRoleConfig?.menuItems.map((item) => (
                <Button
                  key={item.key}
                  block
                  type="default"
                  icon={<ArrowRightOutlined />}
                  style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}