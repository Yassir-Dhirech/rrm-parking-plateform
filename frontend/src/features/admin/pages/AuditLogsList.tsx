import { useState } from "react";
import { Table, Card, Typography, Tag, Input, Select, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { SearchOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { getAuditLogs } from "../../../api/adminAuditApi";
import type { Role } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";
import type { ColumnsType } from "antd/es/table";
import type { AuditLog } from "../../admin/types";

const { Title } = Typography;

export function AuditLogsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "ALL">("ALL");

  // 1. Récupération directe depuis MySQL
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: getAuditLogs,
  });

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      (log.utilisateurEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entite || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = selectedRole === "ALL" || log.role === selectedRole;

    return matchSearch && matchRole;
  });

  // 2. Colonnes triables (avec la propriété sorter sur chaque colonne)
  const columns: ColumnsType<AuditLog> = [
    {
      title: "Horodatage",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 170,
      render: (v: string) => formatDate(v),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Utilisateur",
      dataIndex: "utilisateurEmail",
      key: "utilisateurEmail",
      sorter: (a, b) => (a.utilisateurEmail || "").localeCompare(b.utilisateurEmail || ""),
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      render: (role: Role) => <Tag color="geekblue">{role}</Tag>,
      sorter: (a, b) => (a.role || "").localeCompare(b.role || ""),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag color="volcano">{action}</Tag>,
      sorter: (a, b) => (a.action || "").localeCompare(b.action || ""),
    },
    {
      title: "Entité",
      dataIndex: "entite",
      key: "entite",
      sorter: (a, b) => (a.entite || "").localeCompare(b.entite || ""),
    },
    {
      title: "Réf / ID",
      dataIndex: "entiteId",
      key: "entiteId",
      render: (v?: string) => v || "-",
      sorter: (a, b) => (a.entiteId || "").localeCompare(b.entiteId || ""),
    },
    {
      title: "IP",
      dataIndex: "adresseIp",
      key: "adresseIp",
      sorter: (a, b) => (a.adresseIp || "").localeCompare(b.adresseIp || ""),
    },
    {
      title: "Détails de l'événement",
      dataIndex: "details",
      key: "details",
      sorter: (a, b) => (a.details || "").localeCompare(b.details || ""),
    },
  ];

  return (
    <Card style={{ borderRadius: 12 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <SafetyCertificateOutlined /> Journal des Logs d'Audit & Sécurité
          </Title>
          <span className="text-xs text-slate-500">
            Historique en direct de la base de données MySQL ({filteredLogs.length} événements enregistrés)
          </span>
        </div>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Rechercher par email, action, détails, entité..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 320, borderRadius: 8 }}
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
      </Space>

      <Table
        columns={columns}
        dataSource={filteredLogs}
        loading={isLoading}
        rowKey="id"
        size="small"
        scroll={{ x: "max-content", y: 600 }}
        pagination={{ pageSize: 15, showTotal: (total) => `${total} logs au total` }}
      />
    </Card>
  );
}
