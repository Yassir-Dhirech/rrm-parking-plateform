import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Typography, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getSlaPerformanceStatsMock, getDemandesMock } from "../../../api/demandesMock";
import { formatDate } from "../../../lib/dateUtils";

const { Text } = Typography;

export function SlaAuditDashboard() {
  const { data: slaStats, isLoading: loadingStats } = useQuery({
    queryKey: ["sla_performance_stats"],
    queryFn: getSlaPerformanceStatsMock,
  });

  const { data: demandesList = [], isLoading: loadingDemandes } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  if (loadingStats || loadingDemandes) return <Card loading />;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Overview KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
            <Statistic
              title={<span style={{ color: "#0369a1", fontWeight: 600 }}>Durée Moyenne de Traitement</span>}
              value={slaStats?.dureeMoyenneJours || 1.6}
              suffix="Jours"
              prefix={<ClockCircleOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ color: "#0284c7", fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Délai maximal contractuel : 7 Jours</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <Statistic
              title={<span style={{ color: "#15803d", fontWeight: 600 }}>Taux de Respect SLA — 7 Jours</span>}
              value={slaStats?.tauxRespectSla || 96}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#16a34a", fontWeight: 700 }}
            />
            <Progress percent={slaStats?.tauxRespectSla || 96} size="small" strokeColor="#16a34a" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
            <Statistic
              title={<span style={{ color: "#6b21a8", fontWeight: 600 }}>Demandes Traitées ce Mois</span>}
              value={slaStats?.demandesTraitees || 44}
              prefix={<ThunderboltOutlined style={{ color: "#9333ea" }} />}
              valueStyle={{ color: "#9333ea", fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Par Agents & Superviseurs</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, backgroundColor: "#fff1f2", borderColor: "#fecdd3" }}>
            <Statistic
              title={<span style={{ color: "#9f1239", fontWeight: 600 }}>Demandes en Alerte SLA</span>}
              value={slaStats?.demandesEnAlerte || 2}
              prefix={<AlertOutlined style={{ color: "#e11d48" }} />}
              valueStyle={{ color: "#e11d48", fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Proches de l'échéance 7j ou dépassées</Text>
          </Card>
        </Col>
      </Row>

      {/* Table 1: Performance par Intervenant */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: "#0284c7" }} />
            <span>Tableau d'Audit & Performance par Intervenant</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={slaStats?.agentsPerformance || []}
          rowKey="agentNom"
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Intervenant Traitant",
              dataIndex: "agentNom",
              key: "agentNom",
              render: (name: string, record) => (
                <Space>
                  {record.role === "SUPERVISEUR" ? (
                    <Tag color="teal"><SafetyCertificateOutlined style={{ marginRight: 4 }} /> Superviseur</Tag>
                  ) : (
                    <Tag color="blue"><UserOutlined style={{ marginRight: 4 }} /> Agent</Tag>
                  )}
                  <strong style={{ fontSize: 14 }}>{name}</strong>
                </Space>
              ),
            },
            {
              title: "Volume Traité",
              dataIndex: "totalTraites",
              key: "totalTraites",
              render: (v: number) => <Tag color="purple" style={{ fontWeight: 600 }}>{v} Demandes</Tag>,
            },
            {
              title: "Temps Moyen de Réponse",
              dataIndex: "dureeMoyenneJours",
              key: "dureeMoyenneJours",
              render: (v: number) => <strong style={{ color: "#0369a1" }}>{v} Jours</strong>,
            },
            {
              title: "Respect SLA 7 Jours",
              dataIndex: "tauxDansLesDelais",
              key: "tauxDansLesDelais",
              render: (pct: number) => (
                <div style={{ maxWidth: 160 }}>
                  <Progress percent={pct} size="small" strokeColor={pct >= 90 ? "#16a34a" : "#f59e0b"} />
                </div>
              ),
            },
            {
              title: "Évaluation Performance",
              key: "eval",
              render: (_, record) => {
                if (record.tauxDansLesDelais >= 95) return <Tag color="green">Excellente</Tag>;
                if (record.tauxDansLesDelais >= 85) return <Tag color="blue">Satisfaisante</Tag>;
                return <Tag color="volcano">À Surveiller</Tag>;
              },
            },
          ]}
        />
      </Card>

      {/* Table 2: Traçabilité Individuelle des Demandes avec Compte à Rebours SLA */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: "#9333ea" }} />
            <span>Traçabilité Individuelle des Demandes & Compte à Rebours SLA</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={demandesList}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Référence",
              dataIndex: "reference",
              key: "reference",
              render: (ref: string) => <Tag color="geekblue" style={{ fontWeight: 700 }}>{ref}</Tag>,
            },
            { title: "Client / Souscripteur", dataIndex: "clientNom", key: "clientNom" },
            { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
            { title: "Date Soumission", dataIndex: "dateCreation", key: "dateCreation", render: (d: string) => formatDate(d) },
            {
              title: "Traité Par",
              dataIndex: "traiteParNom",
              key: "traiteParNom",
              render: (t?: string) => t ? <Tag color="cyan">{t}</Tag> : <Tag color="default">En cours d'affectation</Tag>,
            },
            {
              title: "Durée de Traitement",
              dataIndex: "dureeTraitementJours",
              key: "dureeTraitementJours",
              render: (d?: number) => d !== undefined ? <span>{d} Jours</span> : <span style={{ color: "#94a3b8" }}>En cours</span>,
            },
            {
              title: "Délai SLA 7 Jours",
              key: "slaIndicator",
              render: (_, record) => {
                if (record.slaStatut === "DEPASSE") {
                  return <Tag color="red" icon={<ExclamationCircleOutlined />}>Dépassement SLA</Tag>;
                }
                if (record.slaStatut === "ALERT_1_JOUR") {
                  return (
                    <Tooltip title="Plus que 1 jour restant avant expiration du délai contractuel">
                      <Tag color="error" icon={<AlertOutlined />}>URGENT : 1j Restant</Tag>
                    </Tooltip>
                  );
                }
                if (record.slaStatut === "ALERT_3_JOURS") {
                  return <Tag color="warning" icon={<ClockCircleOutlined />}>Alerte : 3j Restants</Tag>;
                }
                return <Tag color="green" icon={<CheckCircleOutlined />}>Dans les Délais</Tag>;
              },
            },
          ]}
        />
      </Card>
    </Space>
  );
}
