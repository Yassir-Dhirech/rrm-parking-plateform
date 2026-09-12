import { useState } from "react";
import { Popover, Badge, Button, List, Typography, Tag, Space, Divider, Empty } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleConfig } from "../../lib/roleConfig";
import {
  getNotificationsForRole,
  markNotificationAsRead,
  markAllNotificationsAsReadForRole,
  type AppNotification,
} from "../../api/notificationsMock";

const { Text, Paragraph } = Typography;

export function NotificationPopover() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (!role) return null;

  const currentRoleConfig = roleConfig[role];
  const notificationsPath = `${currentRoleConfig.homePath}/notifications`;

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => getNotificationsForRole(role),
    enabled: !!role,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsReadForRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", role] });
    },
  });

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  const getTypeIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "danger":
        return <ExclamationCircleOutlined style={{ color: "#ef4444", fontSize: 16 }} />;
      case "warning":
        return <WarningOutlined style={{ color: "#f59e0b", fontSize: 16 }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#10b981", fontSize: 16 }} />;
      case "info":
      default:
        return <InfoCircleOutlined style={{ color: "#3b82f6", fontSize: 16 }} />;
    }
  };

  const handleItemClick = (item: AppNotification) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }
    setPopoverOpen(false);
    if (item.link) {
      navigate(item.link);
    } else {
      navigate(notificationsPath);
    }
  };

  const popoverContent = (
    <div style={{ width: 360, maxWidth: "100vw" }}>
      {/* Popover Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
        <Space>
          <Text strong style={{ fontSize: 15, color: "#003566" }}>
            Notifications
          </Text>
          {unreadCount > 0 && <Tag color="red">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</Tag>}
        </Space>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAllReadMutation.mutate()}
            style={{ fontSize: 12, padding: 0 }}
          >
            Tout marquer lu
          </Button>
        )}
      </div>

      <Divider style={{ margin: "4px 0 12px 0" }} />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Empty description="Aucune notification" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: "20px 0" }} />
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
          <List
            itemLayout="horizontal"
            dataSource={notifications.slice(0, 5)}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleItemClick(item)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 6,
                  cursor: "pointer",
                  backgroundColor: item.read ? "#ffffff" : "#f0f9ff",
                  borderLeft: item.read ? "3px solid transparent" : "3px solid #0284c7",
                  transition: "all 0.2s ease",
                }}
                className="notification-popover-item"
              >
                <List.Item.Meta
                  avatar={<div style={{ paddingTop: 2 }}>{getTypeIcon(item.type)}</div>}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 13, color: item.read ? "#334155" : "#0f172a" }}>
                        {item.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.timestamp}
                      </Text>
                    </div>
                  }
                  description={
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}
                    >
                      {item.message}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}

      <Divider style={{ margin: "8px 0 8px 0" }} />

      {/* Popover Footer */}
      <div style={{ textAlign: "center" }}>
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={() => {
            setPopoverOpen(false);
            navigate(notificationsPath);
          }}
          style={{ fontSize: 13, fontWeight: 600, color: "#003566" }}
        >
          Voir toutes les notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="bottomRight"
      overlayClassName="header-notification-popover"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          shape="circle"
          icon={<BellOutlined style={{ fontSize: 18, color: "#003566" }} />}
          title="Centre de Notifications"
          style={{
            borderColor: "#cbd5e1",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Badge>
    </Popover>
  );
}
