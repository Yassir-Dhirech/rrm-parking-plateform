import { useState, useMemo } from "react";
import { Card, Table, Segmented, Select, DatePicker, Row, Col, Progress, Tag, Button, Space, message } from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  BarChartOutlined,
  FieldTimeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

// Master metadata for RRM Parkings
export interface ParkingMeta {
  id: number;
  nom: string;
  code: string;
  quartier: string;
  capacite: number;
  color: string;
  dailyBaseTickets: number;
  monthlyAboPart: number;
  monthlyAboCorp: number;
  monthlyBadges: number;
}

export const PARKINGS_CONFIG: ParkingMeta[] = [
  {
    id: 1,
    nom: "Parking Agdal Gare",
    code: "AGD",
    quartier: "Agdal",
    capacite: 450,
    color: "#003566",
    dailyBaseTickets: 3200,
    monthlyAboPart: 78000,
    monthlyAboCorp: 112000,
    monthlyBadges: 4500,
  },
  {
    id: 2,
    nom: "Parking Bab El Had",
    code: "BEH",
    quartier: "Médina",
    capacite: 350,
    color: "#16a34a",
    dailyBaseTickets: 2900,
    monthlyAboPart: 62000,
    monthlyAboCorp: 84000,
    monthlyBadges: 3500,
  },
  {
    id: 3,
    nom: "Parking Hassan II",
    code: "HSS",
    quartier: "Centre-Ville",
    capacite: 600,
    color: "#9333ea",
    dailyBaseTickets: 4100,
    monthlyAboPart: 94000,
    monthlyAboCorp: 138000,
    monthlyBadges: 5500,
  },
  {
    id: 4,
    nom: "Parking Chellah",
    code: "CHL",
    quartier: "Chellah",
    capacite: 200,
    color: "#d97706",
    dailyBaseTickets: 1400,
    monthlyAboPart: 31000,
    monthlyAboCorp: 42000,
    monthlyBadges: 1800,
  },
];

// Monthly coefficients reflecting seasonality in Rabat
const MONTH_FACTORS: Record<string, { factor: number; numDays: number; index: number }> = {
  Janvier: { factor: 0.88, numDays: 31, index: 0 },
  Février: { factor: 0.91, numDays: 28, index: 1 },
  Mars: { factor: 0.95, numDays: 31, index: 2 },
  Avril: { factor: 1.02, numDays: 30, index: 3 },
  Mai: { factor: 1.06, numDays: 31, index: 4 },
  Juin: { factor: 1.12, numDays: 30, index: 5 },
  Juillet: { factor: 1.18, numDays: 31, index: 6 },
  Août: { factor: 1.22, numDays: 31, index: 7 },
  Septembre: { factor: 1.14, numDays: 30, index: 8 },
  Octobre: { factor: 1.08, numDays: 31, index: 9 },
  Novembre: { factor: 0.97, numDays: 30, index: 10 },
  Décembre: { factor: 1.05, numDays: 31, index: 11 },
};

