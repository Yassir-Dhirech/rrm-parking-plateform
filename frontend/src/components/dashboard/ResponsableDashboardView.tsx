import { useState } from "react";
import { Row, Col, Card, Progress, Tag, Tooltip, Space, Button, Table, Dropdown, message } from "antd";
import {
  FileTextOutlined,
  SafetyCertificateOutlined,
  FileDoneOutlined,
  ApartmentOutlined,
  TagsOutlined,
  SettingOutlined,
  DownOutlined,
  ScanOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../lib/dateUtils";
import { ParkingPlansTarifairesModal } from "../parkings/ParkingPlansTarifairesModal";
import { ChiffreAffairesParkingTable } from "./ChiffreAffairesParkingTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContratsMock, enregistrerScanContratMock } from "../../api/contratsMock";
import { ScannerContratModal } from "../../features/contrats/components/ScannerContratModal";
import { VisualiserScanContratModal } from "../../features/contrats/components/VisualiserScanContratModal";
import type { ContratScanInfo } from "../../features/contrats/types";
import { ResponsableParkingMap } from "./ResponsableParkingMap";
import { ResponsableKpiRow } from "./ResponsableKpiRow";
import { ResponsableActiveSubscriptionsByParkingChart } from "./ResponsableActiveSubscriptionsByParkingChart";
import { ResponsableMonthlyRevenueAreaChart } from "./ResponsableMonthlyRevenueAreaChart";
import { ResponsablePendingValidationList } from "./ResponsablePendingValidationList";
import { ResponsableParkingMixDonut } from "./ResponsableParkingMixDonut";
import "./ResponsableDashboardGlass.css";

export function ResponsableDashboardView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSiteFilter] = useState<number | null>(null);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [selectedParkingForPlans, setSelectedParkingForPlans] = useState<any | null>(null);

  const [selectedContratToScan, setSelectedContratToScan] = useState<any | null>(null);
  const [selectedContratToView, setSelectedContratToView] = useState<any | null>(null);

  const { data: contratsList = [] } = useQuery({
    queryKey: ["contrats"],
    queryFn: getContratsMock,
  });

  const scanMutation = useMutation({
    mutationFn: ({ id, scanInfo }: { id: number; scanInfo: ContratScanInfo }) =>
      enregistrerScanContratMock(id, scanInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
      setSelectedContratToScan(null);
      message.success("Contrat corporate numÃƒÂ©risÃƒÂ© et archivÃƒÂ© avec succÃƒÂ¨s !");
    },
  });

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
      abosParticulier: 180,  // 100% allouÃƒÂ©
      quotaCorporate: 135,   // 30%
      abosCorporate: 135,    // 100% allouÃƒÂ©
      ticketsHorodates: 100, // 22%
      placesLibres: 35,      // 8%
      tauxOccupation: 92.2,
      statutColor: "#ef4444", // Red
      statutText: "Alerte Saturation",
      statut: "CRITIQUE",
      caMensuel: 235000,
      caAbos: 165000,
      caTickets: 70000,
      caEspeces: 141000,
      caCheques: 94000,
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
      caMensuel: 155000,
      caAbos: 110000,
      caTickets: 45000,
      caEspeces: 85250,
      caCheques: 69750,
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
      caMensuel: 98000,
      caAbos: 72000,
      caTickets: 26000,
      caEspeces: 53900,
      caCheques: 44100,
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
      caMensuel: 60000,
      caAbos: 44000,
      caTickets: 16000,
      caEspeces: 33000,
      caCheques: 27000,
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

  // Pending Executive Approvals (Corporate Contracts & Invoices)
  const pendingContracts = [
    {
      id: 2,
      parkingId: 1,
      parkingNom: "Parking Agdal Gare",
      reference: "CTR-2026-000002",
      entrepriseNom: "SociÃƒÂ©tÃƒÂ© Atlas Trans",
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
      entrepriseNom: "Banque Centrale Populaire RÃƒÂ©gion",
      nombreAbonnements: 25,
      formule: "Pass Ãƒâ€°tendu 08h-22h (550 MAD)",
      montantMensuel: 13750,
      duree: "20 Ans (240 Mois)",
      dateCreation: "14/08/2026",
    },
    {
      id: 8,
      parkingId: 2,
      parkingNom: "Parking Hassan II",
      reference: "CTR-2026-000008",
      entrepriseNom: "Clinique Agdal SantÃƒÂ©",
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
      clientNom: "SociÃƒÂ©tÃƒÂ© Atlas Trans",
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
      dateEmission: "01/10/2025",
    },
  ];

  const filteredContracts = (selectedSiteFilter
    ? pendingContracts.filter((c) => c.parkingId === selectedSiteFilter)
    : pendingContracts
  ).map((c) => {
    const matched = contratsList.find(
      (item) => item.id === c.id || item.entrepriseNom.toLowerCase().includes(c.entrepriseNom.toLowerCase())
    );
    return {
      ...c,
      scanInfo: matched?.scanInfo,
      matchedContratId: matched?.id || c.id,
    };
  });

  const filteredFactures = selectedSiteFilter
    ? pendingFactures.filter((f) => f.parkingId === selectedSiteFilter)
    : pendingFactures;

  return (
    <div className="space-y-6 responsable-dashboard-glass">
      {/* Vue exÃ©cutive : KPI + graphiques Ã  gauche, carte/dÃ©tails Ã  droite */}
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={16}>
          <div className="space-y-4">
            <ResponsableKpiRow parkingId={selectedSiteFilter} />

            <Row gutter={[16, 16]} align="top">
              <Col xs={24} lg={12}>
                <div className="space-y-4">
                  <ResponsableActiveSubscriptionsByParkingChart />
                  <ResponsablePendingValidationList />
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <div className="space-y-4">
                  <ResponsableMonthlyRevenueAreaChart />
                  <ResponsableParkingMixDonut />
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} xl={8}>
          <ResponsableParkingMap />
        </Col>
      </Row>

      {/* Chiffre d'Affaires DÃ©taillÃ© par Parking : Mensuel & Entre Deux Dates */}
      <ChiffreAffairesParkingTable />

      {/* 4. Parking Quotas & Saturation: Circular Dial + Rectangular Track for Each Site */}
      <Card
        title={
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Space>
              <ApartmentOutlined style={{ color: "#006398" }} />
              <span className="font-extrabold text-slate-900">
                Pression des Quotas & Taux d'Occupation Temps RÃƒÂ©el par Site
              </span>
            </Space>
            <Tag color="blue" className="font-black m-0">
              RÃƒÂ¨gle : 50% Tickets / 50% Abonnements (40% Particuliers / 60% Corporate)
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
                              label: <span>GÃƒÂ©rer Quotas & Ouvrage</span>,
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
                          ParamÃƒÂ¨tres <DownOutlined style={{ fontSize: 9 }} />
                        </Button>
                      </Dropdown>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                      CapacitÃƒÂ© Globale : <strong>{p.capaciteTotal} places</strong>
                    </span>
                    <div className="mt-2 text-xs font-bold">
                      DisponibilitÃƒÂ© ImmÃƒÂ©diate :{" "}
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
                GÃƒÂ©rer Ã¢â€ â€™
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
                  title: "RÃƒÂ©fÃƒÂ©rence",
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
                  title: "MensualitÃƒÂ© HT",
                  dataIndex: "montantMensuel",
                  key: "montantMensuel",
                  render: (val: number) => (
                    <strong className="text-emerald-700">{val.toLocaleString("fr-FR")} MAD</strong>
                  ),
                },
                {
                  title: "Scan Contrat",
                  key: "scanInfo",
                  render: (_, record: any) => {
                    if (record.scanInfo?.scanne) {
                      return (
                        <Tooltip title={`NumÃƒÂ©risÃƒÂ© le ${record.scanInfo.dateScan} par ${record.scanInfo.scannePar}`}>
                          <Tag
                            color="success"
                            icon={<CheckCircleOutlined />}
                            style={{ cursor: "pointer", fontWeight: 600 }}
                            onClick={() => setSelectedContratToView(record)}
                          >
                            NumÃƒÂ©risÃƒÂ© ({record.scanInfo.nombrePages}p)
                          </Tag>
                        </Tooltip>
                      );
                    }
                    return (
                      <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontWeight: 600 }}>
                        Ãƒâ‚¬ Scanner
                      </Tag>
                    );
                  },
                },
                {
                  title: "Actions",
                  key: "action",
                  render: (_, record: any) => (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => navigate(`/responsable/contrats/${record.matchedContratId || record.id}`)}
                        style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                        className="rounded-lg"
                      >
                        Situation
                      </Button>
                      {record.scanInfo?.scanne ? (
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => setSelectedContratToView(record)}
                          style={{ borderColor: "#006398", color: "#006398", fontWeight: 600 }}
                        >
                          Scan
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          icon={<ScanOutlined />}
                          onClick={() => setSelectedContratToScan(record)}
                          style={{ backgroundColor: "#0284c7", borderColor: "#0284c7", color: "#ffffff", fontWeight: 700 }}
                        >
                          Scanner
                        </Button>
                      )}
                    </Space>
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
                    Factures Officielles ÃƒÂ  Viser
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
                Factures Ã¢â€ â€™
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
                      <div className="text-[11px] text-slate-400">Ãƒâ€°mise le {formatDate(fact.dateEmission)}</div>
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

      {/* Modal Scanner Contrat Corporate */}
      {selectedContratToScan && (
        <ScannerContratModal
          open={!!selectedContratToScan}
          onClose={() => setSelectedContratToScan(null)}
          contratReference={selectedContratToScan.reference}
          entrepriseNom={selectedContratToScan.entrepriseNom}
          onScanSuccess={(scanInfo: ContratScanInfo) =>
            scanMutation.mutate({
              id: selectedContratToScan.matchedContratId || selectedContratToScan.id,
              scanInfo,
            })
          }
        />
      )}

      {/* Modal Visualiser Scan */}
      {selectedContratToView && (
        <VisualiserScanContratModal
          open={!!selectedContratToView}
          onClose={() => setSelectedContratToView(null)}
          contrat={{
            id: selectedContratToView.matchedContratId || selectedContratToView.id,
            reference: selectedContratToView.reference,
            entrepriseNom: selectedContratToView.entrepriseNom,
            iceEntreprise: "001234567890012",
            parkingNom: selectedContratToView.parkingNom || "Parking Agdal Gare",
            nombrePlaces: selectedContratToView.nombreAbonnements || 10,
            dateDebut: selectedContratToView.dateCreation || "01/01/2026",
            dateFin: "31/12/2045",
            montantMensuelHT: selectedContratToView.montantMensuel || 6500,
            montantMensuelTTC: (selectedContratToView.montantMensuel || 6500) * 1.2,
            statut: "SIGNE",
            vehicules: [],
            dateSignature: "01/01/2026",
            signePar: "Direction RRM & ReprÃƒÂ©sentant Entreprise",
            referencePhysique: "PARAPH-CORP-2026",
          }}
          scanInfo={selectedContratToView.scanInfo}
        />
      )}
    </div>
  );
}
