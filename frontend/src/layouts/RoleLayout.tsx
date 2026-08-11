import React from "react";
import { Breadcrumb, Layout, Menu, theme, Button, Avatar, Tag } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";
import {
  DashboardOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  IdcardOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./RoleLayout.css";

const { Header, Content, Sider } = Layout;

const menuIconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  demandes: <FileTextOutlined />,
  abonnements: <SolutionOutlined />,
  paiements: <CreditCardOutlined />,
  factures: <FileDoneOutlined />,
  cartes: <IdcardOutlined />,
  contrats: <FileProtectOutlined />,
  recettes: <FileDoneOutlined />,
  utilisateurs: <TeamOutlined />,
  parkings: <EnvironmentOutlined />,
  tarifs: <TagsOutlined />,
  logs: <AuditOutlined />,
};

const routeTitleMap: Record<string, string> = {
  demandes: "Demandes",
  abonnements: "Abonnements",
  paiements: "Paiements",
  factures: "Factures",
  cartes: "Cartes d'accès",
  contrats: "Contrats",
  recettes: "Recettes",
  utilisateurs: "Utilisateurs",
  parkings: "Parkings",
  tarifs: "Plans tarifaires",
  logs: "Logs d'audit",
};

export function RoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userName, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!role) return null;

  const config = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const selectedKey = config.menuItems.find((item) =>
    location.pathname.startsWith(item.path) && item.path !== config.homePath
  )?.key ?? (location.pathname === config.homePath ? "dashboard" : undefined);

  // Generate dynamic breadcrumb trail
  const pathSnippets = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = [
    {
      title: (
        <span onClick={() => navigate(config.homePath)} style={{ cursor: "pointer", fontWeight: 500 }}>
          {config.title}
        </span>
      ),
    },
    ...pathSnippets.slice(1).map((snippet, idx) => {
      const isLast = idx === pathSnippets.length - 2;
      const displayTitle = routeTitleMap[snippet] || snippet;
      return {
        title: isLast ? <span>{displayTitle}</span> : <span style={{ cursor: "pointer" }}>{displayTitle}</span>,
      };
    }),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header: Logo on Left, User Profile & Actions on Right */}
      <Header className="app-header">
        <div className="header-logo-container" onClick={() => navigate(config.homePath)}>
          <img src="/pictures/logo-rrm.png" alt="Rabat Région Mobilité" />
        </div>

        <div className="header-user-section">
          <div className="header-user-info">
            <Avatar size={36} icon={<UserOutlined />} className="header-user-avatar" />
            <div className="header-user-text">
              <span className="header-user-name">{userName ?? "Utilisateur"}</span>
              <span className="header-user-role">{config.title}</span>
            </div>
          </div>

          <Tag className="header-role-tag">{role}</Tag>

          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
            type="primary"
            size="small"
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Déconnexion
          </Button>
        </div>
      </Header>

      {/* Body: Sider Left + Content Right */}
      <Layout>
        <Sider width={230} style={{ background: colorBgContainer }} className="app-sider">
          <Menu
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            style={{ height: "100%", borderInlineEnd: 0, padding: "12px 8px" }}
            items={config.menuItems.map((item) => ({
              key: item.key,
              icon: menuIconMap[item.key] || <DashboardOutlined />,
              label: item.label,
              onClick: () => navigate(item.path),
            }))}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px", background: "var(--color-bg, #f4f6fa)" }}>
          <Breadcrumb items={breadcrumbItems} style={{ margin: "16px 0" }} />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}