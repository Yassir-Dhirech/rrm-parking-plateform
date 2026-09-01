import React from "react";
import { Card, Row, Col, Progress, Typography, Tag, Tooltip, Space } from "antd";
import {
  BarChartOutlined,
  CreditCardOutlined,
  RiseOutlined,
  PieChartOutlined,
  BankOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  FileDoneOutlined,
  AimOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { type Role } from "../../lib/roleConfig";
import "./RoleCharts.css";

import type { GlobalFilters } from "../ui/GlobalFilterBar";
import type { RecetteHebdoListItem } from "../../features/recettes/types";
import type { ContratListItem } from "../../features/contrats/types";
import type { DemandeListItem } from "../../features/demandes/types";

const { Text, Title } = Typography;

interface RoleChartsProps {
  role: Role;
  filters?: GlobalFilters;
  recettes?: RecetteHebdoListItem[];
  contrats?: ContratListItem[];
  demandes?: DemandeListItem[];
}

export const RoleCharts: React.FC<RoleChartsProps> = ({ role, filters = {}, recettes = [], contrats = [], demandes = [] }) => {
  switch (role) {
    case "AGENT":
      return <AgentCharts filters={filters} demandes={demandes} />;
    case "SUPERVISEUR":
      return <SuperviseurCharts filters={filters} recettes={recettes} />;
    case "RESPONSABLE":
      return <ResponsableCharts filters={filters} recettes={recettes} contrats={contrats} />;
    case "COMPTABLE":
      return <ComptableCharts filters={filters} recettes={recettes} />;
    case "RESP_REPORTING":
      return <ReportingCharts filters={filters} recettes={recettes} />;
    case "ADMIN_SI":
      return <AdminCharts filters={filters} />;
    default:
      return null;
  }
};

/* ====================================================================
   1. AGENT CHARTS
   ==================================================================== */
function AgentCharts({ filters, demandes = [] }: { filters: GlobalFilters; demandes?: DemandeListItem[] }) {
  const soumises = demandes.filter((d) => d.statut === "SOUMISE").length;
  const enPaiement = demandes.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const validees = demandes.filter((d) => d.statut === "VALIDEE" || d.statut === "COMPLETEE").length;
  const total = (soumises + enPaiement + validees) || 1;

  const demandesData = [
    { label: "Nouvelles Demandes à Vérifier (SOUMISE)", count: soumises, color: "#d97706", percent: Math.round((soumises / total) * 100) },
    { label: "Paiements Enregistrés / En Attente Encodage", count: enPaiement, color: "#2563eb", percent: Math.round((enPaiement / total) * 100) },
    { label: "Dossiers Validés & Badges Livrés", count: validees, color: "#10b981", percent: Math.round((validees / total) * 100) },
  ];

  const cartesData = [
    { type: "Cartes Actives en Circulation", val: filters.parkingId ? 85 : 340, total: filters.parkingId ? 100 : 400, color: "#10b981" },
    { type: "Cartes en Attente d'Activation", val: enPaiement || (filters.parkingId ? 10 : 42), total: filters.parkingId ? 100 : 400, color: "#f59e0b" },
    { type: "Cartes Désactivées / Expirées", val: filters.parkingId ? 5 : 18, total: filters.parkingId ? 100 : 400, color: "#ef4444" },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<Space><BarChartOutlined /><span>Suivi Opérationnel & Traitement des Demandes</span></Space>} className="chart-card">
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
        <Card title={<Space><CreditCardOutlined /><span>État des Cartes d'Accès Physiques</span></Space>} className="chart-card">
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
function SuperviseurCharts({ filters, recettes }: { filters: GlobalFilters; recettes: RecetteHebdoListItem[] }) {
  const baseTotal = recettes.reduce((acc, r) => acc + r.totalHebdo, 0);
  const factor = recettes.length > 0 ? baseTotal / 80900 : filters.parkingId ? 0.5 : 1;

  const weeklyData = [
    { day: "Lun", total: Math.round(6000 * factor), color: "#003566" },
    { day: "Mar", total: Math.round(7200 * factor), color: "#003566" },
    { day: "Mer", total: Math.round(8100 * factor), color: "#003566" },
    { day: "Jeu", total: Math.round(6500 * factor), color: "#003566" },
    { day: "Ven", total: Math.round(9400 * factor), color: "#10b981" },
    { day: "Sam", total: Math.round(5200 * factor), color: "#003566" },
    { day: "Dim", total: Math.round(4100 * factor), color: "#003566" },
  ];

  const maxVal = Math.max(...weeklyData.map((d) => d.total), 1);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title={<Space><RiseOutlined /><span>Évolution des Recettes Quotidiennes (Semaine 32)</span></Space>} className="chart-card">
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
        <Card title={<Space><PieChartOutlined /><span>Distribution des Abonnements Supervisés</span></Space>} className="chart-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>Abonnements Actifs ({filters.parkingId ? 35 : 142})</Text>
                <Text strong style={{ color: "#10b981" }}>71%</Text>
              </div>
              <Progress percent={71} strokeColor="#10b981" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>En Attente de Validation ({filters.parkingId ? 9 : 38})</Text>
                <Text strong style={{ color: "#f59e0b" }}>19%</Text>
              </div>
              <Progress percent={19} strokeColor="#f59e0b" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>Expirants sous 7 jours ({filters.parkingId ? 5 : 20})</Text>
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
function ResponsableCharts({ filters, contrats }: { filters: GlobalFilters; recettes: RecetteHebdoListItem[]; contrats: ContratListItem[] }) {
  let parkingsRecettes = [
    { id: 3, name: "Parking Bab El Had", ca: 145000, target: 150000 },
    { id: 1, name: "Parking Agdal Gare", ca: 182000, target: 175000 },
    { id: 4, name: "Parking Chellah", ca: 98000, target: 100000 },
    { id: 2, name: "Parking Hassan II", ca: 124000, target: 120000 },
  ];

  if (filters.parkingId) {
    parkingsRecettes = parkingsRecettes.filter((p) => p.id === filters.parkingId);
  }

  const countPending = contrats.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length;
  const countSigned = contrats.filter((c) => c.statut === "SIGNE").length;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title={<Space><BankOutlined /><span>Chiffre d'Affaires par Site & Performance vs Objectif</span></Space>} className="chart-card">
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
        <Card title={<Space><FileTextOutlined /><span>Pipeline des Contrats & Signatures</span></Space>} className="chart-card">
          <div className="pipeline-container">
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#3b82f6" }}>12</span>
              <div>
                <Text strong>Contrats en Rédaction</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>Étape initiale</Text></div>
              </div>
            </div>
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#f59e0b" }}>{countPending || 5}</span>
              <div>
                <Text strong style={{ color: "#d97706" }}>En Attente de Signature</Text>
                <div><Text type="secondary" style={{ fontSize: 12 }}>Action requise</Text></div>
              </div>
            </div>
            <div className="pipeline-step">
              <span className="step-badge" style={{ background: "#10b981" }}>{countSigned || 88}</span>
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
function ComptableCharts({ recettes }: { filters: GlobalFilters; recettes: RecetteHebdoListItem[] }) {
  const total = recettes.reduce((acc, r) => acc + r.totalHebdo, 0) || 258700;
  const modesPaiement = [
    { mode: "Carte Bancaire / TPE", montant: Math.round(total * 0.60), percent: 60, color: "#003566" },
    { mode: "Espèces (Guichet)", montant: Math.round(total * 0.25), percent: 25, color: "#10b981" },
    { mode: "Chèques Certifiés", montant: Math.round(total * 0.15), percent: 15, color: "#d97706" },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<Space><PayCircleOutlined /><span>Ventilation des Encaissements par Mode de Paiement</span></Space>} className="chart-card">
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
        <Card title={<Space><FileDoneOutlined /><span>Statut de Règlement des Factures Émises</span></Space>} className="chart-card">
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
function ReportingCharts({ filters }: { filters: GlobalFilters; recettes: RecetteHebdoListItem[] }) {
  let parkingsComparison = [
    { id: 1, name: "Agdal Gare", ca: 182, capacity: "450 places", occ: 92 },
    { id: 3, name: "Bab El Had", ca: 145, capacity: "320 places", occ: 88 },
    { id: 2, name: "Hassan II", ca: 124, capacity: "280 places", occ: 79 },
    { id: 4, name: "Chellah", ca: 98, capacity: "200 places", occ: 84 },
    { id: 5, name: "Rabat Ville", ca: 160, capacity: "350 places", occ: 95 },
  ];

  if (filters.parkingId) {
    parkingsComparison = parkingsComparison.filter((p) => p.id === filters.parkingId);
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title={<Space><BarChartOutlined /><span>Comparatif des Recettes (kMAD) & Taux d'Occupation par Site</span></Space>} className="chart-card">
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
        <Card title={<Space><AimOutlined /><span>Taux de Remplissage Global</span></Space>} className="chart-card">
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <Progress type="dashboard" percent={87} strokeColor="#003566" width={140} />
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ fontSize: 15 }}>{filters.parkingId ? "1 Parking Sélectionné" : "17 Parkings Actifs"}</Text>
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
function AdminCharts({ filters }: { filters: GlobalFilters }) {
  const auditLogs = [
    { type: "CONNEXION (AUTH)", count: filters.statut ? 120 : 245, color: "#10b981" },
    { type: "CRÉATION (CREATE)", count: filters.statut ? 40 : 84, color: "#3b82f6" },
    { type: "MODIFICATION (UPDATE)", count: filters.statut ? 60 : 120, color: "#f59e0b" },
    { type: "SUPPRESSION (DELETE)", count: filters.statut ? 2 : 6, color: "#ef4444" },
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
        <Card title={<Space><SafetyCertificateOutlined /><span>Volume d'Événements d'Audit (Dernières 24h)</span></Space>} className="chart-card">
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
        <Card title={<Space><TeamOutlined /><span>Répartition des Comptes Utilisateurs par Rôle</span></Space>} className="chart-card">
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
