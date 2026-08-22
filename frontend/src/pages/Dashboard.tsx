import { useState } from "react";
import { Row, Col, Card, Statistic, Table, Button, Space, Tag, Progress } from "antd";
import {
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  UserOutlined,
  ReloadOutlined,
  AuditOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig, type Role } from "../lib/roleConfig";
import { GlobalFilterBar, type GlobalFilters } from "../components/ui/GlobalFilterBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { RoleCharts } from "../components/charts/RoleCharts";
import { getRecettesMock } from "../api/recettesMock";
import { getContratsMock } from "../api/contratsMock";
import { getDemandesMock } from "../api/demandesMock";
import { getParkingsMock } from "../api/adminMock";

export function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GlobalFilters>({});

  if (!role) return null;

  const currentRoleConfig = roleConfig[role];
  const basePath = currentRoleConfig.homePath;

  // Requêtes de synthèse réelles
  const { data: recettes = [] } = useQuery({ queryKey: ["recettes"], queryFn: getRecettesMock });
  const { data: contrats = [] } = useQuery({ queryKey: ["contrats"], queryFn: getContratsMock });
  const { data: demandes = [] } = useQuery({ queryKey: ["demandes"], queryFn: getDemandesMock });
  const { data: parkingsList = [] } = useQuery({ queryKey: ["admin_parkings"], queryFn: getParkingsMock });

  const filteredParkings = parkingsList.filter((p) => {
    if (filters.parkingId && p.id !== filters.parkingId) return false;
    return true;
  });

  // Application des filtres globaux
  const filteredRecettes = recettes.filter((r) => {
    if (filters.parkingId && r.parkingId !== filters.parkingId) return false;
    if (filters.statut && r.statut !== filters.statut) return false;
    if (filters.periode) {
      const [start, end] = filters.periode;
      if (r.dateDebut && (r.dateDebut < start || r.dateDebut > end)) return false;
    }
    return true;
  });

  const filteredContrats = contrats.filter((c) => {
    if (filters.parkingId && c.parkingId !== filters.parkingId) return false;
    if (filters.statut && c.statut !== filters.statut) return false;
    if (filters.periode) {
      const [start, end] = filters.periode;
      if (c.dateDebut && (c.dateDebut < start || c.dateDebut > end)) return false;
    }
    return true;
  });

  const filteredDemandes = demandes.filter((d) => {
    if (filters.statut && d.statut !== filters.statut) return false;
    return true;
  });

  // Calculs dynamiques de statistiques
  const totalCAHebdo = filteredRecettes.reduce((acc, r) => acc + r.totalHebdo, 0);
  const recettesEnAttente = filteredRecettes.filter((r) => r.statut === "EN_COURS").length;
  const contratsEnAttenteSign = filteredContrats.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length;
  const demandesSoumises = filteredDemandes.filter((d) => d.statut === "SOUMISE").length;
  const demandesPaiementEnregistre = filteredDemandes.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const parkingsCount = filters.parkingId ? 1 : 17;

  // Cartes KPIs Personnalisées par Rôle
  const getRoleKpis = (currentRole: Role) => {
    switch (currentRole) {
      case "AGENT":
        return [
          { title: "Demandes à Encaisser Guichet", value: demandesSoumises, prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Encaissements Guichet (Aujourd'hui)", value: 4850, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Cartes d'Accès à Délivrer", value: filters.parkingId ? 4 : 12, prefix: <CreditCardOutlined />, color: "#2563eb" },
          { title: "Demandes Traitées Aujourd'hui", value: filters.parkingId ? 6 : 18, prefix: <CheckCircleOutlined />, color: "#003566" },
        ];
      case "SUPERVISEUR":
        return [
          { title: "Dossiers à Valider (Conformité)", value: demandesPaiementEnregistre, prefix: <SafetyCertificateOutlined />, color: "#2563eb" },
          { title: "Recettes Hebdo à Valider", value: recettesEnAttente, prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Cartes d'Accès à Activer", value: filters.parkingId ? 10 : 42, prefix: <CreditCardOutlined />, color: "#982B5E" },
          { title: "Taux de Conformité Dossiers", value: 96.4, suffix: "%", prefix: <CheckCircleOutlined />, color: "#10b981" },
        ];
      case "RESPONSABLE":
        return [
          { title: "CA Mensuel Cumulé", value: totalCAHebdo || 548000, suffix: "MAD", prefix: <DollarOutlined />, color: "#003566" },
          { title: "Contrats Corporate à Signer", value: contratsEnAttenteSign, prefix: <FileTextOutlined />, color: "#982B5E" },
          { title: "Taux d'Occupation Global", value: 87.5, suffix: "%", prefix: <DashboardOutlined />, color: "#10b981" },
          { title: "Parkings en Exploitation", value: parkingsCount, prefix: <CreditCardOutlined />, color: "#2563eb" },
        ];
      case "COMPTABLE":
        return [
          { title: "Encaissements du Jour", value: 24500, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Factures en Retard / À Recouvrer", value: 6, prefix: <ExclamationCircleOutlined />, color: "#ef4444" },
          { title: "Recettes à Rapprocher", value: recettesEnAttente, prefix: <CheckCircleOutlined />, color: "#d97706" },
          { title: "Montant Chèques en Caisse", value: 14200, suffix: "MAD", prefix: <BankOutlined />, color: "#003566" },
        ];
      case "RESP_REPORTING":
        return [
          { title: "Taux de Remplissage Global", value: 87, suffix: "%", prefix: <DashboardOutlined />, color: "#003566" },
          { title: "CA Total Cumulé", value: totalCAHebdo || 689000, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Abonnés Actifs Total", value: filters.parkingId ? 150 : 3850, prefix: <UserOutlined />, color: "#2563eb" },
          { title: "Taux de Renouvellement", value: 91.2, suffix: "%", prefix: <ReloadOutlined />, color: "#982B5E" },
        ];
      case "ADMIN_SI":
        return [
          { title: "Événements d'Audit (24h)", value: 455, prefix: <AuditOutlined />, color: "#3b82f6" },
          { title: "Comptes Utilisateurs Actifs", value: 45, prefix: <UserOutlined />, color: "#10b981" },
          { title: "Parkings Configurés", value: parkingsCount, prefix: <CreditCardOutlined />, color: "#003566" },
          { title: "Disponibilité Système", value: 99.98, suffix: "%", prefix: <CheckCircleOutlined />, color: "#10b981" },
        ];
      default:
        return [];
    }
  };

  const kpis = getRoleKpis(role);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Barre de Filtres Globaux */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* Cartes KPIs Spécifiques au Rôle Connecté */}
      <Row gutter={[16, 16]}>
        {kpis.map((kpi) => (
          <Col key={kpi.title} xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderLeft: `4px solid ${kpi.color}`,
                boxShadow: "var(--shadow-sm)",
                borderRadius: 12,
              }}
            >
              <Statistic
                title={kpi.title}
                value={kpi.value}
                suffix={kpi.suffix}
                precision={kpi.suffix === "%" ? 1 : 0}
                valueStyle={{ color: kpi.color, fontWeight: 700 }}
                prefix={kpi.prefix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Graphiques Interactifs Personnalisés par Rôle */}
      <RoleCharts role={role} filters={filters} recettes={filteredRecettes} contrats={filteredContrats} />

      {/* Section Disponibilité & Places Libres des Abonnements par Parking */}
      {(role === "AGENT" || role === "SUPERVISEUR" || role === "RESPONSABLE") && (
        <Card
          title={
            <Space>
              <PieChartOutlined style={{ color: "#0284c7" }} />
              <span>Places Libres d'Abonnements par Parking (Temps Réel)</span>
            </Space>
          }
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={filteredParkings}
            rowKey="id"
            pagination={false}
            size="middle"
            columns={[
              {
                title: "Parking & Code",
                key: "parking",
                render: (_, record) => (
                  <div>
                    <strong style={{ fontSize: 14 }}>{record.nom}</strong>
                    <Space style={{ marginTop: 2, display: "block" }}>
                      <Tag color="blue" style={{ fontSize: 11, fontWeight: 600 }}>{record.code}</Tag>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{record.adresse}</span>
                    </Space>
                  </div>
                ),
              },
              {
                title: "Places Libres — Particuliers (Normal)",
                key: "dispoParticulier",
                render: (_, record) => {
                  const libres = record.placesRestantesParticulier ?? 0;
                  const totalQuota = record.quotaParticulier ?? 90;
                  const occup = record.abonnementsParticulierActifs ?? 0;
                  const pctOccup = Math.round((occup / (totalQuota || 1)) * 100);
                  const colorTag = libres === 0 ? "red" : libres <= 10 ? "gold" : "green";

                  return (
                    <div style={{ maxWidth: 220 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <Tag color={colorTag} style={{ fontWeight: 700, fontSize: 12.5 }}>
                          <UserOutlined style={{ marginRight: 4 }} /> {libres} places libres
                        </Tag>
                        <span style={{ fontSize: 11.5, color: "#475569" }}>Quota: {totalQuota}</span>
                      </div>
                      <Progress percent={pctOccup} size="small" strokeColor={libres === 0 ? "#ef4444" : "#0284c7"} />
                    </div>
                  );
                },
              },
              {
                title: "Places Libres — Corporate (Flottes)",
                key: "dispoCorporate",
                render: (_, record) => {
                  const libres = record.placesRestantesCorporate ?? 0;
                  const totalQuota = record.quotaCorporate ?? 135;
                  const occup = record.abonnementsCorporateActifs ?? 0;
                  const pctOccup = Math.round((occup / (totalQuota || 1)) * 100);
                  const colorTag = libres === 0 ? "red" : libres <= 10 ? "gold" : "purple";

                  return (
                    <div style={{ maxWidth: 220 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <Tag color={colorTag} style={{ fontWeight: 700, fontSize: 12.5 }}>
                          <BankOutlined style={{ marginRight: 4 }} /> {libres} places libres
                        </Tag>
                        <span style={{ fontSize: 11.5, color: "#475569" }}>Quota: {totalQuota}</span>
                      </div>
                      <Progress percent={pctOccup} size="small" strokeColor={libres === 0 ? "#ef4444" : "#9333ea"} />
                    </div>
                  );
                },
              },
              {
                title: "Statut d'Accès",
                key: "statut",
                render: (_, record) => {
                  if (!record.actif) return <Tag color="red">Désactivé</Tag>;
                  if (record.verrouille) return <Tag color="volcano">Sous Maintenance</Tag>;
                  return <Tag color="green">Disponible</Tag>;
                },
              },
            ]}
          />
        </Card>
      )}

      {/* Vues Métier & Raccourcis Spécifiques */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>
                  {role === "AGENT" || role === "SUPERVISEUR"
                    ? "Demandes d'Abonnement Récentes à Traiter"
                    : "Activités & Recettes Récentes"}
                </span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            {role === "AGENT" || role === "SUPERVISEUR" ? (
              <Table
                dataSource={filteredDemandes.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                onRow={(record) => ({
                  onClick: () => navigate(`${basePath}/demandes/${record.id}`),
                  style: { cursor: "pointer" },
                })}
                columns={[
                  { title: "Référence", dataIndex: "reference", key: "reference" },
                  { title: "Client", dataIndex: "clientNom", key: "clientNom" },
                  { title: "Parking", dataIndex: "parkingNom", key: "parkingNom" },
                  { title: "Date Soumission", dataIndex: "dateCreation", key: "dateCreation" },
                  {
                    title: "Statut Traitement",
                    dataIndex: "statut",
                    key: "statut",
                    render: (s) => <StatusBadge statut={s} />,
                  },
                ]}
              />
            ) : (
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
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                <span>Raccourcis Espace Métier</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
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