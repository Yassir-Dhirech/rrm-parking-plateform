import { useState } from "react";
import { Table, Card, Typography, Tag, Input, Select, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import { getLogsMock } from "../../../api/adminMock";
import type { Role } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

const { Title } = Typography;

export function AuditLogsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "ALL">("ALL");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin_logs"],
    queryFn: getLogsMock,
  });

  const filteredLogs = logs?.filter((log) => {
    const matchSearch =
      log.utilisateurEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = selectedRole === "ALL" || log.role === selectedRole;

    return matchSearch && matchRole;
  });

  const columns = [
    { title: "Horodatage", dataIndex: "timestamp", key: "timestamp", width: 170, render: (v: string) => formatDate(v) },
    { title: "Utilisateur", dataIndex: "utilisateurEmail", key: "utilisateurEmail" },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      render: (role: Role) => <Tag color="geekblue">{role}</Tag>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag color="volcano">{action}</Tag>,
    },
    { title: "Entité", dataIndex: "entite", key: "entite" },
    { title: "Réf / ID", dataIndex: "entiteId", key: "entiteId", render: (v?: string) => v || "-" },
    { title: "IP", dataIndex: "adresseIp", key: "adresseIp" },
    { title: "Détails", dataIndex: "details", key: "details" },
  ];

  return (
    <Card>
      <Title level={4}>Journal des Logs d'Audit & Sécurité</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Rechercher par email, action, détails..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
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
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}