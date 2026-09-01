import { useState } from "react";
import { Row, Col, Card, Progress, Tag, Tooltip, Space, Button, Select, Table, Dropdown, Badge, message } from "antd";
import {
  FileTextOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  FileDoneOutlined,
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
import { ChiffreAffairesParkingTable } from "./ChiffreAffairesParkingTable";

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
        message.success("Filtre réinitialisé : Vue globale réseau");
      } else {
        message.success("Indicateurs actualisés en temps réel");
      }
    }, 400);
  };

  const handleOpenPlans = (parking: any) => {
    setSelectedParkingForPlans(parking);
    setPlansModalOpen(true);
  };

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

  const totalCorporateCount = displayedParkings.reduce((sum, p) => sum + p.contratsCorporate, 0);
  const totalAbosParticuliers = displayedParkings.reduce((sum, p) => sum + p.abosParticulier, 0);
  const totalAbosCorporate = displayedParkings.reduce((sum, p) => sum + p.abosCorporate, 0);
  const totalAbonnes = totalAbosParticuliers + totalAbosCorporate;

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
            <Tooltip title={isFiltered ? "Réinitialiser le filtre" : "Actualiser les indicateurs en temps réel"}>
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

            {/* 3. Primary Decision Action: Situation Contrats with Notification Badge */}
            <Badge count={filteredContracts.length} offset={[-2, 2]}>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => navigate("/responsable/contrats")}
                className="font-bold rounded-xl shadow-xs flex items-center gap-1.5 h-9"
                style={{ backgroundColor: "#003566", borderColor: "#003566" }}
              >
                <span>Situation Contrats</span>
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. Indicateurs Clés de Gouvernance (4 Cartes Synthétiques) */}
      <Row gutter={[16, 16]}>
        {/* KPI 1: Chiffre d'Affaires Réseau */}
        <Col xs={24} sm={12} lg={6}>
          <div className="h-full p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                  {isFiltered ? `CA — ${currentParking?.nom}` : "Chiffre d'Affaires — Août"}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-tight block mt-1">
                  {totalCA.toLocaleString("fr-FR")} MAD
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <DollarOutlined />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="text-emerald-700 font-bold">Abos : {(totalCAAbos / 1000).toFixed(0)}k MAD</span>
              <span>•</span>
              <span className="text-sky-700 font-bold">Tickets : {(totalCATickets / 1000).toFixed(0)}k MAD</span>
            </div>
          </div>
        </Col>

        {/* KPI 2: Taux d'Occupation Réseau */}
        <Col xs={24} sm={12} lg={6}>
          <div className="h-full p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                  {isFiltered ? `Occupation — ${currentParking?.nom}` : "Occupation Globale Réseau"}
                </span>
                <span className="text-2xl font-black text-slate-900 leading-tight block mt-1">
                  {tauxOccupationGlobal}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <ApartmentOutlined />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">{totalOccupes} occupées / {totalCapacite} pl.</span>
              <Tag color="green" className="font-bold m-0 text-[11px]">{totalLibres} libres</Tag>
            </div>
          </div>
        </Col>

        {/* KPI 3: Grands Comptes & Abonnés Actifs */}
        <Col xs={24} sm={12} lg={6}>
          <div className="h-full p-4 rounded-2xl bg-white border border-purple-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider block">
                  Abonnés & Flottes Sous Gestion
                </span>
                <span className="text-2xl font-black text-purple-950 leading-tight block mt-1">
                  {totalAbonnes.toLocaleString("fr-FR")} Abonnés
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <FileTextOutlined />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-purple-700 font-bold">{totalCorporateCount} Corporate</span>
              <span>•</span>
              <span className="text-sky-700 font-bold">{totalAbosParticuliers} Résidents</span>
            </div>
          </div>
        </Col>

        {/* KPI 4: Décisions Requises (Contrats et Factures) */}
        <Col xs={24} sm={12} lg={6}>
          <div className="h-full p-4 rounded-2xl bg-white border border-sky-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-sky-900 uppercase tracking-wider block">
                  Visas & Décisions en Attente
                </span>
                <span className="text-2xl font-black text-slate-900 leading-tight block mt-1">
                  {filteredContracts.length + filteredFactures.length} Dossiers
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#003566] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <SafetyCertificateOutlined />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-purple-700 font-bold">{filteredContracts.length} Contrats</span>
              <span>•</span>
              <span className="text-[#003566] font-bold">{filteredFactures.length} Factures</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Chiffre d'Affaires Détaillé par Parking : Mensuel & Entre Deux Dates */}
      <ChiffreAffairesParkingTable />

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



      {/* 6. Executive Action Tables (Pending Contracts & Invoices) */}
      <Row gutter={[16, 16]}>
        {/* Pending Contracts Table */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Space>
                  <FileTextOutlined style={{ color: "#006398" }} />
                  <span className="font-extrabold text-slate-900">
                    Situation des Contrats Corporate
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
                      style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                      className="rounded-lg"
                    >
                      Gérer Situation
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



      {/* Parking Plans Tarifaires Pre-filled Modal */}
      <ParkingPlansTarifairesModal
        open={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
        parking={selectedParkingForPlans}
      />
    </div>
  );
}
