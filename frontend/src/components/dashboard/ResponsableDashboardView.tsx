import { useState } from "react";
import { Row, Col, Card, Progress, Tag, Tooltip, Space, Button, Select, Table, Dropdown, Badge, message } from "antd";
import {
  RiseOutlined,
  FileTextOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ArrowUpOutlined,
  FileDoneOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  TagsOutlined,
  SettingOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/dateUtils";
import { ParkingPlansTarifairesModal } from "../parkings/ParkingPlansTarifairesModal";

export function ResponsableDashboardView() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<number | null>(null);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [selectedParkingForPlans, setSelectedParkingForPlans] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResetFilter = () => {
    setIsRefreshing(true);
    const wasFiltered = !!selectedSiteFilter;
    setSelectedSiteFilter(null);
    setTimeout(() => {
      setIsRefreshing(false);
      if (wasFiltered) {
        message.success("Filtre réinitialisé : Vue globale réseau (Tous les parkings)");
      } else {
        message.success("Indicateurs actualisés en temps réel");
      }
    }, 400);
  };

  const handleOpenPlans = (parking: any) => {
    setSelectedParkingForPlans(parking);
    setPlansModalOpen(true);
  };

  // Base Monthly Trend Template (proportional scaling based on active filter)
  const baseMonthlyRevenueData = [
    { month: "Avr", corporate: 180000, particuliers: 290000, tickets: 160000, total: 630000 },
    { month: "Mai", corporate: 210000, particuliers: 305000, tickets: 165000, total: 680000 },
    { month: "Juin", corporate: 230000, particuliers: 315000, tickets: 175000, total: 720000 },
    { month: "Juil", corporate: 245000, particuliers: 310000, tickets: 190000, total: 745000 },
    { month: "Août", corporate: 260000, particuliers: 320000, tickets: 168500, total: 748500 },
  ];

  // Real-Time Quota & Saturation Pressure Data with per-site metrics
  const parkingsCapacityData = [
    {
      id: 3,
      nom: "Parking Bab El Had",
      capaciteTotal: 450,
      quotaParticulier: 180, // 40%
      abosParticulier: 180,  // 100% alloué
      quotaCorporate: 135,   // 30%
      abosCorporate: 135,    // 100% alloué
      ticketsHorodates: 100, // 22%
      placesLibres: 35,      // 8%
      tauxOccupation: 92.2,
      statutColor: "#ef4444", // Red
      statutText: "Alerte Saturation",
      statut: "CRITIQUE",
      caMensuel: 228500,
      caAbos: 180500,
      caTickets: 48000,
      caEspeces: 132530,
      caCheques: 95970,
      contratsCorporate: 5,
      retentionRate: 96.2,
      slaHours: 16.5,
      badges: { nouveaux: 48, reactives: 260, duplicatas: 8 },
    },
    {
      id: 1,
      nom: "Parking Agdal Gare",
      capaciteTotal: 600,
      quotaParticulier: 240, // 40%
      abosParticulier: 210,  // 87.5%
      quotaCorporate: 180,   // 30%
      abosCorporate: 160,    // 88.8%
      ticketsHorodates: 140, // 23.3%
      placesLibres: 90,      // 15%
      tauxOccupation: 85.0,
      statutColor: "#f59e0b", // Amber
      statutText: "Forte Affluence",
      statut: "ELEVEE",
      caMensuel: 295000,
      caAbos: 225000,
      caTickets: 70000,
      caEspeces: 171100,
      caCheques: 123900,
      contratsCorporate: 7,
      retentionRate: 94.8,
      slaHours: 19.2,
      badges: { nouveaux: 62, reactives: 340, duplicatas: 10 },
    },
    {
      id: 2,
      nom: "Parking Hassan II",
      capaciteTotal: 350,
      quotaParticulier: 140,
      abosParticulier: 125,
      quotaCorporate: 88,
      abosCorporate: 75,
      ticketsHorodates: 95,
      placesLibres: 55,
      tauxOccupation: 84.3,
      statutColor: "#0284c7", // Sky Blue
      statutText: "Charge Nominale",
      statut: "OPTIMAL",
      caMensuel: 138000,
      caAbos: 104000,
      caTickets: 34000,
      caEspeces: 80040,
      caCheques: 57960,
      contratsCorporate: 4,
      retentionRate: 93.5,
      slaHours: 18.0,
      badges: { nouveaux: 30, reactives: 155, duplicatas: 4 },
    },
    {
      id: 4,
      nom: "Parking Chellah",
      capaciteTotal: 200,
      quotaParticulier: 70,
      abosParticulier: 58,
      quotaCorporate: 40,
      abosCorporate: 32,
      ticketsHorodates: 58,
      placesLibres: 52,
      tauxOccupation: 74.0,
      statutColor: "#10b981", // Emerald
      statutText: "Fluide & Disponible",
      statut: "FLUIDE",
      caMensuel: 87000,
      caAbos: 70500,
      caTickets: 16500,
      caEspeces: 50460,
      caCheques: 36540,
      contratsCorporate: 2,
      retentionRate: 92.0,
      slaHours: 21.0,
      badges: { nouveaux: 16, reactives: 87, duplicatas: 2 },
    },
  ];

  // Dynamic filter application across ALL dashboard elements
  const displayedParkings = selectedSiteFilter
    ? parkingsCapacityData.filter((p) => p.id === selectedSiteFilter)
    : parkingsCapacityData;

  const isFiltered = !!selectedSiteFilter;
  const currentParking = isFiltered ? displayedParkings[0] : null;

  // Real-time dynamic recalculations based on selected filter
  const totalCapacite = displayedParkings.reduce((sum, p) => sum + p.capaciteTotal, 0);
  const totalOccupes = displayedParkings.reduce((sum, p) => sum + (p.capaciteTotal - p.placesLibres), 0);
  const totalLibres = displayedParkings.reduce((sum, p) => sum + p.placesLibres, 0);
  const tauxOccupationGlobal = Math.round((totalOccupes / totalCapacite) * 1000) / 10;

  const totalCA = displayedParkings.reduce((sum, p) => sum + p.caMensuel, 0);
  const totalCAAbos = displayedParkings.reduce((sum, p) => sum + p.caAbos, 0);
  const totalCATickets = displayedParkings.reduce((sum, p) => sum + p.caTickets, 0);
  const pctAbos = Math.round((totalCAAbos / totalCA) * 100) || 77;
  const pctTickets = 100 - pctAbos;

  const totalCAEspeces = displayedParkings.reduce((sum, p) => sum + p.caEspeces, 0);
  const totalCACheques = displayedParkings.reduce((sum, p) => sum + p.caCheques, 0);
  const pctEspeces = Math.round((totalCAEspeces / totalCA) * 100) || 58;
  const pctCheques = 100 - pctEspeces;

  const totalCorporateCount = displayedParkings.reduce((sum, p) => sum + p.contratsCorporate, 0);
  const totalAbosParticuliers = displayedParkings.reduce((sum, p) => sum + p.abosParticulier, 0);
  const totalAbosCorporate = displayedParkings.reduce((sum, p) => sum + p.abosCorporate, 0);
  const totalAbonnes = totalAbosParticuliers + totalAbosCorporate;
  const avgRetention = Math.round((displayedParkings.reduce((sum, p) => sum + p.retentionRate, 0) / displayedParkings.length) * 10) / 10;
  const avgSlaHours = Math.round((displayedParkings.reduce((sum, p) => sum + p.slaHours, 0) / displayedParkings.length) * 10) / 10;

  const totalBadgesNouveaux = displayedParkings.reduce((sum, p) => sum + p.badges.nouveaux, 0);
  const totalBadgesReactives = displayedParkings.reduce((sum, p) => sum + p.badges.reactives, 0);
  const totalBadgesDuplicatas = displayedParkings.reduce((sum, p) => sum + p.badges.duplicatas, 0);

  // Scaled monthly revenue chart for the active filter
  const caRatio = totalCA / 748500;
  const dynamicMonthlyRevenue = baseMonthlyRevenueData.map((m) => ({
    month: m.month,
    corporate: Math.round(m.corporate * caRatio),
    particuliers: Math.round(m.particuliers * caRatio),
    tickets: Math.round(m.tickets * caRatio),
    total: Math.round(m.total * caRatio),
  }));
  const dynamicMaxMonthVal = Math.max(...dynamicMonthlyRevenue.map((m) => m.total), 1);

  // Pending Executive Approvals (Corporate Contracts & Invoices)
  const pendingContracts = [
    {
      id: 2,
      parkingId: 1,
      parkingNom: "Parking Agdal Gare",
      reference: "CTR-2026-000002",
      entrepriseNom: "Société Atlas Trans",
      nombreAbonnements: 10,
      formule: "Pass Permanent 24h / 7j (650 MAD)",
      montantMensuel: 6500,
      duree: "20 Ans (240 Mois)",
      dateCreation: "01/06/2025",
    },
    {
      id: 6,
      parkingId: 3,
      parkingNom: "Parking Bab El Had",
      reference: "CTR-2026-000006",
      entrepriseNom: "Rabat Digital Agency",
      nombreAbonnements: 15,
      formule: "Pass Diurne 08h-20h (500 MAD)",
      montantMensuel: 7500,
      duree: "20 Ans (240 Mois)",
      dateCreation: "12/08/2026",
    },
    {
      id: 7,
      parkingId: 1,
      parkingNom: "Parking Agdal Gare",
      reference: "CTR-2026-000007",
      entrepriseNom: "Banque Centrale Populaire Région",
      nombreAbonnements: 25,
      formule: "Pass Étendu 08h-22h (550 MAD)",
      montantMensuel: 13750,
      duree: "20 Ans (240 Mois)",
      dateCreation: "14/08/2026",
    },
    {
      id: 8,
      parkingId: 2,
      parkingNom: "Parking Hassan II",
      reference: "CTR-2026-000008",
      entrepriseNom: "Clinique Agdal Santé",
      nombreAbonnements: 15,
      formule: "Pass Permanent 24h / 7j (650 MAD)",
      montantMensuel: 9750,
      duree: "20 Ans (240 Mois)",
      dateCreation: "18/08/2026",
    },
  ];

  const pendingFactures = [
    {
      id: 2,
      parkingId: 1,
      numero: "FACT-AGD-2026-000002",
      clientNom: "Société Atlas Trans",
      montantTtc: 54500,
      fraisBadge: 500,
      dateEmission: "01/06/2025",
    },
    {
      id: 3,
      parkingId: 3,
      numero: "FACT-BEH-2026-000003",
      clientNom: "Sara Bennis",
      montantTtc: 800,
      fraisBadge: 0,
      dateEmission: "30/07/2026",
    },
  ];

  const filteredContracts = selectedSiteFilter
    ? pendingContracts.filter((c) => c.parkingId === selectedSiteFilter)
    : pendingContracts;

  const filteredFactures = selectedSiteFilter
    ? pendingFactures.filter((f) => f.parkingId === selectedSiteFilter)
    : pendingFactures;

  return (
    <div className="space-y-6">
      {/* 1. Executive Operations Header */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight">
                Bonjour, {userName || "Mme. Leila Benali"}
              </h1>
              
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isFiltered ? `Filtre Actif : ${currentParking?.nom}` : "Réseau Opérationnel"}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 mb-0">
              Pilotage stratégique, suivi de saturation des quotas et gouvernance financière RRM.
            </p>
          </div>

          {/* Clean, High-Impact Executive Controls (Filtered in Real Time) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* 1. Scope Selector */}
            <Select
              placeholder="Tous les parkings"
              value={selectedSiteFilter}
              onChange={setSelectedSiteFilter}
              allowClear
              suffixIcon={<EnvironmentOutlined className="text-secondary" />}
              className="w-full sm:w-64 font-bold"
              options={[
                { value: 3, label: "Parking Bab El Had" },
                { value: 1, label: "Parking Agdal Gare" },
                { value: 2, label: "Parking Hassan II" },
                { value: 4, label: "Parking Chellah" },
              ]}
            />

            {/* 2. Reset / Refresh Button */}
            <Tooltip title={isFiltered ? "Réinitialiser le filtre (Tous les parkings)" : "Actualiser les indicateurs en temps réel"}>
              <Button
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={handleResetFilter}
                className={`font-bold rounded-xl flex items-center justify-center h-9 ${
                  isFiltered
                    ? "border-[#003566] text-[#003566] bg-blue-50/60 hover:bg-blue-100/70 px-3"
                    : "w-9"
                }`}
              >
                {isFiltered && <span className="text-xs font-bold ml-1">Réinitialiser</span>}
              </Button>
            </Tooltip>

            {/* 3. Primary Decision Action: Viser Contrats with Notification Badge */}
            <Badge count={filteredContracts.length} offset={[-2, 2]}>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => navigate("/responsable/contrats")}
                className="font-bold rounded-xl shadow-xs flex items-center gap-1.5 h-9"
                style={{ backgroundColor: "#003566", borderColor: "#003566" }}
              >
                <span>Viser Contrats</span>
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. Top Executive Row: Hybrid Circular & Rectangular Visual Meters */}
      <Row gutter={[16, 16]}>
        {/* KPI 1: Chiffre d'Affaires Mensuel (Rectangular Accent with Breakdown Pill) */}
        <Col xs={24} sm={12} lg={8} xl={5}>
          <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                  {isFiltered ? `CA (${currentParking?.nom})` : "Chiffre d'Affaires (Août)"}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-tight block mt-1">
                  {totalCA.toLocaleString("fr-FR")} MAD
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <DollarOutlined />
              </div>
            </div>

            <div className="my-2.5">
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-extrabold">
                <ArrowUpOutlined /> +14.2% vs Trimestre Précédent
              </div>
              {/* Mini Rectangular Proportion Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex mt-2">
                <div style={{ width: `${pctAbos}%` }} className="bg-emerald-600" title={`Abonnements: ${totalCAAbos.toLocaleString("fr-FR")} MAD`} />
                <div style={{ width: `${pctTickets}%` }} className="bg-sky-500" title={`Tickets: ${totalCATickets.toLocaleString("fr-FR")} MAD`} />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold pt-2 border-t border-emerald-100 flex justify-between">
              <span className="text-emerald-800">Abos: <strong>{(totalCAAbos / 1000).toFixed(0)}k MAD</strong></span>
              <span className="text-sky-800">Tickets: <strong>{(totalCATickets / 1000).toFixed(0)}k</strong></span>
            </div>
          </div>
        </Col>

        {/* KPI 2: Taux d'Occupation Réseau (CIRCULAR GAUGE) */}
        <Col xs={24} sm={12} lg={8} xl={5}>
          <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-amber-50/40 border border-amber-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                {isFiltered ? `Occupation (${currentParking?.nom})` : "Occupation Réseau"}
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {totalOccupes.toLocaleString("fr-FR")} / {totalCapacite.toLocaleString("fr-FR")}
              </span>
              <span className="text-xs text-slate-500 font-medium block">{totalLibres} places libres</span>
              <Tag color={tauxOccupationGlobal >= 90 ? "volcano" : tauxOccupationGlobal >= 85 ? "orange" : "green"} className="font-extrabold text-[10px] m-0 mt-2">
                {isFiltered ? currentParking?.statutText : `Bab El Had à 92%`}
              </Tag>
            </div>

            {/* Circular Gauge */}
            <div className="shrink-0 flex flex-col items-center">
              <Progress
                type="circle"
                percent={tauxOccupationGlobal}
                size={74}
                strokeColor={{
                  "0%": "#10b981",
                  "80%": "#f59e0b",
                  "100%": "#ef4444",
                }}
                format={(percent) => (
                  <span className="text-xs font-black text-slate-900">{percent}%</span>
                )}
              />
            </div>
          </div>
        </Col>

        {/* KPI 3: Grands Comptes Corporate 20 Ans (Rectangular Purple Glow) */}
        <Col xs={24} sm={12} lg={8} xl={5}>
          <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-purple-50/50 border border-purple-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider block">
                  Contrats Corporate (20 Ans)
                </span>
                <span className="text-2xl font-black text-purple-950 leading-tight block mt-1">
                  {totalCorporateCount} Actifs
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <FileTextOutlined />
              </div>
            </div>

            <div className="my-2">
              <div className="text-xs text-purple-800 font-bold">
                {totalAbosCorporate} véhicules longue durée
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {(totalAbosCorporate * 650 * 12).toLocaleString("fr-FR")} MAD / an garantis
              </div>
            </div>

            <div className="text-[11px] pt-2 border-t border-purple-100 flex justify-between items-center">
              <Tag color="purple" className="font-extrabold text-[10px] m-0">Engagement 20 Ans</Tag>
              <Tag color="gold" className="font-extrabold text-[10px] m-0">{filteredContracts.length} à Viser</Tag>
            </div>
          </div>
        </Col>

        {/* KPI 4: Rétention Abonnés (CIRCULAR RING METER) */}
        <Col xs={24} sm={12} lg={8} xl={5}>
          <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-sky-50/50 border border-sky-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-black text-sky-800 uppercase tracking-wider block">
                Abonnés Enregistrés
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {totalAbonnes.toLocaleString("fr-FR")} Abonnés
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {totalAbosParticuliers} Part. / {totalAbosCorporate} Corp.
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1.5">
                Même carte : 0 DH
              </span>
            </div>

            {/* Circular Ring */}
            <div className="shrink-0 flex flex-col items-center">
              <Progress
                type="circle"
                percent={avgRetention}
                size={74}
                strokeColor="#0284c7"
                format={(percent) => (
                  <span className="text-xs font-black text-sky-900">{percent}%</span>
                )}
              />
            </div>
          </div>
        </Col>

        {/* KPI 5: SLA Instruction Dossiers (CIRCULAR SPEED GAUGE) */}
        <Col xs={24} sm={12} lg={8} xl={4}>
          <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-200 shadow-xs flex items-center justify-between gap-2">
            <div className="flex-1">
              <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wider block">
                Conformité SLA
              </span>
              <span className="text-xl font-black text-indigo-950 mt-1 block">
                {avgSlaHours}h
              </span>
              <span className="text-xs text-slate-500 font-medium block">Délai moyen</span>
              <Tag color="green" className="font-extrabold text-[10px] m-0 mt-2">
                Cible &lt; 24h
              </Tag>
            </div>

            {/* Circular Speed Ring */}
            <div className="shrink-0 flex flex-col items-center">
              <Progress
                type="circle"
                percent={98.6}
                size={74}
                strokeColor="#4f46e5"
                format={(percent) => (
                  <span className="text-xs font-black text-indigo-900">{percent}%</span>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. Visual Charts Row: Rectangular Bar Chart + Circular Donut Ring */}
      <Row gutter={[16, 16]}>
        {/* Left: Rectangular Multi-Stream Monthly Bar Chart */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Space>
                  <RiseOutlined style={{ color: "#006398" }} />
                  <span className="font-extrabold text-slate-900">
                    {isFiltered ? `Évolution CA (${currentParking?.nom})` : "Évolution Mensuelle du CA & Ventilation Multi-Flux"}
                  </span>
                </Space>
                <Tag color="green" className="font-black m-0">
                  <ArrowUpOutlined style={{ marginRight: 4 }} />
                  +18.8% depuis Avril 2026
                </Tag>
              </div>
            }
            className="rounded-2xl border border-slate-200/80 shadow-xs"
          >
            {/* Visual Bar Columns */}
            <div className="flex justify-around items-end h-56 pt-6 pb-2 px-2">
              {dynamicMonthlyRevenue.map((item) => {
                const heightPercent = Math.round((item.total / dynamicMaxMonthVal) * 100);
                const corpPct = (item.corporate / item.total) * 100;
                const partPct = (item.particuliers / item.total) * 100;
                const ticketPct = (item.tickets / item.total) * 100;

                return (
                  <div key={item.month} className="flex flex-col items-center h-full w-14 sm:w-16">
                    <span className="text-[11px] font-extrabold text-slate-700 mb-1.5">
                      {(item.total / 1000).toFixed(0)}k MAD
                    </span>

                    <div className="flex-1 w-8 sm:w-10 bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end">
                      <Tooltip
                        title={
                          <div className="text-xs p-1">
                            <div className="font-black border-b border-slate-600 pb-1 mb-1">
                              {item.month} 2026 : {item.total.toLocaleString("fr-FR")} MAD
                            </div>
                            <div className="text-purple-300 font-semibold">
                              Corporate (20 Ans): {item.corporate.toLocaleString("fr-FR")} MAD ({corpPct.toFixed(0)}%)
                            </div>
                            <div className="text-sky-300 font-semibold">
                              Particuliers: {item.particuliers.toLocaleString("fr-FR")} MAD ({partPct.toFixed(0)}%)
                            </div>
                            <div className="text-emerald-300 font-semibold">
                              Tickets Horodatés: {item.tickets.toLocaleString("fr-FR")} MAD ({ticketPct.toFixed(0)}%)
                            </div>
                          </div>
                        }
                      >
                        <div style={{ height: `${heightPercent}%`, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                          <div style={{ height: `${corpPct}%`, backgroundColor: "#9333ea" }} />
                          <div style={{ height: `${partPct}%`, backgroundColor: "#006398" }} />
                          <div style={{ height: `${ticketPct}%`, backgroundColor: "#10b981" }} />
                        </div>
                      </Tooltip>
                    </div>

                    <span className="text-xs font-bold text-slate-600 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-purple-600 inline-block shrink-0" />
                <span className="font-bold text-slate-800">Contrats Corporate (20 Ans) — 34.7%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#006398] inline-block shrink-0" />
                <span className="font-bold text-slate-800">Abonnements Particuliers — 42.8%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 inline-block shrink-0" />
                <span className="font-bold text-slate-800">Tickets Rotatifs Horodatés — 22.5%</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Circular Donut Ring for Payment Modes (Strictly ESPECES & CHEQUE - Zero Virement!) */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Space>
                  <DollarOutlined style={{ color: "#16a34a" }} />
                  <span className="font-extrabold text-slate-900">
                    Mix des Règlements Homologués
                  </span>
                </Space>
                <Tag color="red" className="font-black text-[10px] uppercase m-0">
                  Zéro Virement
                </Tag>
              </div>
            }
            className="rounded-2xl border border-slate-200/80 shadow-xs h-full"
          >
            <div className="flex flex-col items-center justify-center py-2">
              {/* Circular Dual-Progress Donut Simulation */}
              <div className="relative flex items-center justify-center my-3">
                <Progress
                  type="circle"
                  percent={pctEspeces}
                  size={148}
                  strokeColor="#10b981"
                  trailColor="#9333ea"
                  strokeWidth={10}
                  format={() => (
                    <div className="text-center">
                      <span className="text-base font-black text-slate-900 block leading-tight">{(totalCA / 1000).toFixed(1)}k</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">MAD Total</span>
                    </div>
                  )}
                />
              </div>

              {/* Rectangular Stat Breakdown Pills */}
              <div className="w-full space-y-2.5 mt-2">
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                    <span className="text-xs font-bold text-emerald-950">Espèces (Guichet RRM)</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-emerald-700 text-xs block">{totalCAEspeces.toLocaleString("fr-FR")} MAD</strong>
                    <span className="text-[10px] text-slate-500 font-semibold">{pctEspeces}% du total</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                    <span className="text-xs font-bold text-purple-950">Chèques Certifiés (Corporate)</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-purple-700 text-xs block">{totalCACheques.toLocaleString("fr-FR")} MAD</strong>
                    <span className="text-[10px] text-slate-500 font-semibold">{pctCheques}% du total</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-3 text-center flex items-center gap-1.5 justify-center">
                <SafetyCertificateOutlined className="text-emerald-600" />
                <span>Encaissements 100% rapprochés avec les quittances de caisse</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 4. Parking Quotas & Saturation: Circular Dial + Rectangular Track for Each Site */}
      <Card
        title={
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Space>
              <ApartmentOutlined style={{ color: "#006398" }} />
              <span className="font-extrabold text-slate-900">
                Pression des Quotas & Taux d'Occupation Temps Réel par Site
              </span>
            </Space>
            <Tag color="blue" className="font-black m-0">
              Règle : 50% Tickets / 50% Abonnements (40% Particuliers / 60% Corporate)
            </Tag>
          </div>
        }
        className="rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedParkings.map((p) => {
            const isCritical = p.tauxOccupation >= 90;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCritical
                    ? "bg-red-50/40 border-red-300 shadow-xs"
                    : "bg-slate-50/90 border-slate-200/90"
                }`}
              >
                {/* Top Section: Info + Circular Dial */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">{p.nom}</span>
                        <Tag color={isCritical ? "volcano" : p.tauxOccupation >= 85 ? "gold" : "green"} className="font-black text-xs m-0">
                          {p.statutText}
                        </Tag>
                      </div>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "plans",
                              icon: <TagsOutlined style={{ color: "#006398" }} />,
                              label: <span style={{ fontWeight: 700, color: "#006398" }}>Plans Tarifaires</span>,
                              onClick: () => handleOpenPlans(p),
                            },
                            {
                              key: "parkings",
                              icon: <SettingOutlined style={{ color: "#7c3aed" }} />,
                              label: <span>Gérer Quotas & Ouvrage</span>,
                              onClick: () => navigate("/responsable/parkings"),
                            },
                          ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          size="small"
                          icon={<SettingOutlined />}
                          style={{ fontWeight: 700, borderRadius: 8, borderColor: "#006398", color: "#006398" }}
                          className="flex items-center gap-1"
                        >
                          Paramètres <DownOutlined style={{ fontSize: 9 }} />
                        </Button>
                      </Dropdown>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                      Capacité Globale : <strong>{p.capaciteTotal} places</strong>
                    </span>
                    <div className="mt-2 text-xs font-bold">
                      Disponibilité Immédiate :{" "}
                      <strong className={isCritical ? "text-red-600 font-black text-sm" : "text-emerald-700 font-black text-sm"}>
                        {p.placesLibres} places libres
                      </strong>
                    </div>
                  </div>

                  {/* Circular Dial for Site */}
                  <div className="shrink-0">
                    <Progress
                      type="circle"
                      percent={p.tauxOccupation}
                      size={68}
                      strokeColor={p.statutColor}
                      format={(percent) => (
                        <span className="text-xs font-black text-slate-900">{percent}%</span>
                      )}
                    />
                  </div>
                </div>

                {/* Rectangular Multi-Segment Capacity Bar */}
                <div className="w-full">
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${(p.abosParticulier / p.capaciteTotal) * 100}%` }}
                      className="bg-[#006398]"
                      title={`Particuliers: ${p.abosParticulier} / ${p.quotaParticulier}`}
                    />
                    <div
                      style={{ width: `${(p.abosCorporate / p.capaciteTotal) * 100}%` }}
                      className="bg-purple-600"
                      title={`Corporate: ${p.abosCorporate} / ${p.quotaCorporate}`}
                    />
                    <div
                      style={{ width: `${(p.ticketsHorodates / p.capaciteTotal) * 100}%` }}
                      className="bg-emerald-500"
                      title={`Tickets: ${p.ticketsHorodates}`}
                    />
                    <div
                      style={{ width: `${(p.placesLibres / p.capaciteTotal) * 100}%` }}
                      className="bg-slate-300"
                      title={`Libres: ${p.placesLibres}`}
                    />
                  </div>

                  {/* Rectangular Sub-quota Stat Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 block font-semibold">Particuliers</span>
                      <strong className="text-[#006398] text-xs">
                        {p.abosParticulier} / {p.quotaParticulier}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 block font-semibold">Corporate</span>
                      <strong className="text-purple-700 text-xs">
                        {p.abosCorporate} / {p.quotaCorporate}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 block font-semibold">Tickets Rotation</span>
                      <strong className="text-emerald-700 text-xs">
                        {p.ticketsHorodates} places
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Corporate 20-Year Contracts Pipeline (Rectangular Progression Timeline) */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <Space>
              <ApartmentOutlined style={{ color: "#9333ea" }} />
              <span className="font-extrabold text-slate-900">
                Pipeline Stratégique des Grands Comptes Flottes (Contrats 20 Ans)
              </span>
            </Space>
            <Tag color="purple" className="font-black m-0">
              Formules : 08h-20h / 08h-22h / 24h-7j
            </Tag>
          </div>
        }
        className="rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Phase 1 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-blue-900 uppercase">1. Audit & Prospection</span>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
            </div>
            <div className="text-sm font-black text-slate-900">60 Places Demandées</div>
            <p className="text-[11px] text-slate-500 mt-1 mb-0">Évaluation des flottes entreprises</p>
          </div>

          {/* Phase 2 */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-indigo-900 uppercase">2. Contrats Rédigés</span>
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
            </div>
            <div className="text-sm font-black text-slate-900">45 Places Négociées</div>
            <p className="text-[11px] text-slate-500 mt-1 mb-0">En relecture juridique & ICE/RC</p>
          </div>

          {/* Phase 3: Action Requise */}
          <div
            onClick={() => navigate("/responsable/contrats")}
            className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black text-amber-900 uppercase">3. En Attente Signature</span>
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center animate-pulse">
                {filteredContracts.length}
              </span>
            </div>
            <div className="text-sm font-black text-amber-950">
              {filteredContracts.reduce((s, c) => s + c.nombreAbonnements, 0)} Places — {filteredContracts.reduce((s, c) => s + c.montantMensuel, 0).toLocaleString("fr-FR")} MAD / m
            </div>
            <p className="text-[11px] text-amber-800 font-bold mt-1 mb-0">Cliquez pour viser les contrats →</p>
          </div>

          {/* Phase 4 */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-emerald-900 uppercase">4. Signés & En Vigueur</span>
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {totalCorporateCount}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900">{totalAbosCorporate} Véhicules Actifs</div>
            <p className="text-[11px] text-slate-500 mt-1 mb-0">{(totalAbosCorporate * 650 * 12).toLocaleString("fr-FR")} MAD / an garantis</p>
          </div>
        </div>
      </Card>

      {/* 6. Executive Action Tables (Pending Contracts & Invoices) */}
      <Row gutter={[16, 16]}>
        {/* Pending Contracts Table */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Space>
                  <FileTextOutlined style={{ color: "#9333ea" }} />
                  <span className="font-extrabold text-slate-900">
                    Contrats Corporate 20 Ans à Viser
                  </span>
                </Space>
                <Tag color="purple" className="font-black m-0">
                  {filteredContracts.length} Contrats
                </Tag>
              </div>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/responsable/contrats")}
                className="font-bold text-purple-700 p-0"
              >
                Gérer →
              </Button>
            }
            className="rounded-2xl border border-slate-200/80 shadow-xs"
          >
            <Table
              dataSource={filteredContracts}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Référence",
                  dataIndex: "reference",
                  key: "reference",
                  render: (ref: string, record: any) => (
                    <a
                      onClick={() => navigate(`/responsable/contrats/${record.id}`)}
                      className="font-mono font-bold text-purple-800"
                    >
                      {ref}
                    </a>
                  ),
                },
                {
                  title: "Entreprise",
                  dataIndex: "entrepriseNom",
                  key: "entrepriseNom",
                  render: (nom: string) => <strong>{nom}</strong>,
                },
                {
                  title: "Flotte",
                  dataIndex: "nombreAbonnements",
                  key: "nombreAbonnements",
                  render: (nb: number) => <Tag color="purple" className="font-bold">{nb} badges</Tag>,
                },
                {
                  title: "Mensualité HT",
                  dataIndex: "montantMensuel",
                  key: "montantMensuel",
                  render: (val: number) => (
                    <strong className="text-emerald-700">{val.toLocaleString("fr-FR")} MAD</strong>
                  ),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record: any) => (
                    <Button
                      size="small"
                      type="primary"
                      icon={<SafetyCertificateOutlined />}
                      onClick={() => navigate(`/responsable/contrats/${record.id}`)}
                      style={{ backgroundColor: "#9333ea", borderColor: "#9333ea", fontWeight: 700 }}
                      className="rounded-lg"
                    >
                      Viser
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Pending Invoices to Sign */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Space>
                  <FileDoneOutlined style={{ color: "#006398" }} />
                  <span className="font-extrabold text-slate-900">
                    Factures Officielles à Viser
                  </span>
                </Space>
                <Tag color="cyan" className="font-black m-0">
                  {filteredFactures.length} Factures
                </Tag>
              </div>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/responsable/factures")}
                className="font-bold text-[#006398] p-0"
              >
                Factures →
              </Button>
            }
            className="rounded-2xl border border-slate-200/80 shadow-xs"
          >
            <div className="space-y-3">
              {filteredFactures.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  Aucune facture en attente pour ce site
                </div>
              ) : (
                filteredFactures.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-mono font-black text-slate-900 text-xs">{fact.numero}</div>
                      <div className="text-xs text-slate-600 font-semibold">{fact.clientNom}</div>
                      <div className="text-[11px] text-slate-400">Émise le {formatDate(fact.dateEmission)}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-emerald-700 text-sm">
                        {fact.montantTtc.toLocaleString("fr-FR")} MAD
                      </div>
                      {fact.fraisBadge > 0 && (
                        <div className="text-[10px] text-amber-700 font-bold">
                          (dont +{fact.fraisBadge} DH badge RFID)
                        </div>
                      )}
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => navigate(`/responsable/factures/${fact.id}`)}
                        className="mt-1 font-bold rounded-lg"
                      >
                        Signer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 7. RFID Badges & Tariff Governance (50 DH Rule) with Circular & Rectangular Mix */}
      <Card
        title={
          <Space>
            <IdcardOutlined style={{ color: "#d97706" }} />
            <span className="font-extrabold text-slate-900">
              Gouvernance des Badges RFID & Politique Tarifaire (+50 DH Nouveaux / 0 DH Renouvellements)
            </span>
          </Space>
        }
        className="rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-amber-100/50 border border-amber-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs text-amber-900 font-black uppercase tracking-wider block">
                Nouvelles Cartes Émises
              </span>
              <Tag color="orange" className="font-black m-0">+50 DH TTC</Tag>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-amber-950">{totalBadgesNouveaux} Badges</div>
              <span className="text-xs text-amber-800 font-semibold block">Nouveaux abonnés & corporate</span>
            </div>
            <div className="pt-2 border-t border-amber-200 text-xs font-black text-amber-900 flex justify-between">
              <span>Recette Encaissée :</span>
              <strong>+{(totalBadgesNouveaux * 50).toLocaleString("fr-FR")} MAD TTC</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 border border-emerald-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs text-emerald-900 font-black uppercase tracking-wider block">
                Cartes Réactivées
              </span>
              <Tag color="green" className="font-black m-0">0 DH (Gratuit)</Tag>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-emerald-950">{totalBadgesReactives} Badges</div>
              <span className="text-xs text-emerald-800 font-semibold block">Même carte physique réutilisée</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 text-xs font-black text-emerald-900 flex justify-between">
              <span>Économie Usagers :</span>
              <strong>{(totalBadgesReactives * 50).toLocaleString("fr-FR")} MAD</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/90 to-rose-100/50 border border-rose-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs text-rose-900 font-black uppercase tracking-wider block">
                Duplicatas Émis
              </span>
              <Tag color="volcano" className="font-black m-0">50 DH TTC</Tag>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-rose-950">{totalBadgesDuplicatas} Badges</div>
              <span className="text-xs text-rose-800 font-semibold block">Remplacement perte / dommage</span>
            </div>
            <div className="pt-2 border-t border-rose-200 text-xs font-black text-rose-900 flex justify-between">
              <span>Frais Perte Collectés :</span>
              <strong>+{(totalBadgesDuplicatas * 50).toLocaleString("fr-FR")} MAD TTC</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-blue-100/50 border border-blue-300 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs text-blue-900 font-black uppercase tracking-wider block">
                Digitalisation Souscriptions
              </span>
              <Tag color="blue" className="font-black m-0">QR Code / Web</Tag>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-blue-950">86.2%</div>
              <span className="text-xs text-blue-800 font-semibold block">13.8% Guichet physique</span>
            </div>
            <div className="pt-2 border-t border-blue-200 text-xs font-black text-blue-900 flex justify-between">
              <span>Temps Gagné / Dossier :</span>
              <strong>~15 min</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Parking Plans Tarifaires Pre-filled Modal */}
      <ParkingPlansTarifairesModal
        open={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
        parking={selectedParkingForPlans}
      />
    </div>
  );
}
