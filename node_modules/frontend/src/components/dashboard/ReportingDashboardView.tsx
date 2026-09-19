import { useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Progress,
  Tag,
  Tooltip,
  Space,
  Button,
  Table,
  message,
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  BankOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  CarOutlined,
  ArrowUpOutlined,
  CompassOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { GlobalFilterBar, type GlobalFilters } from "../ui/GlobalFilterBar";
import { ChiffreAffairesParkingTable } from "./ChiffreAffairesParkingTable";

export function ReportingDashboardView() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GlobalFilters>({});

  // Reference Multi-Sites Data for Reporting (IDs strictly aligned with adminMock)
  const sitesPerformanceData = [
    {
      id: 1,
      nom: "Parking Agdal Gare",
      code: "AGD",
      quartier: "Agdal Universitaire",
      capacite: 450,
      occupationTaux: 94.2,
      caMensuel: 194500,
      rendementParPlace: 432,
      rotationVehicules: 3.4,
      satisfaction: 98.4,
      abosActifs: 410,
    },
    {
      id: 2,
      nom: "Parking Hassan II",
      code: "HSS",
      quartier: "Centre d'Affaires & Ministères",
      capacite: 300,
      occupationTaux: 86.5,
      caMensuel: 138000,
      rendementParPlace: 460,
      rotationVehicules: 2.7,
      satisfaction: 99.1,
      abosActifs: 250,
    },
    {
      id: 3,
      nom: "Parking Bab El Had",
      code: "BEH",
      quartier: "Médina & Marché Central",
      capacite: 350,
      occupationTaux: 91.8,
      caMensuel: 152000,
      rendementParPlace: 434,
      rotationVehicules: 3.8,
      satisfaction: 96.9,
      abosActifs: 315,
    },
    {
      id: 4,
      nom: "Parking Chellah",
      code: "CHL",
      quartier: "Zone Historique & Ministères",
      capacite: 220,
      occupationTaux: 81.3,
      caMensuel: 98500,
      rendementParPlace: 447,
      rotationVehicules: 2.2,
      satisfaction: 97.5,
      abosActifs: 195,
    },
    {
      id: 5,
      nom: "Parking Rabat Ville Gare",
      code: "RVG",
      quartier: "Gare Centrale & Salé Sud",
      capacite: 400,
      occupationTaux: 95.8,
      caMensuel: 184000,
      rendementParPlace: 460,
      rotationVehicules: 3.6,
      satisfaction: 98.0,
      abosActifs: 380,
    },
  ];

  // Dynamic filter resolution: if a parking is selected in GlobalFilterBar, filter down to it
  const selectedSite = useMemo(() => {
    if (!filters.parkingId) return null;
    return sitesPerformanceData.find((s) => s.id === filters.parkingId) || null;
  }, [filters.parkingId]);

  const displaySites = useMemo(() => {
    return selectedSite ? [selectedSite] : sitesPerformanceData;
  }, [selectedSite]);

  // Date duration coefficient based on selected period
  const dateFactor = useMemo(() => {
    if (!filters.periode || !filters.periode[0] || !filters.periode[1]) return 1;
    const start = dayjs(filters.periode[0]);
    const end = dayjs(filters.periode[1]);
    const days = Math.max(1, end.diff(start, "day") + 1);
    return Math.round((days / 30) * 100) / 100;
  }, [filters.periode]);

  // Dynamically computed metrics reflecting the filter
  const currentCapacite = selectedSite
    ? selectedSite.capacite
    : sitesPerformanceData.reduce((sum, s) => sum + s.capacite, 0);

  const baseCA = selectedSite
    ? selectedSite.caMensuel
    : sitesPerformanceData.reduce((sum, s) => sum + s.caMensuel, 0);

  const currentCA = Math.round(baseCA * dateFactor);

  const currentOccupation = selectedSite
    ? selectedSite.occupationTaux
    : Math.round(
        sitesPerformanceData.reduce((sum, s) => sum + s.occupationTaux, 0) /
          sitesPerformanceData.length
      );

  const currentAbonnes = selectedSite
    ? selectedSite.abosActifs
    : sitesPerformanceData.reduce((sum, s) => sum + s.abosActifs, 0);

  // Hourly attendance curve (06h to 22h) scaled dynamically if site selected
  const hourlyMultiplier = selectedSite ? selectedSite.capacite / 450 : 1;
  const hourlyAttendance = [
    { hour: "06h", rate: 22, volume: Math.round(180 * hourlyMultiplier) },
    { hour: "07h", rate: 45, volume: Math.round(380 * hourlyMultiplier) },
    { hour: "08h", rate: 88, volume: Math.round(740 * hourlyMultiplier) },
    { hour: "09h", rate: 96, volume: Math.round(810 * hourlyMultiplier) },
    { hour: "10h", rate: 94, volume: Math.round(790 * hourlyMultiplier) },
    { hour: "11h", rate: 89, volume: Math.round(750 * hourlyMultiplier) },
    { hour: "12h", rate: 84, volume: Math.round(710 * hourlyMultiplier) },
    { hour: "13h", rate: 78, volume: Math.round(660 * hourlyMultiplier) },
    { hour: "14h", rate: 85, volume: Math.round(720 * hourlyMultiplier) },
    { hour: "15h", rate: 88, volume: Math.round(740 * hourlyMultiplier) },
    { hour: "16h", rate: 91, volume: Math.round(770 * hourlyMultiplier) },
    { hour: "17h", rate: 95, volume: Math.round(800 * hourlyMultiplier) },
    { hour: "18h", rate: 92, volume: Math.round(780 * hourlyMultiplier) },
    { hour: "19h", rate: 74, volume: Math.round(620 * hourlyMultiplier) },
    { hour: "20h", rate: 58, volume: Math.round(490 * hourlyMultiplier) },
    { hour: "21h", rate: 38, volume: Math.round(320 * hourlyMultiplier) },
    { hour: "22h", rate: 24, volume: Math.round(200 * hourlyMultiplier) },
  ];

  // Revenue breakdown dynamically scaled to currentCA
  const revenueStreams = [
    {
      title: "Abonnements Corporate — 20 Ans",
      code: "CORP",
      montant: Math.round(currentCA * 0.48),
      pourcentage: 48,
      croissance: "+12.4%",
      color: "#7e22ce",
      icon: <BankOutlined />,
      details: "Grands comptes & flottes d'entreprises de la région",
    },
    {
      title: "Abonnements Particuliers — 3 à 12 Mois",
      code: "PART",
      montant: Math.round(currentCA * 0.32),
      pourcentage: 32,
      croissance: "+6.1%",
      color: "#0284c7",
      icon: <UserOutlined />,
      details: "Résidents, professionnels libéraux & pendulaires",
    },
    {
      title: "Billetterie & Horodateurs — Rotation",
      code: "ROTATION",
      montant: Math.round(currentCA * 0.18),
      pourcentage: 18,
      croissance: "+4.3%",
      color: "#16a34a",
      icon: <CarOutlined />,
      details: "Tickets horaires, usagers occasionnels & visiteurs",
    },
    {
      title: "Badges RFID — Droits d'Émission",
      code: "RFID",
      montant: Math.round(currentCA * 0.02),
      pourcentage: 2,
      croissance: "+9.0%",
      color: "#d97706",
      icon: <IdcardOutlined />,
      details: "Cartes neuves 50 DH TTC & duplicatas",
    },
  ];

  // Direct CSV Export
  const handleDownloadCSV = () => {
    try {
      const headers =
        "Parc de Stationnement;Code;Quartier;Capacite;Taux Occupation (%);Chiffre Affaires Période (MAD);Rendement par Place (MAD);Rotation (Veh/Pl/J);Satisfaction (%)\n";
      const rows = displaySites
        .map(
          (s) =>
            `"${s.nom}";"${s.code}";"${s.quartier}";${s.capacite};${s.occupationTaux};${Math.round(s.caMensuel * dateFactor)};${s.rendementParPlace};${s.rotationVehicules};${s.satisfaction}`
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + headers + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Rapport_Reporting_RRM_${dayjs().format("DD_MM_YYYY")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("Export des données téléchargé avec succès !");
    } catch {
      message.error("Erreur lors de l'export des données.");
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
         1. EXECUTIVE HEADER (Harmonized with other role headers)
         ------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Top Row: Title, Category Badge, Essential Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-700 text-white flex items-center justify-center text-xl font-bold shadow-xs">
              <DashboardOutlined />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-sky-800 tracking-wider">
                  Direction Reporting & Décisionnel
                </span>
                <Tag color="cyan" className="font-bold text-[10px] m-0 px-2 py-0.5 rounded-full">
                  Données Consolidées Réseau
                </Tag>
              </div>
              <h3 className="text-lg font-black text-slate-900 m-0 mt-0.5">
                Observatoire & Pilotage de Fréquentation
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<CompassOutlined />}
              onClick={() => navigate("/reporting/carte-parkings")}
              className="bg-sky-700 hover:bg-sky-800 text-white font-black border-none rounded-xl shadow-xs shrink-0 h-10 px-4"
            >
              Carte des Parkings
            </Button>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadCSV}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border-emerald-200 rounded-xl h-10 px-4"
            >
              Exporter les Données
            </Button>
          </div>
        </div>

        {/* Bottom Permanent Metric Tiles (Invariant to local filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Taux d'Occupation Réseau
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              88.4%
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
              3 890 places occupées / 4 400 totales
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
              Chiffre d'Affaires Mensuel Estimé
            </span>
            <div className="text-xl font-black text-emerald-950 mt-1">
              1 124 000 MAD
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              Abos + billetterie rotation + badges
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 block">
              Abonnés & Flottes Sous Gestion
            </span>
            <div className="text-xl font-black text-purple-950 mt-1">
              1 842 Abonnés
            </div>
            <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
              Quotas alloués saturés à 91.8%
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
         2. BARRE DE FILTRES GLOBAUX (Positionnée juste après l'en-tête)
         ------------------------------------------------------------- */}
      <GlobalFilterBar filters={filters} onChange={setFilters} />

      {/* -------------------------------------------------------------
         3. COMPOSANTS AFFECTÉS PAR LE FILTRE
         ------------------------------------------------------------- */}
      {/* 3.1. Cartes KPIs Dynamiques */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                  Taux d'Occupation
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {currentOccupation}%
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <ArrowUpOutlined /> +3.4% vs mois précédent
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl font-bold">
                <DashboardOutlined />
              </div>
            </div>
            <Progress percent={currentOccupation} strokeColor="#0284c7" size="small" className="mt-3 m-0" />
            <div className="text-[11px] text-slate-400 font-semibold mt-2">
              {selectedSite ? selectedSite.nom : "Consolidé Réseau"}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                  Chiffre d'Affaires {filters.periode ? "Période" : "Mensuel"}
                </span>
                <div className="text-3xl font-black text-emerald-950 mt-1">
                  {currentCA.toLocaleString("fr-FR")} MAD
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <ArrowUpOutlined /> +8.2% vs objectif budgétaire
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
                <DollarOutlined />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-3">
              Sur {currentCapacite} places {selectedSite ? `(${selectedSite.code})` : "du réseau"}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                  Abonnés Actifs Sous Gestion
                </span>
                <div className="text-3xl font-black text-purple-950 mt-1">
                  {currentAbonnes}
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-700 font-bold mt-1">
                  <TeamOutlined /> 62% Flottes — 38% Particuliers
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold">
                <IdcardOutlined />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-3">
              Quotas alloués saturés à 91.8%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                  Fidélisation & Renouvellement
                </span>
                <div className="text-3xl font-black text-amber-950 mt-1">
                  93.6%
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                  <CheckCircleOutlined /> Reconduction à échéance
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">
                <RiseOutlined />
              </div>
            </div>
            <Progress percent={93.6} strokeColor="#d97706" size="small" className="mt-3 m-0" />
            <div className="text-[11px] text-slate-400 font-semibold mt-2">
              Indice de satisfaction usagers 98.2%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3.2. Profil d'Affluence Horaire & Mix Produits */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <Space>
                  <FieldTimeOutlined className="text-sky-700 text-lg" />
                  <span className="font-bold text-slate-900">
                    Profil d'Affluence Horaire — 06h à 22h {selectedSite ? `(${selectedSite.nom})` : "(Réseau Consolidé)"}
                  </span>
                </Space>
                <Tag color="geekblue" className="font-bold rounded-full">
                  Heure de Pointe : 09h30
                </Tag>
              </div>
            }
            className="rounded-2xl border border-slate-200/90 shadow-xs"
          >
            {/* Visual Hourly Bar Chart */}
            <div className="flex items-end justify-between gap-1 h-56 pt-6 pb-2 px-2">
              {hourlyAttendance.map((item) => (
                <div
                  key={item.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group"
                >
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {item.rate}%
                  </span>
                  <Tooltip
                    title={`${item.hour} : ${item.rate}% d'occupation (${item.volume} véhicules/h)`}
                  >
                    <div
                      className="w-full max-w-[28px] rounded-t-md transition-all duration-300 group-hover:scale-x-110"
                      style={{
                        height: `${item.rate}%`,
                        backgroundColor:
                          item.rate >= 90
                            ? "#982B5E"
                            : item.rate >= 80
                            ? "#003566"
                            : item.rate >= 50
                            ? "#0284c7"
                            : "#94a3b8",
                      }}
                    />
                  </Tooltip>
                  <span className="text-[11px] font-semibold text-slate-500 mt-2">
                    {item.hour}
                  </span>
                </div>
              ))}
            </div>

            {/* Sub-metrics below chart */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-500 font-medium block">Taux de Rotation Quotidien</span>
                <strong className="text-lg text-slate-900 font-black">
                  {selectedSite ? `${selectedSite.rotationVehicules} véh./pl./j` : "2.9 véh./pl./j"}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-500 font-medium block">Durée Moyenne de Stationnement</span>
                <strong className="text-lg text-slate-900 font-black">2h 35 minutes</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-500 font-medium block">Disponibilité Barrières LPR</span>
                <strong className="text-lg text-emerald-700 font-black">99.8% opérationnel</strong>
              </div>
            </div>
          </Card>
        </Col>

        {/* Mix Produits & Segmentation CA */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <PieChartOutlined className="text-purple-700 text-lg" />
                <span className="font-bold text-slate-900">
                  Mix Produits & Segmentation CA
                </span>
              </Space>
            }
            className="rounded-2xl border border-slate-200/90 shadow-xs h-full"
          >
            <div className="space-y-3">
              {revenueStreams.map((stream) => (
                <div
                  key={stream.code}
                  className="p-3 rounded-xl border bg-slate-50 border-slate-100"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <span style={{ color: stream.color }}>{stream.icon}</span>
                      <span>{stream.title}</span>
                    </div>
                    <span className="text-xs font-black" style={{ color: stream.color }}>
                      {stream.montant.toLocaleString("fr-FR")} MAD
                    </span>
                  </div>
                  <Progress
                    percent={stream.pourcentage}
                    strokeColor={stream.color}
                    size="small"
                    className="mb-1 m-0"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{stream.details}</span>
                    <span className="font-bold text-emerald-600">{stream.croissance}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3.3. Palmarès & Benchmark Multi-Sites */}
      <Card
        title={
          <Space>
            <BarChartOutlined className="text-secondary text-lg" />
            <span className="font-bold text-slate-900">
              Classement & Benchmark Multi-Sites {selectedSite ? `— Zoom sur ${selectedSite.nom}` : "du Réseau RRM"}
            </span>
          </Space>
        }
        className="rounded-2xl border border-slate-200/90 shadow-xs"
      >
        <Table
          dataSource={displaySites}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: 800 }}
          columns={[
            {
              title: "Parc de Stationnement",
              key: "nom",
              render: (_, record) => (
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm">{record.nom}</strong>
                    <Tag color="blue" className="font-bold text-[10px]">{record.code}</Tag>
                  </div>
                  <span className="text-xs text-slate-500">{record.quartier}</span>
                </div>
              ),
            },
            {
              title: "Capacité",
              dataIndex: "capacite",
              key: "capacite",
              render: (c) => <span className="font-bold text-slate-700">{c} places</span>,
            },
            {
              title: "Taux d'Occupation",
              dataIndex: "occupationTaux",
              key: "occupationTaux",
              sorter: (a, b) => a.occupationTaux - b.occupationTaux,
              render: (taux) => (
                <div className="min-w-[120px]">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{taux}%</span>
                    <span className={taux >= 90 ? "text-rose-700" : "text-emerald-700"}>
                      {taux >= 90 ? "Très Élevé" : "Optimal"}
                    </span>
                  </div>
                  <Progress
                    percent={taux}
                    size="small"
                    strokeColor={taux >= 90 ? "#982B5E" : "#0284c7"}
                  />
                </div>
              ),
            },
            {
              title: filters.periode ? "CA Période" : "CA Mensuel",
              dataIndex: "caMensuel",
              key: "caMensuel",
              sorter: (a, b) => a.caMensuel - b.caMensuel,
              render: (ca) => (
                <strong className="text-emerald-700 text-sm">
                  {Math.round(ca * dateFactor).toLocaleString("fr-FR")} MAD
                </strong>
              ),
            },
            {
              title: "Rendement / Place",
              dataIndex: "rendementParPlace",
              key: "rendementParPlace",
              sorter: (a, b) => a.rendementParPlace - b.rendementParPlace,
              render: (r) => (
                <span className="text-xs font-bold text-slate-800">
                  {r} MAD / pl. / mois
                </span>
              ),
            },
            {
              title: "Rotation Véhicules",
              dataIndex: "rotationVehicules",
              key: "rotationVehicules",
              render: (rot) => (
                <Tag color="cyan" className="font-bold">
                  {rot} véh./pl./j
                </Tag>
              ),
            },
            {
              title: "Qualité Service",
              dataIndex: "satisfaction",
              key: "satisfaction",
              render: (sat) => (
                <Tag color="green" className="font-bold">
                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                  {sat}%
                </Tag>
              ),
            },
          ]}
        />
      </Card>

      {/* 3.4. Module Détaillé du Chiffre d'Affaires par Parking & Analyse Temporelle (Synchronisé avec le filtre) */}
      <ChiffreAffairesParkingTable
        externalParkingId={filters.parkingId}
        externalDateRange={filters.periode}
      />
    </div>
  );
}
