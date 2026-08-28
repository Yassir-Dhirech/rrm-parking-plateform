import { useState } from "react";
import { Table, Input, Tag, Select, Button } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getDemandesMock } from "../../../api/demandesMock";
import { getParkingsMock } from "../../../api/adminMock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";
import { SlaAuditDashboard } from "../components/SlaAuditDashboard";
import type { DemandeListItem } from "../types";

export function DemandesList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const [mainView, setMainView] = useState<"LIST" | "SLA_AUDIT">("LIST");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedParking, setSelectedParking] = useState<string>("ALL");
  const [searchText, setSearchText] = useState<string>("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  const { data: parkingsList = [] } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  // Base dataset scoped by role (AGENT strictly handles Particuliers only — Corporate requests go directly to Responsable)
  const roleBaseData = data.filter((item) => {
    if (role === "AGENT" && (item as any).typeClient === "ENTREPRISE") return false;
    return true;
  });

  // Parking-scoped dataset for top KPI summary cards (recalculates when parking filter changes)
  const parkingScopedData = roleBaseData.filter((item) => {
    if (selectedParking !== "ALL" && !item.parkingNom.toLowerCase().includes(selectedParking.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Filter demandes for table view by tab, parking, and search text
  const filteredData = parkingScopedData.filter((item) => {
    if (activeTab === "SOUMISE" && item.statut !== "SOUMISE") return false;
    if (activeTab === "PAIEMENT_ENREGISTRE" && item.statut !== "PAIEMENT_ENREGISTRE") return false;
    if (activeTab === "EN_COURS" && item.statut !== "EN_COURS") return false;
    if (activeTab === "VALIDEE" && item.statut !== "VALIDEE") return false;
    if (activeTab === "REJETEE" && item.statut !== "REJETEE") return false;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchRef = item.reference.toLowerCase().includes(q);
      const matchClient = item.clientNom.toLowerCase().includes(q);
      const matchParking = item.parkingNom.toLowerCase().includes(q);
      const matchAgent = item.traiteParNom?.toLowerCase().includes(q);
      const matchImmat = (item as any).immatriculation?.toLowerCase().includes(q);
      const matchCin = (item as any).cin?.toLowerCase().includes(q);
      const matchIce = (item as any).ice?.toLowerCase().includes(q);
      return matchRef || matchClient || matchParking || matchAgent || matchImmat || matchCin || matchIce;
    }

    return true;
  });

  const totalSouscriptions = parkingScopedData.length;
  const countSoumises = parkingScopedData.filter((d) => d.statut === "SOUMISE").length;
  const countPaiementEnregistre = parkingScopedData.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const countValidees = parkingScopedData.filter((d) => d.statut === "VALIDEE").length;

  const columns = [
    {
      title: "CANDIDAT & RÉFÉRENCE",
      key: "applicantInfo",
      sorter: (a: DemandeListItem, b: DemandeListItem) => a.clientNom.localeCompare(b.clientNom),
      render: (_: unknown, record: DemandeListItem) => {
        const initials = record.clientNom
          ? record.clientNom.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
          : "US";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div>
              <p className="font-extrabold text-xs text-slate-900 m-0">{record.clientNom}</p>
              <span className="font-semibold text-[11px] text-slate-500 block">
                ID: {record.reference}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "IMMATRICULATION",
      dataIndex: "immatriculation",
      key: "immatriculation",
      sorter: (a: DemandeListItem, b: DemandeListItem) => ((a as any).immatriculation || "").localeCompare((b as any).immatriculation || ""),
      render: (immat?: string) => (
        <div className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100 font-mono text-[12px] font-bold text-slate-800 tracking-wider shadow-2xs">
          {immat || "12345 | A | 1"}
        </div>
      ),
    },
    {
      title: "STATUT TRAITEMENT",
      dataIndex: "statut",
      key: "statut",
      filters: [
        { text: "En Attente Paiement", value: "SOUMISE" },
        { text: "Paiement Enregistré", value: "PAIEMENT_ENREGISTRE" },
        { text: "Validée (Actif)", value: "VALIDEE" },
        { text: "Rejetée", value: "REJETEE" },
      ],
      onFilter: (value: any, record: DemandeListItem) => record.statut === value,
      render: (statut: string) => {
        if (statut === "SOUMISE") {
          return (
            <Tag color="gold" className="font-extrabold px-2.5 py-0.5 rounded-full border-none shadow-2xs">
              En Attente Paiement
            </Tag>
          );
        }
        if (statut === "PAIEMENT_ENREGISTRE") {
          return (
            <Tag color="cyan" className="font-extrabold px-2.5 py-0.5 rounded-full border-none shadow-2xs">
              Paiement Enregistré
            </Tag>
          );
        }
        if (statut === "VALIDEE") {
          return (
            <Tag color="green" className="font-extrabold px-2.5 py-0.5 rounded-full border-none shadow-2xs">
              Validée (Actif)
            </Tag>
          );
        }
        if (statut === "REJETEE") {
          return (
            <Tag color="red" className="font-extrabold px-2.5 py-0.5 rounded-full border-none shadow-2xs">
              Rejetée
            </Tag>
          );
        }
        return <Tag color="blue" className="font-bold">{statut}</Tag>;
      },
    },
    {
      title: "PARKING SOUHAITÉ",
      dataIndex: "parkingNom",
      key: "parkingNom",
      filters: parkingsList.map((p) => ({ text: p.nom, value: p.nom })),
      onFilter: (value: any, record: DemandeListItem) => record.parkingNom.includes(value as string),
      filterSearch: true,
      sorter: (a: DemandeListItem, b: DemandeListItem) => a.parkingNom.localeCompare(b.parkingNom),
      render: (nom: string) => (
        <div>
          <p className="font-bold text-xs text-slate-800 m-0">{nom}</p>
          <span className="text-[11px] text-slate-400 font-medium">Zone Rabat</span>
        </div>
      ),
    },
    {
      title: "DATE SOUMISSION",
      dataIndex: "dateCreation",
      key: "dateCreation",
      sorter: (a: DemandeListItem, b: DemandeListItem) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime(),
      render: (d: string) => (
        <span className="font-bold text-xs text-slate-700">{formatDate(d)}</span>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: DemandeListItem) => (
        <button
          onClick={() => navigate(`${basePath}/demandes/${record.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 hover:text-secondary hover:border-secondary hover:shadow-xs transition-all font-bold text-xs cursor-pointer"
        >
          <FileTextOutlined className="text-secondary" />
          <span>Examiner</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 m-0 leading-tight flex items-center gap-2">
            <FileTextOutlined className="text-secondary" /> Traitement des Demandes
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 mb-0">
            Revue, validation et traitement des souscriptions d'abonnements en ligne.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === "RESPONSABLE" && (
            <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setMainView("LIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mainView === "LIST" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Liste des Demandes
              </button>
              <button
                onClick={() => setMainView("SLA_AUDIT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mainView === "SLA_AUDIT" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Audit SLA & Performance
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/80 bg-white/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl font-black shrink-0">
            <FileTextOutlined />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Total Souscriptions
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none">
              {totalSouscriptions}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/80 bg-white/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl font-black shrink-0">
            <ClockCircleOutlined />
          </div>
          <div>
            <span className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wider block">
              En Attente Paiement
            </span>
            <span className="text-2xl font-black text-amber-600 leading-none">
              {countSoumises}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/80 bg-white/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl font-black shrink-0">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <span className="text-[11px] text-blue-700 font-extrabold uppercase tracking-wider block">
              À Valider (Paiement OK)
            </span>
            <span className="text-2xl font-black text-blue-600 leading-none">
              {countPaiementEnregistre}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/80 bg-white/80 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
            <CheckCircleOutlined />
          </div>
          <div>
            <span className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wider block">
              Abonnements Validés
            </span>
            <span className="text-2xl font-black text-emerald-600 leading-none">
              {countValidees}
            </span>
          </div>
        </div>
      </div>

      {mainView === "SLA_AUDIT" && role === "RESPONSABLE" ? (
        <SlaAuditDashboard />
      ) : (
        /* Master Data View (Glass Card) */
        <div className="glass-panel rounded-2xl border border-white/80 shadow-xl flex flex-col flex-1 overflow-hidden relative bg-white/70">
          {/* Toolbar: 2 Dropdowns (Parking & Statut) + 1 Instant Search Bar */}
          <div className="p-5 border-b border-slate-200/80 bg-white/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* 1. Dropdown Parking / Gare */}
                <Select
                  value={selectedParking}
                  onChange={setSelectedParking}
                  suffixIcon={<EnvironmentOutlined className="text-secondary" />}
                  className="w-full md:w-60 font-bold"
                  size="middle"
                  options={[
                    { value: "ALL", label: "Tous les Parkings" },
                    ...parkingsList.map((p) => ({ value: p.nom, label: p.nom })),
                  ]}
                />

                {/* 2. Dropdown Statut Traitement */}
                <Select
                  value={activeTab}
                  onChange={setActiveTab}
                  suffixIcon={<FilterOutlined className="text-amber-600" />}
                  className="w-full md:w-60 font-bold"
                  size="middle"
                  options={[
                    { value: "ALL", label: `Tous les Statuts (${parkingScopedData.length})` },
                    { value: "SOUMISE", label: `En Attente Paiement (${countSoumises})` },
                    { value: "PAIEMENT_ENREGISTRE", label: `Paiements Enregistrés (${countPaiementEnregistre})` },
                    { value: "VALIDEE", label: `Validées (${countValidees})` },
                    { value: "REJETEE", label: "Rejetées" },
                  ]}
                />

                {/* Reset Filters Button */}
                {(selectedParking !== "ALL" || searchText || activeTab !== "ALL") && (
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setActiveTab("ALL");
                      setSelectedParking("ALL");
                      setSearchText("");
                    }}
                    className="font-bold rounded-xl text-xs"
                    size="middle"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* 3. Instant Search Bar */}
              <div className="relative w-full md:w-72">
                <Input
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Client, Immatriculation, Réf, CIN..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-xl py-1.5 px-3 border-slate-200 bg-white/90 text-xs font-semibold shadow-2xs"
                  allowClear
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-1 relative z-10 p-2">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredData}
              loading={isLoading}
              pagination={{ pageSize: 8, className: "px-4" }}
              scroll={{ x: "max-content" }}
              onRow={(record) => ({
                onClick: () => navigate(`${basePath}/demandes/${record.id}`),
                className: "cursor-pointer hover:bg-slate-50/80 transition-colors",
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}