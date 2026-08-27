import { useState } from "react";
import { Table, Input, Tag } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getDemandesMock } from "../../../api/demandesMock";
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
  const [searchText, setSearchText] = useState<string>("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  // Filter demandes by tab and search text
  const filteredData = data.filter((item) => {
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
      return matchRef || matchClient || matchParking || matchAgent || matchImmat;
    }

    return true;
  });

  const countSoumises = data.filter((d) => d.statut === "SOUMISE").length;
  const countPaiementEnregistre = data.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const countValidees = data.filter((d) => d.statut === "VALIDEE").length;

  const columns = [
    {
      title: "CANDIDAT & RÉFÉRENCE",
      key: "applicantInfo",
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
              {data.length}
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
          {/* Status Tabs & Contextual Search */}
          <div className="p-5 border-b border-slate-200/80 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white/50 backdrop-blur-md">
            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-4 py-2 rounded-full font-extrabold text-xs transition-all cursor-pointer border-none ${
                  activeTab === "ALL"
                    ? "bg-secondary text-white shadow-md"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                Toutes ({data.length})
              </button>
              <button
                onClick={() => setActiveTab("SOUMISE")}
                className={`px-4 py-2 rounded-full font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 border-none ${
                  activeTab === "SOUMISE"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                <span>EN_ATTENTE</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {countSoumises}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("PAIEMENT_ENREGISTRE")}
                className={`px-4 py-2 rounded-full font-extrabold text-xs transition-all cursor-pointer border-none ${
                  activeTab === "PAIEMENT_ENREGISTRE"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                DOCS_VALIDES ({countPaiementEnregistre})
              </button>
              <button
                onClick={() => setActiveTab("VALIDEE")}
                className={`px-4 py-2 rounded-full font-extrabold text-xs transition-all cursor-pointer border-none ${
                  activeTab === "VALIDEE"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                PAYEE / VALIDEE ({countValidees})
              </button>
              <button
                onClick={() => setActiveTab("REJETEE")}
                className={`px-4 py-2 rounded-full font-extrabold text-xs transition-all cursor-pointer border-none ${
                  activeTab === "REJETEE"
                    ? "bg-rose-600 text-white shadow-md"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                REJETEE
              </button>
            </div>

            {/* Contextual Search */}
            <div className="relative w-full lg:w-80">
              <Input
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Filtrer par nom, plaque, réf..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-xl py-2 px-3 border-slate-200 bg-white/90 text-xs font-semibold shadow-2xs"
                allowClear
              />
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