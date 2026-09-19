import { useState } from "react";
import { Card, List, Tag, Button, Typography, Space, Segmented, Badge, Empty, message, Input, Row, Col, Tooltip } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  SearchOutlined,
  DeleteOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getNotificationsForRole,
  markNotificationAsRead,
  markAllNotificationsAsReadForRole,
  deleteNotificationMock,
  clearAllNotificationsForRoleMock,
  type AppNotification,
} from "../api/notificationsMock";

const { Title, Text, Paragraph } = Typography;

export function NotificationsPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<"ALL" | "UNREAD" | "URGENT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchText, setSearchText] = useState<string>("");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => (role ? getNotificationsForRole(role) : Promise.resolve([])),
    enabled: !!role,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => (role ? markAllNotificationsAsReadForRole(role) : Promise.resolve()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
      message.success("Toutes les notifications ont été marquées comme lues.");
    },
  });

  const deleteNotifMutation = useMutation({
    mutationFn: deleteNotificationMock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
      message.info("Notification supprimée.");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => (role ? clearAllNotificationsForRoleMock(role) : Promise.resolve()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
      message.success("Toutes les notifications de votre espace ont été effacées.");
    },
  });

  if (!role) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterStatus === "UNREAD" && n.read) return false;
    if (filterStatus === "URGENT" && (n.type !== "danger" && n.type !== "warning")) return false;
    if (categoryFilter !== "ALL" && n.category !== categoryFilter) return false;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }

    return true;
  });

  const getTypeIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "danger":
        return <ExclamationCircleOutlined style={{ color: "#ef4444", fontSize: 20 }} />;
      case "warning":
        return <WarningOutlined style={{ color: "#f59e0b", fontSize: 20 }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} />;
      case "info":
      default:
        return <InfoCircleOutlined style={{ color: "#3b82f6", fontSize: 20 }} />;
    }
  };

  const getCategoryTag = (cat?: AppNotification["category"]) => {
    switch (cat) {
      case "PAIEMENT":
        return <Tag color="green">Paiement</Tag>;
      case "DOSSIER":
        return <Tag color="purple">Dossier</Tag>;
      case "RECETTES":
        return <Tag color="cyan">Recettes</Tag>;
      case "SYSTEME":
        return <Tag color="blue">Système</Tag>;
      default:
        return null;
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* En-tête de la page */}
      <Card
        style={{
          background: "linear-gradient(135deg, #003566 0%, #001E3D 100%)",
          borderRadius: 14,
          color: "#fff",
          border: "none",
        }}
        styles={{ body: { padding: "24px 28px" } }}
      >
        <Row justify="space-between" align="middle" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 }}>
              <BellOutlined /> Centre de Notifications
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ backgroundColor: "#ef4444" }} />
              )}
            </Title>
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.85)", margin: "4px 0 0 0", fontSize: 14 }}>
              Alertes métier et notifications en temps réel prioritaires pour votre espace.
            </Paragraph>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled={unreadCount === 0}
              onClick={() => markAllReadMutation.mutate()}
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            >
              Tout marquer comme lu
            </Button>
            <Button
              danger
              icon={<ClearOutlined />}
              disabled={notifications.length === 0}
              onClick={() => clearAllMutation.mutate()}
            >
              Effacer tout
            </Button>
          </Space>
        </Row>
      </Card>

      {/* Barre de Recherche & Filtres Avancés */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Rechercher une notification..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={14} style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <Segmented
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as "ALL" | "UNREAD" | "URGENT")}
              options={[
                { label: `Toutes (${notifications.length})`, value: "ALL" },
                { label: `Non lues (${unreadCount})`, value: "UNREAD" },
                { label: "Urgentes", value: "URGENT" },
              ]}
            />

            <Segmented
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val as string)}
              options={[
                { label: "Toutes Catégories", value: "ALL" },
                { label: "Paiements", value: "PAIEMENT" },
                { label: "Dossiers", value: "DOSSIER" },
                { label: "Recettes", value: "RECETTES" },
                { label: "Système", value: "SYSTEME" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Liste des Notifications */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
        <List
          loading={isLoading}
          dataSource={filteredNotifications}
          locale={{ emptyText: <Empty description="Aucune notification disponible." /> }}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "16px 20px",
                background: item.read ? "transparent" : "#f0f9ff",
                borderLeft: item.read ? "3px solid transparent" : "3px solid #0284c7",
                borderRadius: 8,
                marginBottom: 8,
                transition: "background 0.2s",
              }}
              actions={[
                !item.read && (
                  <Button
                    size="small"
                    type="text"
                    onClick={() => markReadMutation.mutate(item.id)}
                  >
                    Marquer lu
                  </Button>
                ),
                item.link && (
                  <Button
                    size="small"
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                      if (!item.read) markReadMutation.mutate(item.id);
                      navigate(item.link!);
                    }}
                  >
                    Consulter
                  </Button>
                ),
                <Tooltip title="Supprimer cette notification">
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteNotifMutation.mutate(item.id)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={<div style={{ paddingTop: 4 }}>{getTypeIcon(item.type)}</div>}
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                      {item.title}
                    </Text>
                    {!item.read && <Tag color="red">Nouveau</Tag>}
                    {getCategoryTag(item.category)}
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: "auto" }}>
                      {item.timestamp}
                    </Text>
                  </div>
                }
                description={
                  <Paragraph style={{ margin: "4px 0 0 0", color: "#475569", fontSize: 14 }}>
                    {item.message}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