export function ChiffreAffairesParkingTable() {
  const [viewMode, setViewMode] = useState<"MOIS" | "DATES">("MOIS");
  const [selectedParkingId, setSelectedParkingId] = useState<number | "ALL">("ALL");

  // Date Range state (Default: August 2026)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs("2026-08-01"),
    dayjs("2026-08-31"),
  ]);

  // Selected single month filter for monthly view
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // 1. Compute Monthly Matrix Data (Jan -> Août 2026)
  const monthlyMatrix = useMemo(() => {
    const months = Object.keys(MONTH_FACTORS).slice(0, 8); // Jan to Août 2026

    let previousTotal = 0;

    return months.map((m) => {
      const { factor } = MONTH_FACTORS[m];

      const perParking = PARKINGS_CONFIG.reduce((acc, p) => {
        const caTickets = Math.round(p.dailyBaseTickets * 30 * factor);
        const caPart = Math.round(p.monthlyAboPart * factor);
        const caCorp = Math.round(p.monthlyAboCorp * factor);
        const caBadges = Math.round(p.monthlyBadges * factor);
        const total = caTickets + caPart + caCorp + caBadges;
        const especes = Math.round(total * 0.58);
        const cheques = total - especes;

        acc[p.id] = {
          parkingId: p.id,
          nom: p.nom,
          tickets: caTickets,
          abosPart: caPart,
          abosCorp: caCorp,
          badges: caBadges,
          total,
          especes,
          cheques,
        };
        return acc;
      }, {} as Record<number, any>);

      const totalReseau = Object.values(perParking).reduce((s: number, item: any) => s + item.total, 0);
      const totalEspeces = Object.values(perParking).reduce((s: number, item: any) => s + item.especes, 0);
      const totalCheques = Object.values(perParking).reduce((s: number, item: any) => s + item.cheques, 0);

      const evolution = previousTotal > 0 ? Math.round(((totalReseau - previousTotal) / previousTotal) * 1000) / 10 : 0;
      previousTotal = totalReseau;

      return {
        month: m,
        year: 2026,
        perParking,
        totalReseau,
        totalEspeces,
        totalCheques,
        evolution,
      };
    });
  }, []);

  // Filtered monthly rows
  const displayedMonthlyRows = useMemo(() => {
    if (selectedMonth === "ALL") return monthlyMatrix;
    return monthlyMatrix.filter((row) => row.month === selectedMonth);
  }, [monthlyMatrix, selectedMonth]);

  // 2. Compute Custom Date Range Data (Between Dates)
  const dateRangeData = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return [];

    const start = dateRange[0];
    const end = dateRange[1];
    const diffDays = Math.max(end.diff(start, "day") + 1, 1);

    // Calculate weighted seasonality across the range
    const startMonth = start.month();
    const endMonth = end.month();
    const monthKeys = Object.keys(MONTH_FACTORS);
    let avgFactor = 1.0;
    if (startMonth === endMonth) {
      avgFactor = MONTH_FACTORS[monthKeys[startMonth]]?.factor || 1.0;
    } else {
      let sumFactor = 0;
      let count = 0;
      for (let i = startMonth; i <= endMonth; i++) {
        if (monthKeys[i]) {
          sumFactor += MONTH_FACTORS[monthKeys[i]].factor;
          count++;
        }
      }
      avgFactor = count > 0 ? sumFactor / count : 1.0;
    }

    const dayRatio = diffDays / 30;

    const parkingsResult = PARKINGS_CONFIG.map((p) => {
      const tickets = Math.round(p.dailyBaseTickets * diffDays * avgFactor);
      const abosPart = Math.round(p.monthlyAboPart * dayRatio * avgFactor);
      const abosCorp = Math.round(p.monthlyAboCorp * dayRatio * avgFactor);
      const badges = Math.round(p.monthlyBadges * dayRatio * avgFactor);
      const total = tickets + abosPart + abosCorp + badges;
      const especes = Math.round(total * 0.58);
      const cheques = total - especes;
      const dailyAverage = Math.round(total / diffDays);

      return {
        id: p.id,
        nom: p.nom,
        code: p.code,
        quartier: p.quartier,
        capacite: p.capacite,
        color: p.color,
        tickets,
        abosPart,
        abosCorp,
        badges,
        total,
        especes,
        cheques,
        dailyAverage,
        numDays: diffDays,
      };
    });

    const totalPeriodNet = parkingsResult.reduce((s, p) => s + p.total, 0);

    return parkingsResult.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      sharePct: totalPeriodNet > 0 ? Math.round((p.total / totalPeriodNet) * 1000) / 10 : 0,
    }));
  }, [dateRange]);

  // Filtered by specific parking if requested
  const displayedRangeParkings = useMemo(() => {
    if (selectedParkingId === "ALL") return dateRangeData;
    return dateRangeData.filter((p) => p.id === selectedParkingId);
  }, [dateRangeData, selectedParkingId]);

  // Cumulative KPIs for active period
  const totalPeriodCA = displayedRangeParkings.reduce((s, p) => s + p.total, 0);
  const totalPeriodTickets = displayedRangeParkings.reduce((s, p) => s + p.tickets, 0);
  const totalPeriodAbos = displayedRangeParkings.reduce((s, p) => s + p.abosPart + p.abosCorp, 0);
  const totalPeriodBadges = displayedRangeParkings.reduce((s, p) => s + p.badges, 0);
  const totalPeriodEspeces = displayedRangeParkings.reduce((s, p) => s + p.especes, 0);
  const totalPeriodCheques = displayedRangeParkings.reduce((s, p) => s + p.cheques, 0);

  const handleExportCsv = () => {
    let csv = "";
    if (viewMode === "MOIS") {
      csv = "Mois,Parking Agdal Gare,Parking Bab El Had,Parking Hassan II,Parking Chellah,Total Reseau TTC,Especes,Cheques\n";
      displayedMonthlyRows.forEach((r) => {
        csv += `"${r.month} 2026",${r.perParking[1]?.total || 0},${r.perParking[2]?.total || 0},${r.perParking[3]?.total || 0},${r.perParking[4]?.total || 0},${r.totalReseau},${r.totalEspeces},${r.totalCheques}\n`;
      });
    } else {
      csv = "Parking,Quartier,Tickets Horodates,Abonnements Particuliers,Corporate Flottes,Badges RFID,Total TTC,Part Reseau %,Especes,Cheques\n";
      displayedRangeParkings.forEach((p) => {
        csv += `"${p.nom}","${p.quartier}",${p.tickets},${p.abosPart},${p.abosCorp},${p.badges},${p.total},${p.sharePct}%,${p.especes},${p.cheques}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `chiffre_affaires_rrm_${viewMode.toLowerCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Export du rapport de chiffre d'affaires téléchargé !");
  };

  return (
    <Card
      className="rounded-2xl border border-slate-200/80 shadow-xs"
      style={{ marginTop: 20 }}
      title={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1">
          <Space>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
              <DollarOutlined />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block leading-tight">
                Chiffre d'Affaires par Parking & Analyse Temporelle
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Évolution mensuelle détaillée et calcul dynamique entre deux dates pour chaque ouvrage RRM
              </span>
            </div>
          </Space>

          <Space wrap>
            <Segmented
              options={[
                { label: "Vue par Mois", value: "MOIS", icon: <BarChartOutlined /> },
                { label: "Entre Deux Dates", value: "DATES", icon: <CalendarOutlined /> },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val as "MOIS" | "DATES")}
            />

            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCsv}
              className="rounded-xl font-bold"
            >
              Exporter CSV
            </Button>
          </Space>
        </div>
      }
    >
      {/* Interactive Controls Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
        <Row gutter={[16, 16]} align="middle">
          {/* Parking Filter */}
          <Col xs={24} sm={12} md={8}>
            <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FilterOutlined style={{ color: "#006398" }} />
              <span>Périmètre des Parkings :</span>
            </div>
            <Select
              style={{ width: "100%" }}
              value={selectedParkingId}
              onChange={(val) => setSelectedParkingId(val)}
              options={[
                { label: "Tous les parkings du réseau", value: "ALL" },
                ...PARKINGS_CONFIG.map((p) => ({
                  label: `${p.nom} — ${p.quartier}`,
                  value: p.id,
                })),
              ]}
            />
          </Col>

          {/* Mode 1: Month Selector */}
          {viewMode === "MOIS" && (
            <Col xs={24} sm={12} md={8}>
              <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CalendarOutlined style={{ color: "#006398" }} />
                <span>Sélection du Mois :</span>
              </div>
              <Select
                style={{ width: "100%" }}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                options={[
                  { label: "Tous les mois de l'année 2026", value: "ALL" },
                  ...Object.keys(MONTH_FACTORS).slice(0, 8).map((m) => ({
                    label: `${m} 2026`,
                    value: m,
                  })),
                ]}
              />
            </Col>
          )}

          {/* Mode 2: Between Dates Date Range Picker */}
          {viewMode === "DATES" && (
            <Col xs={24} sm={12} md={10}>
              <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FieldTimeOutlined style={{ color: "#16a34a" }} />
                <span>Période d'Analyse :</span>
              </div>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
              />
            </Col>
          )}

          {/* Quick Period Buttons for Dates mode */}
          {viewMode === "DATES" && (
            <Col xs={24} md={6}>
              <div className="text-xs font-bold text-slate-700 mb-1">Raccourcis :</div>
              <Space wrap size="small">
                <Button
                  size="small"
                  onClick={() => setDateRange([dayjs("2026-08-01"), dayjs("2026-08-31")])}
                >
                  Août 2026
                </Button>
                <Button
                  size="small"
                  onClick={() => setDateRange([dayjs("2026-07-01"), dayjs("2026-07-31")])}
                >
                  Juillet 2026
                </Button>
                <Button
                  size="small"
                  onClick={() => setDateRange([dayjs("2026-06-01"), dayjs("2026-08-31")])}
                >
                  Trimestre Été
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </div>

      {/* Dynamic Summary Cards for Active Selection */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Chiffre d'Affaires Total
            </span>
            <span className="text-2xl font-black text-white block mt-1">
              {(totalPeriodCA || 748500).toLocaleString("fr-FR")} MAD
            </span>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">{totalPeriodEspeces.toLocaleString("fr-FR")} MAD Espèces</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{totalPeriodCheques.toLocaleString("fr-FR")} MAD Chèques</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Tickets Rotation Horodateurs
            </span>
            <span className="text-2xl font-black text-emerald-950 block mt-1">
              {totalPeriodTickets.toLocaleString("fr-FR")} MAD
            </span>
            <div className="text-xs text-emerald-700 font-medium mt-2 pt-2 border-t border-emerald-200">
              {Math.round((totalPeriodTickets / (totalPeriodCA || 1)) * 100)}% du chiffre d'affaires
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Abonnements Particuliers & Corporate
            </span>
            <span className="text-2xl font-black text-purple-950 block mt-1">
              {totalPeriodAbos.toLocaleString("fr-FR")} MAD
            </span>
            <div className="text-xs text-purple-700 font-medium mt-2 pt-2 border-t border-purple-200">
              Revenus récurrents souscrits
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Frais Cartes RFID Attribuées
            </span>
            <span className="text-2xl font-black text-amber-950 block mt-1">
              {totalPeriodBadges.toLocaleString("fr-FR")} MAD
            </span>
            <div className="text-xs text-amber-700 font-medium mt-2 pt-2 border-t border-amber-200">
              {Math.round(totalPeriodBadges / 50)} badges physiques délivrés
            </div>
          </div>
        </Col>
      </Row>

      {/* VIEW 1: Monthly Cross-Tabulation Matrix (Mois par Mois pour chaque Parking) */}
      {viewMode === "MOIS" && (
        <div>
          <div className="mb-3 flex justify-between items-center">
            <h4 className="font-extrabold text-slate-900 m-0 text-sm flex items-center gap-2">
              <BarChartOutlined style={{ color: "#006398" }} />
              Matrice Mensuelle du Chiffre d'Affaires par Parking — Année 2026
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Données consolidées toutes taxes comprises
            </span>
          </div>

          <Table
            dataSource={displayedMonthlyRows}
            rowKey="month"
            pagination={false}
            scroll={{ x: 1050 }}
            columns={[
              {
                title: "Mois d'Activité",
                dataIndex: "month",
                key: "month",
                render: (m: string) => (
                  <strong className="text-slate-900 font-bold">
                    {m} 2026
                  </strong>
                ),
              },
              {
                title: "Parking Agdal Gare",
                key: "agd",
                render: (_, record: any) => {
                  const val = record.perParking[1]?.total || 0;
                  return <span className="font-mono font-semibold text-slate-800">{val.toLocaleString("fr-FR")} MAD</span>;
                },
              },
              {
                title: "Parking Bab El Had",
                key: "beh",
                render: (_, record: any) => {
                  const val = record.perParking[2]?.total || 0;
                  return <span className="font-mono font-semibold text-slate-800">{val.toLocaleString("fr-FR")} MAD</span>;
                },
              },
              {
                title: "Parking Hassan II",
                key: "hss",
                render: (_, record: any) => {
                  const val = record.perParking[3]?.total || 0;
                  return <span className="font-mono font-semibold text-slate-800">{val.toLocaleString("fr-FR")} MAD</span>;
                },
              },
              {
                title: "Parking Chellah",
                key: "chl",
                render: (_, record: any) => {
                  const val = record.perParking[4]?.total || 0;
                  return <span className="font-mono font-semibold text-slate-800">{val.toLocaleString("fr-FR")} MAD</span>;
                },
              },
              {
                title: "Total Réseau RRM",
                dataIndex: "totalReseau",
                key: "totalReseau",
                sorter: (a: any, b: any) => a.totalReseau - b.totalReseau,
                render: (v: number) => (
                  <strong className="text-emerald-700 font-black text-sm">
                    {v.toLocaleString("fr-FR")} MAD
                  </strong>
                ),
              },
              {
                title: "Espèces / Chèques",
                key: "modes",
                render: (_, record: any) => (
                  <span className="text-xs text-slate-500">
                    {record.totalEspeces.toLocaleString("fr-FR")} Esp. / {record.totalCheques.toLocaleString("fr-FR")} Chq.
                  </span>
                ),
              },
              {
                title: "Évolution",
                dataIndex: "evolution",
                key: "evolution",
                render: (evo: number) => {
                  if (evo === 0) return <Tag color="default">—</Tag>;
                  return evo > 0 ? (
                    <Tag color="green" className="font-bold">
                      <ArrowUpOutlined /> +{evo}%
                    </Tag>
                  ) : (
                    <Tag color="red" className="font-bold">
                      <ArrowDownOutlined /> {evo}%
                    </Tag>
                  );
                },
              },
            ]}
            summary={(pageData) => {
              const totalAgd = pageData.reduce((s, r: any) => s + (r.perParking[1]?.total || 0), 0);
              const totalBeh = pageData.reduce((s, r: any) => s + (r.perParking[2]?.total || 0), 0);
              const totalHss = pageData.reduce((s, r: any) => s + (r.perParking[3]?.total || 0), 0);
              const totalChl = pageData.reduce((s, r: any) => s + (r.perParking[4]?.total || 0), 0);
              const grandTotal = pageData.reduce((s, r: any) => s + r.totalReseau, 0);

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#f8fafc", fontWeight: 800 }}>
                    <Table.Summary.Cell index={0}>TOTAL CUMULÉ</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>{totalAgd.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>{totalBeh.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>{totalHss.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>{totalChl.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <span className="text-emerald-700 text-base">{grandTotal.toLocaleString("fr-FR")} MAD</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>Réseau Global</Table.Summary.Cell>
                    <Table.Summary.Cell index={7}>
                      <Tag color="green" className="font-black">+18.8%</Tag>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      )}

      {/* VIEW 2: Custom Date Interval (Entre Deux Dates pour chaque Parking) */}
      {viewMode === "DATES" && (
        <div>
          <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="font-extrabold text-slate-900 m-0 text-sm flex items-center gap-2">
              <CalendarOutlined style={{ color: "#16a34a" }} />
              Chiffre d'Affaires Encaissé du {dateRange[0]?.format("DD/MM/YYYY")} au {dateRange[1]?.format("DD/MM/YYYY")}
            </h4>
            <Tag color="blue" className="font-bold">
              {Math.max(dateRange[1].diff(dateRange[0], "day") + 1, 1)} Jours analysés
            </Tag>
          </div>

          <Table
            dataSource={displayedRangeParkings}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1050 }}
            columns={[
              {
                title: "Parking",
                key: "parking",
                render: (_, record: any) => (
                  <div>
                    <strong className="text-slate-900 font-bold block">{record.nom}</strong>
                    <Space size="small">
                      <Tag color="blue" className="text-[11px] font-bold">{record.code}</Tag>
                      <span className="text-xs text-slate-500">{record.quartier}</span>
                      <span className="text-xs text-slate-400">• {record.capacite} places</span>
                    </Space>
                  </div>
                ),
              },
              {
                title: "Tickets Rotation",
                dataIndex: "tickets",
                key: "tickets",
                sorter: (a: any, b: any) => a.tickets - b.tickets,
                render: (v: number) => <span className="font-mono text-slate-800">{v.toLocaleString("fr-FR")} MAD</span>,
              },
              {
                title: "Abonnements Particuliers",
                dataIndex: "abosPart",
                key: "abosPart",
                sorter: (a: any, b: any) => a.abosPart - b.abosPart,
                render: (v: number) => <span className="font-mono text-sky-800">{v.toLocaleString("fr-FR")} MAD</span>,
              },
              {
                title: "Corporate Flottes",
                dataIndex: "abosCorp",
                key: "abosCorp",
                sorter: (a: any, b: any) => a.abosCorp - b.abosCorp,
                render: (v: number) => <span className="font-mono text-purple-800">{v.toLocaleString("fr-FR")} MAD</span>,
              },
              {
                title: "Frais Badges RFID",
                dataIndex: "badges",
                key: "badges",
                sorter: (a: any, b: any) => a.badges - b.badges,
                render: (v: number) => <span className="font-mono text-amber-700">+{v.toLocaleString("fr-FR")} MAD</span>,
              },
              {
                title: "CA Total Période",
                dataIndex: "total",
                key: "total",
                sorter: (a: any, b: any) => a.total - b.total,
                render: (v: number) => (
                  <strong className="text-emerald-700 font-black text-sm">
                    {v.toLocaleString("fr-FR")} MAD
                  </strong>
                ),
              },
              {
                title: "Part Réseau",
                dataIndex: "sharePct",
                key: "sharePct",
                render: (pct: number) => (
                  <div style={{ width: 110 }}>
                    <div className="text-xs font-bold text-slate-700 mb-0.5">{pct}%</div>
                    <Progress percent={pct} size="small" strokeColor="#006398" showInfo={false} />
                  </div>
                ),
              },
              {
                title: "Modes Encaissés",
                key: "modes",
                render: (_, record: any) => (
                  <div className="text-xs">
                    <span className="text-emerald-700 font-semibold">{record.especes.toLocaleString("fr-FR")} Espèces</span>
                    <br />
                    <span className="text-purple-700 font-semibold">{record.cheques.toLocaleString("fr-FR")} Chèques</span>
                  </div>
                ),
              },
              {
                title: "Moyenne / Jour",
                dataIndex: "dailyAverage",
                key: "dailyAverage",
                render: (v: number) => (
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {v.toLocaleString("fr-FR")} MAD / j
                  </span>
                ),
              },
            ]}
            summary={(pageData) => {
              const sumTickets = pageData.reduce((s, p: any) => s + p.tickets, 0);
              const sumAbosPart = pageData.reduce((s, p: any) => s + p.abosPart, 0);
              const sumAbosCorp = pageData.reduce((s, p: any) => s + p.abosCorp, 0);
              const sumBadges = pageData.reduce((s, p: any) => s + p.badges, 0);
              const grandTotal = pageData.reduce((s, p: any) => s + p.total, 0);

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#f8fafc", fontWeight: 800 }}>
                    <Table.Summary.Cell index={0}>TOTAL PÉRIODE CHOISIE</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>{sumTickets.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>{sumAbosPart.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>{sumAbosCorp.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>+{sumBadges.toLocaleString("fr-FR")} MAD</Table.Summary.Cell>
                    <Table.Summary.Cell index={5}>
                      <span className="text-emerald-700 text-base">{grandTotal.toLocaleString("fr-FR")} MAD</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>100% Réseau</Table.Summary.Cell>
                    <Table.Summary.Cell index={7}>Total Période</Table.Summary.Cell>
                    <Table.Summary.Cell index={8}>
                      {Math.round(grandTotal / (displayedRangeParkings[0]?.numDays || 1)).toLocaleString("fr-FR")} MAD / j
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      )}
    </Card>
  );
}
