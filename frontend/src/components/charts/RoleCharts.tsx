import React from "react";
import { Card, Row, Col, Progress, Typography, Tag, Tooltip } from "antd";
import { type Role } from "../../lib/roleConfig";
import "./RoleCharts.css";

const { Text, Title } = Typography;

interface RoleChartsProps {
  role: Role;
}

export const RoleCharts: React.FC<RoleChartsProps> = ({ role }) => {
  switch (role) {
    case "AGENT":
      return <AgentCharts />;
    case "SUPERVISEUR":
      return <SuperviseurCharts />;
    case "RESPONSABLE":
      return <ResponsableCharts />;
    case "COMPTABLE":
      return <ComptableCharts />;
    case "RESP_REPORTING":
      return <ReportingCharts />;
    case "ADMIN_SI":
      return <AdminCharts />;
    default:
      return null;
  }
};

/* ====================================================================
   1. AGENT CHARTS
   ==================================================================== */
function AgentCharts() {
  const demandesData = [
    { label: "Soumises (Nouvelles)", count: 14, color: "#d97706", percent: 45 },
    { label: "En cours d'instruction", count: 8, color: "#3b82f6", percent: 26 },
    { label: "Validées / Finalisées", count: 9, color: "#10b981", percent: 29 },
  ];

  const cartesData = [
    { type: "Cartes Actives en Circulation", val: 340, total: 400, color: "#10b981" },
    { type: "Cartes en Attente d'Activation", val: 42, total: 400, color: "#f59e0b" },
    { type: "Cartes Désactivées / Expirées", val: 18, total: 400, color: "#ef4444" },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="📊 Progression du Traitement des Demandes (Aujourd'hui)" className="chart-card">
          <div className="bar-chart-container">
            {demandesData.map((d) => (
              <div key={d.label} className="bar-chart-item">
                <div className="bar-chart-header">
                  <Text strong>{d.label}</Text>
                  <Text strong style={{ color: d.color }}>{d.count} demandes</Text>
                </div>
                <Progress percent={d.percent} strokeColor={d.color} status="active" />
              </div>
            ))}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="💳 État des Cartes d'Accès Physiques" className="chart-card">
          <div className="cards-stat-grid">
            {cartesData.map((c) => (
              <div key={c.type} className="cards-stat-item" style={{ borderColor: c.color }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{c.type}</Text>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <Title level={4} style={{ margin: 0, color: c.color }}>{c.val}</Title>
                  <Tag color={c.color === "#10b981" ? "green" : c.color === "#f59e0b" ? "orange" : "red"}>
                    {Math.round((c.val / c.total) * 100)}%
                  </Tag>
                </div>
                <Progress percent={Math.round((c.val / c.total) * 100)} strokeColor={c.color} showInfo={false} size="small" style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ====================================================================
   2. SUPERVISEUR CHARTS
   ==================================================================== */
function SuperviseurCharts() {
  const weeklyData = [
    { day: "Lun", total: 6000, color: "#003566" },
    { day: "Mar", total: 7200, color: "#003566" },
    { day: "Mer", total: 8100, color: "#003566" },
    { day: "Jeu", total: 6500, color: "#003566" },
    { day: "Ven", total: 9400, color: "#10b981" },
    { day: "Sam", total: 5200, color: "#003566" },
    { day: "Dim", total: 4100, color: "#003566" },
  ];

  const maxVal = Math.max(...weeklyData.map((d) => d.total));

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title="📈 Évolution des Recettes Quotidiennes (Semaine 32)" className="chart-card">
          <div className="visual-bar-chart">
            {weeklyData.map((item) => {
              const heightPercent = Math.round((item.total / maxVal) * 100);
              return (
                <div key={item.day} className="v-bar-col">
                  <div className="v-bar-val">{(item.total / 1000).toFixed(1)}k</div>
                  <div className="v-bar-track">
                    <Tooltip title={`${item.day}: ${item.total.toLocaleString("fr-FR")} MAD`}>
                      <div className="v-bar-fill" style={{ height: `${heightPercent}%`, backgroundColor: item.color }} />
                    </Tooltip>
                  </div>
                  <div className="v-bar-label">{item.day}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card title="📋 Distribution des Abonnements Supervisés" className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>Abonnements Actifs (142)</Text>
                <Text strong style={{ color: "#10b981" }}>71%</Text>
              </div>
              <Progress percent={71} strokeColor="#10b981" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>En Attente de Validation (38)</Text>
                <Text strong style={{ color: "#f59e0b" }}>19%</Text>
              </div>
              <Progress percent={19} strokeColor="#f59e0b" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>Expirants sous 7 jours (20)</Text>
                <Text strong style={{ color: "#ef4444" }}>10%</Text>
              </div>
              <Progress percent={10} strokeColor="#ef4444" />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ====================================================================
   3. RESPONSABLE CHARTS
   ==================================================================== */
function ResponsableCharts() {
  const parkingsRecettes = [
    { name: "Parking Bab El Had", ca: 145000, target: 150000 },
    { name: "Parking Agdal Gare", ca: 182000, target: 175000 },
    { name: "Parking Chellah", ca: 98000, target: 100000 },
    { name: "Parking Hassan II", ca: 124000, target: 120000 },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title="🏢 Chiffre d'Affaires par Site & Performance vs Objectif" className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {parkingsRecettes.map((p) => {
              const ratio = Math.round((p.ca / p.target) * 100);
              const color = ratio >= 100 ? "#10b981" : "#f59e0b";
              return (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text strong>{p.name}</Text>
                    <Text strong style={{ color }}>{p.ca.toLocaleString("fr-FR")} MAD ({ratio}% de l'objectif)</Text>
                  </div>
                  <Progress percent={Math.min(ratio, 100)} strokeColor={color} />
                </div>
              );
            })}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card title="✍️ Pipeline des Contrats & Signatures" className="chart-card">
          <div className="pipeline-container">
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#3b82f6" }}>12</span>
              <div>
                <Text strong>Contrats en Rédaction</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>Étape initiale</Text></div>
              </div>
            </div>
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#f59e0b" }}>5</span>
              <div>
                <Text strong style={{ color: "#d97706" }}>En Attente de Signature</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>Action requise</Text></div>
              </div>
            </div>
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#10b981" }}>88</span>
              <div>
                <Text strong>Contrats Signés & Valides</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>En cours d'exécution</Text></div>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ====================================================================
   4. COMPTABLE CHARTS
   ==================================================================== */
function ComptableCharts() {
  const modesPaiement = [
    { mode: "Carte Bancaire / TPE", montant: 142500, percent: 55, color: "#003566" },
    { mode: "Espèces (Guichet)", montant: 85200, percent: 33, color: "#10b981" },
    { mode: "Virement Bancaire (Entreprises)", montant: 31000, percent: 12, color: "#982B5E" },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="💳 Ventilation des Encaissements par Mode de Paiement" className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {modesPaiement.map((m) => (
              <div key={m.mode}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text strong>{m.mode}</Text>
                  <Text strong style={{ color: m.color }}>
                    {m.montant.toLocaleString("fr-FR")} MAD ({m.percent}%)
                  </Text>
                </div>
                <Progress percent={m.percent} strokeColor={m.color} />
              </div>
            ))}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="📄 Statut de Règlement des Factures Émises" className="chart-card">
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col span={8}>
              <div className="compact-stat-box" style={{ background: "#ecfdf5", borderColor: "#10b981" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Payées</Text>
                <Title level={3} style={{ margin: 0, color: "#059669" }}>84%</Title>
                <Text style={{ fontSize: 11, color: "#047857" }}>124 Factures</Text>
              </div>
            </Col>

            <Col span={8}>
              <div className="compact-stat-box" style={{ background: "#fffbeb", borderColor: "#f59e0b" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>En Attente</Text>
                <Title level={3} style={{ margin: 0, color: "#d97706" }}>12%</Title>
                <Text style={{ fontSize: 11, color: "#b45309" }}>18 Factures</Text>
              </div>
            </Col>

            <Col span={8}>
              <div className="compact-stat-box" style={{ background: "#fef2f2", borderColor: "#ef4444" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>En Retard</Text>
                <Title level={3} style={{ margin: 0, color: "#dc2626" }}>4%</Title>
                <Text style={{ fontSize: 11, color: "#b91c1c" }}>6 Factures</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

/* ====================================================================
   5. RESP_REPORTING CHARTS
   ==================================================================== */
function ReportingCharts() {
  const parkingsComparison = [
    { name: "Agdal Gare", ca: 182, capacity: "450 places", occ: 92 },
    { name: "Bab El Had", ca: 145, capacity: "320 places", occ: 88 },
    { name: "Hassan II", ca: 124, capacity: "280 places", occ: 79 },
    { name: "Chellah", ca: 98, capacity: "200 places", occ: 84 },
    { name: "Rabat Ville", ca: 160, capacity: "350 places", occ: 95 },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title="📊 Comparatif des Recettes (kMAD) & Taux d'Occupation par Site" className="chart-card">
          <div className="visual-bar-chart" style={{ height: 210 }}>
            {parkingsComparison.map((p) => (
              <div key={p.name} className="v-bar-col">
                <div className="v-bar-val">{p.ca} kMAD</div>
                <div className="v-bar-track">
                  <Tooltip title={`${p.name}: ${p.ca} 000 MAD (${p.occ}% occupation)`}>
                    <div className="v-bar-fill" style={{ height: `${(p.ca / 200) * 100}%`, backgroundColor: p.occ > 90 ? "#982B5E" : "#003566" }} />
                  </Tooltip>
                </div>
                <div className="v-bar-label">{p.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="🎯 Taux de Remplissage Global" className="chart-card">
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <Progress type="dashboard" percent={87} strokeColor="#003566" width={140} />
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ fontSize: 15 }}>17 Parkings Actifs</Text>
              <div><Text type="secondary">3 850 / 4 400 places occupées</Text></div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

/* ====================================================================
   6. ADMIN_SI CHARTS
   ==================================================================== */
function AdminCharts() {
  const auditLogs = [
    { type: "CONNEXION (AUTH)", count: 245, color: "#10b981" },
    { type: "CRÉATION (CREATE)", count: 84, color: "#3b82f6" },
    { type: "MODIFICATION (UPDATE)", count: 120, color: "#f59e0b" },
    { type: "SUPPRESSION (DELETE)", count: 6, color: "#ef4444" },
  ];

  const rolesUser = [
    { role: "Agents de Guichet", count: 24, percent: 40 },
    { role: "Superviseurs", count: 8, percent: 13 },
    { role: "Responsables Métier", count: 6, percent: 10 },
    { role: "Comptables", count: 4, percent: 7 },
    { role: "Administrateurs SI", count: 3, percent: 5 },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="🛡️ Volume d'Événements d'Audit (Dernières 24h)" className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {auditLogs.map((a) => (
              <div key={a.type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text strong>{a.type}</Text>
                  <Tag color={a.color}>{a.count} actions</Tag>
                </div>
                <Progress percent={Math.round((a.count / 245) * 100)} strokeColor={a.color} showInfo={false} />
              </div>
            ))}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="👥 Répartition des Comptes Utilisateurs par Rôle" className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rolesUser.map((r) => (
              <div key={r.role}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text>{r.role}</Text>
                  <Text strong style={{ color: "#003566" }}>{r.count} comptes</Text>
                </div>
                <Progress percent={r.percent} strokeColor="#003566" />
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
