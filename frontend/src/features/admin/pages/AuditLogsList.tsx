import { useState, useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Input,
  Select,
  Space,
  Button,
  Drawer,
  Timeline,
  Tooltip,
  Badge,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getAuditLogs } from "../../../api/adminAuditApi";
import type { Role } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";
import type { ColumnsType } from "antd/es/table";
import type { AuditLog } from "../../admin/types";

const { Title, Text } = Typography;

export function AuditLogsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "ALL">("ALL");

  // État pour le panneau latéral (Historique complet d'un utilisateur)
  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    role: string;
    userId?: string;
  } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");

  // 1. Récupération directe de tous les logs depuis MySQL
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: getAuditLogs,
  });

  // Filtrage du tableau principal
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        (log.utilisateurEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entite || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = selectedRole === "ALL" || log.role === selectedRole;

      return matchSearch && matchRole;
    });
  }, [logs, searchTerm, selectedRole]);

  // Tous les logs spécifiques à l'utilisateur sélectionné
  const userSpecificLogs = useMemo(() => {
    if (!selectedUser) return [];
    return logs.filter(
      (l) => (l.utilisateurEmail || "").toLowerCase() === selectedUser.email.toLowerCase()
    );
  }, [logs, selectedUser]);

  // Filtrage à l'intérieur du Drawer de l'utilisateur
  const filteredUserLogs = useMemo(() => {
    if (!drawerSearch.trim()) return userSpecificLogs;
    const q = drawerSearch.toLowerCase();
    return userSpecificLogs.filter(
      (l) =>
        (l.action || "").toLowerCase().includes(q) ||
        (l.details || "").toLowerCase().includes(q) ||
        (l.entite || "").toLowerCase().includes(q)
    );
  }, [userSpecificLogs, drawerSearch]);

  // Fonction d'ouverture du panneau utilisateur
  const handleOpenUserActivity = (email: string, role: string, userId?: string) => {
    setSelectedUser({ email, role, userId });
    setDrawerSearch("");
    setIsDrawerOpen(true);
  };

  // Couleurs selon le type d'action
  const getActionColor = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CONNEXION") || act.includes("LOGIN") || act.includes("AUTHENTIFICATION")) return "green";
    if (act.includes("DECONNEXION") || act.includes("LOGOUT")) return "blue";
    if (act.includes("CREATION") || act.includes("AJOUT")) return "cyan";
    if (act.includes("MODIF") || act.includes("MAJ")) return "orange";
    if (act.includes("SUPPR") || act.includes("DELETE")) return "red";
    return "volcano";
  };

  // 2. Colonnes triables avec clic sur l'utilisateur
  const columns: ColumnsType<AuditLog> = [
    {
      title: "Horodatage",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 170,
      render: (v: string) => (
        <span className="font-semibold text-slate-700">{formatDate(v)}</span>
      ),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Utilisateur (Cliquer pour voir tout)",
      dataIndex: "utilisateurEmail",
      key: "utilisateurEmail",
      sorter: (a, b) => (a.utilisateurEmail || "").localeCompare(b.utilisateurEmail || ""),
      render: (email: string, record: AuditLog) => (
        <Tooltip title="Cliquer pour afficher l'historique complet de cette personne">
          <Button
            type="link"
            onClick={() => handleOpenUserActivity(email, record.role, record.utilisateurId ? String(record.utilisateurId) : undefined)}
            className="p-0 font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1.5 h-auto text-left"
          >
            <UserOutlined />
            <span>{email || "Système Automatique"}</span>
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      width: 130,
      render: (role: Role) => <Tag color="geekblue" className="font-semibold">{role}</Tag>,
      sorter: (a, b) => (a.role || "").localeCompare(b.role || ""),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 160,
      render: (action: string) => (
        <Tag color={getActionColor(action)} className="font-bold">
          {action}
        </Tag>
      ),
      sorter: (a, b) => (a.action || "").localeCompare(b.action || ""),
    },
    {
      title: "Entité Ciblée",
      dataIndex: "entite",
      key: "entite",
      width: 120,
      render: (entite: string) => <Tag color="default">{entite || "SYSTÈME"}</Tag>,
      sorter: (a, b) => (a.entite || "").localeCompare(b.entite || ""),
    },
    {
      title: "Réf / ID",
      dataIndex: "entiteId",
      key: "entiteId",
      width: 90,
      render: (v?: string) => v || "-",
      sorter: (a, b) => (a.entiteId || "").localeCompare(b.entiteId || ""),
    },
    {
      title: "Adresse IP",
      dataIndex: "adresseIp",
      key: "adresseIp",
      width: 120,
      render: (ip?: string) => (
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <GlobalOutlined /> {ip || "127.0.0.1"}
        </span>
      ),
      sorter: (a, b) => (a.adresseIp || "").localeCompare(b.adresseIp || ""),
    },
    {
      title: "Détails de l'événement",
      dataIndex: "details",
      key: "details",
      render: (details: string) => (
        <span className="text-xs text-slate-700">{details}</span>
      ),
      sorter: (a, b) => (a.details || "").localeCompare(b.details || ""),
    },
    {
      title: "Activité",
      key: "profil",
      width: 100,
      render: (_: unknown, record: AuditLog) => (
        <Button
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleOpenUserActivity(record.utilisateurEmail, record.role, record.utilisateurId ? String(record.utilisateurId) : undefined)}
        >
          Voir tout
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 12 }}>
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <SafetyCertificateOutlined style={{ color: "#0284c7" }} /> Journal des Logs d'Audit & Sécurité
          </Title>
          <span className="text-xs text-slate-500">
            Historique en direct de la base de données MySQL ({filteredLogs.length} événements enregistrés)
          </span>
        </div>
      </div>

      {/* Barre de Filtres */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Rechercher par email, action, détails, entité..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 340, borderRadius: 8 }}
          allowClear
        />

        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ width: 180 }}
          options={[
            { value: "ALL", label: "Tous les Rôles" },
            { value: "AGENT", label: "AGENT" },
            { value: "SUPERVISEUR", label: "SUPERVISEUR" },
            { value: "RESPONSABLE", label: "RESPONSABLE" },
            { value: "COMPTABLE", label: "COMPTABLE" },
            { value: "ADMIN_SI", label: "ADMIN_SI" },
          ]}
        />

        {searchTerm && (
          <Button
            size="small"
            onClick={() => setSearchTerm("")}
            className="text-xs text-slate-500"
          >
            Réinitialiser le filtre
          </Button>
        )}
      </Space>

      {/* Table Principale Défilable */}
      <Table
        columns={columns}
        dataSource={filteredLogs}
        loading={isLoading}
        rowKey="id"
        size="small"
        scroll={{ x: "max-content", y: 600 }}
        pagination={{ pageSize: 15, showTotal: (total) => `${total} événements au total` }}
      />

      {/* -----------------------------------------------------------------
          TIROIR LATÉRAL (DRAWER) : HISTORIQUE COMPLET D'UN UTILISATEUR
          ----------------------------------------------------------------- */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <UserOutlined style={{ color: "#0284c7", fontSize: 18 }} />
            <div>
              <div className="font-black text-slate-900 text-base leading-tight">
                {selectedUser?.email}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                Rôle : <Tag color="geekblue" className="text-[10px] m-0">{selectedUser?.role}</Tag>
              </div>
            </div>
          </div>
        }
        placement="right"
        width={620}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Résumé d'activité */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Actions enregistrées
                </span>
                <span className="text-2xl font-black text-[#001E3D]">
                  {userSpecificLogs.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Dernière activité
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {userSpecificLogs[0] ? formatDate(userSpecificLogs[0].timestamp) : "Aucune"}
                </span>
              </div>
            </div>

            {/* Barre de recherche dans l'activité de cet utilisateur */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filtrer dans ses actions (ex: tarif, parking, connexion)..."
                prefix={<SearchOutlined />}
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 8 }}
              />
              <Tooltip title="Filtrer également le tableau principal sur cet utilisateur">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => {
                    setSearchTerm(selectedUser.email);
                    setIsDrawerOpen(false);
                  }}
                >
                  Filtrer table
                </Button>
              </Tooltip>
            </div>

            {/* Timeline Chronologique de son activité */}
            <div>
              <h5 className="font-extrabold text-[#001E3D] text-sm mb-4 flex items-center gap-2">
                <ClockCircleOutlined style={{ color: "#0284c7" }} />
                Chronologie complète des actions ({filteredUserLogs.length})
              </h5>

              {filteredUserLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucun événement trouvé pour ce critère.
                </div>
              ) : (
                <Timeline
                  items={filteredUserLogs.map((log) => {
                    const color = getActionColor(log.action);
                    return {
                      color,
                      children: (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs mb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Tag color={color} className="font-black text-xs m-0">
                              {log.action}
                            </Tag>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 font-medium my-1.5 leading-relaxed">
                            {log.details || "Action enregistrée sur le système"}
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                            {log.entite && (
                              <span>
                                Entité : <strong className="text-slate-600">{log.entite}</strong>
                                {log.entiteId ? ` (#${log.entiteId})` : ""}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <GlobalOutlined /> {log.adresseIp || "127.0.0.1"}
                            </span>
                          </div>
                        </div>
                      ),
                    };
                  })}
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
}
