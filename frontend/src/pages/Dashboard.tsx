import { useState } from "react";
import { Row, Col, Card, Table, Space, Tag, Progress, Button } from "antd";
import {
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  UserOutlined,
  ReloadOutlined,
  AuditOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  DownloadOutlined,
  ToolOutlined,
  AimOutlined,
  FileDoneOutlined,
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
import { getParkingsMock, getLogsMock } from "../api/adminMock";
import { KpiCard } from "../components/ui/KpiCard";
import { formatDate } from "../lib/dateUtils";
import type { AuditLog } from "../features/admin/types";

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
  const { data: logsList = [] } = useQuery<AuditLog[]>({ queryKey: ["audit_logs"], queryFn: getLogsMock });

  const filteredParkings = parkingsList.filter((p) => {
    if (filters.parkingId && p.id !== filters.parkingId) return false;
    return true;
  });

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
    if (filters.parkingId) {
      const selectedParking = parkingsList.find((p) => p.id === filters.parkingId);
      if (selectedParking && !d.parkingNom.toLowerCase().includes(selectedParking.nom.toLowerCase())) return false;
    }
    if (filters.statut && d.statut !== filters.statut) return false;
    if (filters.periode) {
      const [start, end] = filters.periode;
      if (d.dateCreation && (d.dateCreation < start || d.dateCreation > end)) return false;
    }
    return true;
  });

  // Dynamic metrics calculations
  const totalCAHebdo = filteredRecettes.reduce((acc, r) => acc + r.totalHebdo, 0);
  const recettesCompleted = filteredRecettes.filter((r) => r.statut === "COMPLETED").length;
  const contratsEnAttenteSign = filteredContrats.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length;
  const demandesSoumises = filteredDemandes.filter((d) => d.statut === "SOUMISE").length;
  const demandesPaiementEnregistre = filteredDemandes.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const parkingsCount = filters.parkingId ? 1 : 17;

  // Cartes KPIs Personnalisées par Rôle
  const getRoleKpis = (currentRole: Role) => {
    switch (currentRole) {
      case "AGENT":
        return [
          { title: "Demandes à Vérifier & Encaisser", value: demandesSoumises, prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Encaissements Guichet (Aujourd'hui)", value: 14850, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Cartes d'Accès à Encoder", value: filters.parkingId ? 4 : 8, prefix: <CreditCardOutlined />, color: "#2563eb" },
          { title: "Demandes Traitées (Aujourd'hui)", value: filters.parkingId ? 6 : 18, prefix: <CheckCircleOutlined />, color: "#003566" },
        ];
      case "SUPERVISEUR":
        return [
          { title: "Demandes à Approuver (Final)", value: demandesPaiementEnregistre, prefix: <SafetyCertificateOutlined />, color: "#2563eb" },
          { title: "Cartes d'Accès à Activer", value: filters.parkingId ? 3 : 12, prefix: <CreditCardOutlined />, color: "#9333ea" },
          { title: "Recette Hebdo à Générer", value: 1, suffix: "DÛ", prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Abonnements Actifs vs Quotas", value: 87.5, suffix: "%", prefix: <CheckCircleOutlined />, color: "#10b981" },
        ];
      case "RESPONSABLE":
        return [
          { title: "CA Mensuel Cumulé (+14.2% vs M-1)", value: totalCAHebdo || 548000, suffix: "MAD", prefix: <DollarOutlined />, color: "#003566" },
          { title: "SLA Traitement Moyen (Cible < 24h)", value: "18h 42m", prefix: <AimOutlined />, color: "#10b981" },
          { title: "Contrats Corporate à Signer", value: contratsEnAttenteSign, prefix: <FileTextOutlined />, color: "#982B5E" },
          { title: "Expirations sous 30 jours", value: 42, prefix: <ClockCircleOutlined />, color: "#d97706" },
        ];
      case "COMPTABLE":
        return [
          { title: "Recettes COMPLETED à Passer RECEIVED", value: recettesCompleted || 3, prefix: <ExclamationCircleOutlined />, color: "#d97706" },
          { title: "Encaissements du Jour (Espèces/Chèque)", value: 24500, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Montant Chèques en Caisse", value: 14200, suffix: "MAD", prefix: <BankOutlined />, color: "#003566" },
          { title: "Factures Impayées / En Attente", value: 6, prefix: <FileDoneOutlined />, color: "#ef4444" },
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
          { title: "Comptes Utilisateurs Actifs", value: 45, prefix: <UserOutlined />, color: "#10b981" },
          { title: "Scanners RFID & Barrières Connectés", value: `${parkingsCount}/${parkingsCount}`, prefix: <ToolOutlined />, color: "#003566" },
          { title: "Événements d'Audit (24h)", value: 455, prefix: <AuditOutlined />, color: "#3b82f6" },
          { title: "Disponibilité Système", value: 99.98, suffix: "%", prefix: <CheckCircleOutlined />, color: "#10b981" },
        ];
      default:
        return [];
    }
  };

  const kpis = getRoleKpis(role);

  return (
    <div className="space-y-6">
      {/* Barre de Filtres Globaux */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* -------------------------------------------------------------
         1. AGENT DASHBOARD VIEW (Action Items / To-Do List First)
         ------------------------------------------------------------- */}
      {role === "AGENT" && (
        <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-gradient-to-r from-slate-900 via-secondary to-slate-800 text-white overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <Tag color="gold" className="font-extrabold uppercase px-3 py-0.5 rounded-full border-none">
                File de Travail Guichet (Prioritaire)
              </Tag>
              <h3 className="text-lg md:text-xl font-black text-white m-0 mt-2">
                14 Demandes en attente de vérification & encaissement
              </h3>
              <p className="text-slate-300 text-xs mt-1 mb-0 font-medium">
                Vérifiez les pièces justificatives (CIN/Carte Grise) et enregistrez les paiements au guichet.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="primary"
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={() => navigate(`${basePath}/demandes`)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black border-none rounded-xl"
              >
                Traiter les Demandes
              </Button>
              <Button
                size="large"
                icon={<CreditCardOutlined />}
                onClick={() => navigate(`${basePath}/cartes`)}
                className="bg-white/10 hover:bg-white/20 text-white font-extrabold border-white/20 rounded-xl"
              >
                Encoder Badge RFID
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* -------------------------------------------------------------
         2. COMPTABLE DASHBOARD VIEW (Prominent Completed Recettes Card)
         ------------------------------------------------------------- */}
      {role === "COMPTABLE" && (
        <Card className="border border-amber-300 bg-amber-50/70 shadow-lg rounded-2xl p-2 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                <ExclamationCircleOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                    Action Exclusive Comptable (Haute Priorité)
                  </span>
                  <Tag color="volcano" className="font-extrabold px-2 py-0.5 rounded-full border-none">
                    COMPLETED ➔ RECEIVED
                  </Tag>
                </div>
                <h3 className="text-xl font-black text-slate-900 m-0 mt-1">
                  {recettesCompleted || 3} Recettes Hebdomadaires en Attente de Réception Physique
                </h3>
                <p className="text-slate-600 text-xs mt-1 mb-0 font-medium">
                  Superviseurs ont soumis ces recettes. Procédez au rapprochement des enveloppes espèces & chèques pour basculer en <strong className="text-emerald-700">RECEIVED</strong>.
                </p>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => navigate(`${basePath}/recettes`)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black border-none rounded-xl shadow-md shrink-0"
            >
              Vérifier & Encaisser les Recettes
            </Button>
          </div>
        </Card>
      )}

      {/* -------------------------------------------------------------
         3. SUPERVISEUR DASHBOARD VIEW (Weekly Recette Due Alert & Action Cards)
         ------------------------------------------------------------- */}
      {role === "SUPERVISEUR" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-blue-200 bg-blue-50/60 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-blue-700 font-extrabold uppercase tracking-wider block">
                  Validation Finale
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none block mt-1">
                  {demandesPaiementEnregistre} Dossiers
                </span>
                <p className="text-[11px] text-slate-500 mt-1 mb-0 font-semibold">En attente de validation supervisor</p>
              </div>
              <Button size="small" type="primary" onClick={() => navigate(`${basePath}/demandes`)} className="rounded-lg font-bold">
                Examiner
              </Button>
            </div>
          </Card>

          <Card className="border border-purple-200 bg-purple-50/60 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-purple-700 font-extrabold uppercase tracking-wider block">
                  Activation Cartes
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none block mt-1">
                  12 Badges
                </span>
                <p className="text-[11px] text-slate-500 mt-1 mb-0 font-semibold">Prêtes à être activées</p>
              </div>
              <Button size="small" type="primary" onClick={() => navigate(`${basePath}/cartes`)} className="rounded-lg font-bold bg-purple-600 border-none">
                Activer
              </Button>
            </div>
          </Card>

          <Card className="border border-amber-200 bg-amber-50/60 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wider block">
                  Recette Semaine S34
                </span>
                <span className="text-2xl font-black text-amber-600 leading-none block mt-1">
                  Génération Dû
                </span>
                <p className="text-[11px] text-slate-500 mt-1 mb-0 font-semibold">Clôture hebdomadaire requise</p>
              </div>
              <Button size="small" type="primary" onClick={() => navigate(`${basePath}/recettes`)} className="rounded-lg font-bold bg-amber-600 border-none">
                Générer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* -------------------------------------------------------------
         4. RESP_REPORTING DASHBOARD VIEW (Prominent PDF/Excel Export Button)
         ------------------------------------------------------------- */}
      {role === "RESP_REPORTING" && (
        <Card className="border border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0 flex items-center gap-2">
                <DashboardOutlined className="text-secondary" /> Tableau de Bord Analytique & Heatmaps
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-1 mb-0">
                Vue lecture seule des indicateurs clés d'occupation, segmentation et revenus.
              </p>
            </div>
            <div className="flex gap-2">
              <Button icon={<DownloadOutlined />} type="primary" className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl border-none">
                Exporter Rapport PDF
              </Button>
              <Button icon={<DownloadOutlined />} className="font-bold rounded-xl">
                Excel Data
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Cartes KPIs Spécifiques au Rôle Connecté */}
      <Row gutter={[16, 16]} style={{ display: "flex", flexWrap: "wrap" }}>
        {kpis.map((kpi) => (
          <Col key={kpi.title} xs={24} sm={12} lg={6} style={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
              <KpiCard
                title={kpi.title}
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                color={kpi.color}
              />
            </div>
          </Col>
        ))}
      </Row>

      {/* Graphiques Interactifs Personnalisés par Rôle */}
      <RoleCharts role={role} filters={filters} recettes={filteredRecettes} contrats={filteredContrats} />

      {/* ADMIN_SI SYSTEMS CONSOLE VIEW: Audit Logs Preview */}
      {role === "ADMIN_SI" && (
        <Card
          title={
            <Space>
              <AuditOutlined className="text-secondary" />
              <span>Derniers Événements d'Audit Système & Sécurité</span>
            </Space>
          }
          extra={
            <Button size="small" onClick={() => navigate("/admin/logs")} className="font-bold rounded-lg">
              Voir tous les logs
            </Button>
          }
          className="rounded-2xl border border-slate-200/80 shadow-xs"
        >
          <Table
            dataSource={logsList.slice(0, 6)}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              { title: "Horodatage", dataIndex: "timestamp", key: "timestamp", render: (d: string) => formatDate(d) },
              { title: "Utilisateur / Acteur", dataIndex: "utilisateur", key: "utilisateur", render: (u: string) => <strong>{u}</strong> },
              { title: "Action", dataIndex: "action", key: "action", render: (a: string) => <Tag color="blue" className="font-bold">{a}</Tag> },
              { title: "Module", dataIndex: "module", key: "module" },
              { title: "Détails / Adresse IP", dataIndex: "details", key: "details" },
            ]}
          />
        </Card>
      )}

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
      </Row>
    </div>
  );
}