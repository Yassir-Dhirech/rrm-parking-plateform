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
import { RoleCharts } from "../components/charts/RoleCharts";
import { getRecettesMock } from "../api/recettesMock";
import { getContratsMock } from "../api/contratsMock";
import { getDemandesMock } from "../api/demandesMock";
import { getParkingsMock, getLogsMock } from "../api/adminMock";
import { KpiCard } from "../components/ui/KpiCard";
import { formatDate } from "../lib/dateUtils";
import type { AuditLog } from "../features/admin/types";
import { ResponsableDashboardView } from "../components/dashboard/ResponsableDashboardView";
import { ChiffreAffairesParkingTable } from "../components/dashboard/ChiffreAffairesParkingTable";

export function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  // Initialize global filters (default: All Parkings for all roles)
  const [filters, setFilters] = useState<GlobalFilters>({});

  if (!role) return null;

  if (role === "RESPONSABLE") {
    return <ResponsableDashboardView />;
  }

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
    // STRICT DOMAIN RULE: Agents do NOT handle ENTREPRISE demandes (managed directly by RESPONSABLE)
    if (role === "AGENT" && (d as any).typeClient === "ENTREPRISE") return false;
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

  // Dynamic metrics calculations directly from filtered datasets
  const totalCAHebdo = filteredRecettes.reduce((acc, r) => acc + r.totalHebdo, 0);
  const recettesCompleted = filteredRecettes.filter((r) => r.statut === "COMPLETED").length;
  const recettesEnAttente = filteredRecettes.filter((r) => r.statut === "EN_COURS").length;
  const contratsEnAttenteSign = filteredContrats.filter((c) => c.statut === "EN_ATTENTE_SIGNATURE").length;
  const demandesSoumises = filteredDemandes.filter((d) => d.statut === "SOUMISE").length;
  const demandesPaiementEnregistre = filteredDemandes.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const demandesValidees = filteredDemandes.filter((d) => d.statut === "VALIDEE").length;
  const totalEncaissementsGuichet = filteredRecettes.reduce((acc, r) => acc + (r.totalEspeces + r.totalCheques), 0) || (filteredDemandes.length * 450);
  const parkingsCount = filteredParkings.length;

  // Global network figures for Comptable Header (permanent network cash oversight, invariant to filter)
  const globalRecettesCompleted = recettes.filter((r) => r.statut === "COMPLETED");
  const globalCompletedCount = globalRecettesCompleted.length || 3;
  const globalTotalSoumis = globalRecettesCompleted.length
    ? globalRecettesCompleted.reduce((sum, r) => sum + (r.totalHebdo || 0), 0)
    : 61250;
  const globalTotalEspeces = globalRecettesCompleted.length
    ? globalRecettesCompleted.reduce((sum, r) => sum + (r.totalEspeces || 0), 0)
    : 42850;
  const globalTotalCheques = globalRecettesCompleted.length
    ? globalRecettesCompleted.reduce((sum, r) => sum + (r.totalCheques || 0), 0)
    : 18400;

  // Cartes KPIs Personnalisées par Rôle
  const getRoleKpis = (currentRole: Role) => {
    switch (currentRole) {
      case "AGENT":
        return [
          { title: "Demandes à Vérifier & Encaisser", value: demandesSoumises, prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Encaissements Guichet (Aujourd'hui)", value: totalEncaissementsGuichet, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Cartes d'Accès à Encoder", value: demandesPaiementEnregistre, prefix: <CreditCardOutlined />, color: "#2563eb" },
          { title: "Demandes Traitées Aujourd'hui", value: demandesValidees, prefix: <CheckCircleOutlined />, color: "#003566" },
        ];
      case "SUPERVISEUR":
        return [
          { title: "Demandes à Approuver (Final)", value: demandesPaiementEnregistre, prefix: <SafetyCertificateOutlined />, color: "#2563eb" },
          { title: "Recettes Hebdo à Valider", value: recettesEnAttente, prefix: <ClockCircleOutlined />, color: "#d97706" },
          { title: "Cartes d'Accès à Activer", value: demandesPaiementEnregistre + 4, prefix: <CreditCardOutlined />, color: "#9333ea" },
          { title: "Taux de Conformité Dossiers", value: 96.4, suffix: "%", prefix: <CheckCircleOutlined />, color: "#10b981" },
        ];
      case "RESPONSABLE":
        return [
          { title: "CA Mensuel Cumulé", value: totalCAHebdo || 548000, suffix: "MAD", prefix: <DollarOutlined />, color: "#003566" },
          { title: "SLA Traitement Moyen (Cible < 24h)", value: "18h 42m", prefix: <AimOutlined />, color: "#10b981" },
          { title: "Contrats Corporate à Signer", value: contratsEnAttenteSign, prefix: <FileTextOutlined />, color: "#982B5E" },
          { title: "Parkings en Exploitation", value: parkingsCount, prefix: <ClockCircleOutlined />, color: "#d97706" },
        ];
      case "COMPTABLE":
        return [
          { title: "Recettes à Rapprocher", value: recettesCompleted, prefix: <ExclamationCircleOutlined />, color: "#d97706" },
          { title: "Encaissements du Jour", value: totalEncaissementsGuichet, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Montant Chèques en Caisse", value: Math.round(totalEncaissementsGuichet * 0.4), suffix: "MAD", prefix: <BankOutlined />, color: "#003566" },
          { title: "Factures Impayées / En Attente", value: 6, prefix: <FileDoneOutlined />, color: "#ef4444" },
        ];
      case "RESP_REPORTING":
        return [
          { title: "Taux de Remplissage Global", value: 87, suffix: "%", prefix: <DashboardOutlined />, color: "#003566" },
          { title: "CA Total Cumulé", value: totalCAHebdo || 689000, suffix: "MAD", prefix: <DollarOutlined />, color: "#10b981" },
          { title: "Abonnés Actifs Total", value: filteredDemandes.length * 15, prefix: <UserOutlined />, color: "#2563eb" },
          { title: "Taux de Renouvellement", value: 91.2, suffix: "%", prefix: <ReloadOutlined />, color: "#982B5E" },
        ];
      case "ADMIN_SI":
        return [
          { title: "Comptes Utilisateurs Actifs", value: 45, prefix: <UserOutlined />, color: "#10b981" },
          { title: "Scanners RFID & Barrières Connectés", value: `${parkingsCount}/${parkingsList.length}`, prefix: <ToolOutlined />, color: "#003566" },
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
      {/* -------------------------------------------------------------
         1. COMPTABLE DASHBOARD: Financial Reconciliation Header (At Top, Invariant to local filter)
         ------------------------------------------------------------- */}
      {role === "COMPTABLE" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          {/* Top Row: Title, Status Badge, Quick Action */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                <BankOutlined />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                    Caisse & Recouvrement Réseau
                  </span>
                  <Tag color="volcano" className="font-bold text-[10px] m-0 px-2 py-0.5 rounded-full">
                    Visa Physique Requis
                  </Tag>
                </div>
                <h3 className="text-lg font-black text-slate-900 m-0 mt-0.5">
                  {globalCompletedCount} Recettes Hebdomadaires à Valider
                </h3>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => navigate(`${basePath}/recettes`)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black border-none rounded-xl shadow-xs shrink-0 h-10 px-5"
            >
              Rapprocher & Encaisser
            </Button>
          </div>

          {/* Bottom Financial Metrics Grid: Permanent network-wide cash oversight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Total Soumis à Encaisser
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">
                {globalTotalSoumis.toLocaleString("fr-FR")} MAD
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                Bordereaux superviseurs en attente
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                Espèces en Enveloppes
              </span>
              <div className="text-xl font-black text-emerald-950 mt-1">
                {globalTotalEspeces.toLocaleString("fr-FR")} MAD
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                Comptage physique & scellés
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 block">
                Chèques Bancaires
              </span>
              <div className="text-xl font-black text-purple-950 mt-1">
                {globalTotalCheques.toLocaleString("fr-FR")} MAD
              </div>
              <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
                Rapprochement bordereaux & quittances
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Barre de Filtres Globaux (Positionnée au-dessus des composants d'analyse / après le header pour Comptable) */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* -------------------------------------------------------------
         2. AGENT DASHBOARD VIEW (Action Items / To-Do List First)
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
      <RoleCharts role={role} filters={filters} recettes={filteredRecettes} contrats={filteredContrats} demandes={filteredDemandes} />

      {/* Module Chiffre d'Affaires par Parking & Analyse Temporelle (Comptable & Reporting) */}
      {(role === "COMPTABLE" || role === "RESP_REPORTING" || role === "SUPERVISEUR") && (
        <ChiffreAffairesParkingTable />
      )}

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
            scroll={{ x: "max-content" }}
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
      {(role === "AGENT" || role === "SUPERVISEUR") && (
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
            scroll={{ x: "max-content" }}
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
    </div>
  );
}