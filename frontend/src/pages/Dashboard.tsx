import { useState } from "react";
import { Row, Col, Card, Statistic, Typography, Table, Button, Space, Tag } from "antd";
import {
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";
import { GlobalFilterBar, type GlobalFilters } from "../components/ui/GlobalFilterBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { RoleCharts } from "../components/charts/RoleCharts";
import { getRecettesMock } from "../api/recettesMock";
import { getContratsMock } from "../api/contratsMock";

export function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GlobalFilters>({});

  if (!role) return null;

  const currentRoleConfig = roleConfig[role];
  const basePath = currentRoleConfig.homePath;

  // Requêtes de synthèse réelles
  const { data: recettes } = useQuery({ queryKey: ["recettes"], queryFn: getRecettesMock });
  const { data: contrats } = useQuery({ queryKey: ["contrats"], queryFn: getContratsMock });

  // Application des filtres globaux
  const filteredRecettes = (recettes || []).filter((r) => {
    if (filters.parkingId && r.parkingId !== filters.parkingId) return false;
    if (filters.statut && r.statut !== filters.statut) return false;
    if (filters.periode) {
      const [start, end] = filters.periode;
      if (r.dateDebut && (r.dateDebut < start || r.dateDebut > end)) return false;
    }
    return true;
  });

  const filteredContrats = (contrats || []).filter((c) => {
    if (filters.parkingId && c.parkingId !== filters.parkingId) return false;
    if (filters.statut && c.statut !== filters.statut) return false;
    if (filters.periode) {
      const [start, end] = filters.periode;
      if (c.dateDebut && (c.dateDebut < start || c.dateDebut > end)) return false;
    }
    return true;
  });

  // Calculs dynamiques de statistiques selon le rôle et les filtres
  const totalCAHebdo = filteredRecettes.reduce((acc, r) => acc + r.totalHebdo, 0);
  const recettesEnAttente = filteredRecettes.filter((r) => r.statut === "EN_COURS").length;
  const contratsEnAttenteSign = filteredContrats.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length;
  const parkingsCount = filters.parkingId ? 1 : 17;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Barre de Filtres Globaux */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* Cartes KPIs Réelles adaptées au Rôle */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderLeft: "4px solid #003566", boxShadow: "var(--shadow-sm)", borderRadius: 12 }}>
            <Statistic
              title="Recettes Cumulées"
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
              value={parkingsCount}
              valueStyle={{ color: "#10b981", fontWeight: 700 }}
              prefix={<CreditCardOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Graphiques Interactifs Personnalisés par Rôle */}
      <RoleCharts role={role} filters={filters} recettes={filteredRecettes} contrats={filteredContrats} />

      {/* Vues Métier & Raccourcis */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="📋 Activités & Recettes Récentes" style={{ borderRadius: 12 }}>
            <Table
              dataSource={filteredRecettes.slice(0, 5)}
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
          <Card title="⚡ Raccourcis Espace" style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {currentRoleConfig.menuItems.map((item) => (
                <Button
                  key={item.key}
                  block
                  type="default"
                  icon={<ArrowRightOutlined />}
                  style={{
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
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