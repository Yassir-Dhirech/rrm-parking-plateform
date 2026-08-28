import { useState } from "react";
import { Table, Card, Typography, Tabs, Input, Tag, Row, Col, Statistic } from "antd";
import { SearchOutlined, IdcardOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCartesMock } from "../../../api/cartesMock";
import type { CarteListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Title, Text } = Typography;

export function CartesList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchText, setSearchText] = useState<string>("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["cartes"],
    queryFn: getCartesMock,
  });

  const countPending = data.filter((c) => c.statut === "A_ACTIVER").length;
  const countActive = data.filter((c) => c.statut === "ACTIVE").length;

  const filteredData = data.filter((item) => {
    if (activeTab === "A_ACTIVER" && item.statut !== "A_ACTIVER") return false;
    if (activeTab === "ACTIVE" && item.statut !== "ACTIVE") return false;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchNum = item.numeroCarte.toLowerCase().includes(q);
      const matchClient = item.clientNom.toLowerCase().includes(q);
      const matchRef = item.abonnementReference.toLowerCase().includes(q);
      return matchNum || matchClient || matchRef;
    }

    return true;
  });

  const columns = [
    {
      title: "N° Carte RFID",
      dataIndex: "numeroCarte",
      key: "numeroCarte",
      sorter: (a: CarteListItem, b: CarteListItem) => a.numeroCarte.localeCompare(b.numeroCarte),
      render: (num: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{num}</Tag>,
    },
    {
      title: "Titulaire Client",
      dataIndex: "clientNom",
      key: "clientNom",
      sorter: (a: CarteListItem, b: CarteListItem) => a.clientNom.localeCompare(b.clientNom),
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Référence Abonnement",
      dataIndex: "abonnementReference",
      key: "abonnementReference",
      sorter: (a: CarteListItem, b: CarteListItem) => a.abonnementReference.localeCompare(b.abonnementReference),
    },
    {
      title: "Statut Système Barrières",
      dataIndex: "statut",
      key: "statut",
      filters: [
        { text: "À préparer", value: "A_PREPARER" },
        { text: "À activer", value: "A_ACTIVER" },
        { text: "Active", value: "ACTIVE" },
        { text: "Désactivée", value: "DESACTIVEE" },
      ],
      onFilter: (value: any, record: CarteListItem) => record.statut === value,
      render: (statut: CarteListItem["statut"]) => {
        if (statut === "A_ACTIVER" || statut === "A_PREPARER") {
          return <Tag color="gold" style={{ fontWeight: 600 }}>En attente d'activation (Non Traitée)</Tag>;
        }
        return <StatusBadge statut={statut} />;
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Counters Summary */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderRadius: 8, borderColor: "#e2e8f0" }}>
            <Statistic
              title="Cartes en Attente d'Activation sur Barrières"
              value={countPending}
              prefix={<ClockCircleOutlined style={{ color: "#d97706" }} />}
              valueStyle={{ color: "#d97706" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderRadius: 8, borderColor: "#e2e8f0" }}>
            <Statistic
              title="Cartes RFID Active sur Barrières"
              value={countActive}
              prefix={<CheckCircleOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 10, borderColor: "#cbd5e1" }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <IdcardOutlined /> Gestion des Cartes d'Accès RFID (Barrières d'Accès)
          </Title>
          <Text type="secondary">
            Consultez les cartes d'accès, lancez l'impression RFID et synchronisez avec le système externe des barrières d'accès.
          </Text>
        </div>

        <Input
          placeholder="Rechercher par n° de carte, nom client ou abonnement..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 450, marginBottom: 16 }}
          allowClear
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "ALL", label: `Toutes les Cartes (${data.length})` },
            { key: "A_ACTIVER", label: `En Attente d'Activation (${countPending})` },
            { key: "ACTIVE", label: `Cartes Activées (${countActive})` },
          ]}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => navigate(`${basePath}/cartes/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
}