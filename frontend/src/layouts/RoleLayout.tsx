import React, { useState } from "react";
import { Layout, Menu, theme, Avatar, Tag, Dropdown, type MenuProps, message } from "antd";
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
  DownOutlined,
} from "@ant-design/icons";
import "./RoleLayout.css";
import { type GlobalFilters, GlobalFilterBar } from "../components/ui/GlobalFilterBar";

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



export function RoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userName, logout } = useAuth();
  const [filters, setFilters] = useState<GlobalFilters>({});
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

  // Dynamic User Dropdown Menu Items
  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-details",
      disabled: true,
      label: (
        <div style={{ padding: "4px 6px", cursor: "default" }}>
          <div style={{ fontWeight: 600, color: "var(--color-primary-dark, #001e3d)", fontSize: 14 }}>
            {userName ?? "Utilisateur"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{config.title}</div>
          <Tag color="blue" style={{ marginTop: 6, fontWeight: 600 }}>
            Rôle: {role}
          </Tag>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mon Profil",
      onClick: () => {
        message.info(`Session active : ${userName ?? "Utilisateur"} (${config.title})`);
      },
    },
   
    
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Déconnexion",
      onClick: handleLogout,
    },
  ];



  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header: White theme with Logo on Left, Clickable User Dropdown Menu on Right */}
      <Header className="app-header">
        <div className="header-logo-container" onClick={() => navigate(config.homePath)}>
          <img src="/pictures/logo-rrm.png" alt="Rabat Région Mobilité" />
        </div>
       {/* <div><GlobalFilterBar filters={filters} onChange={setFilters} /></div> */}
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
          <div className="header-user-section">
            <div className="header-user-info">
              <Avatar size={34} icon={<UserOutlined />} className="header-user-avatar" />
              <div className="header-user-text">
                <span className="header-user-name">{userName ?? "Utilisateur"}</span>
                <span className="header-user-role">{config.title}</span>
              </div>
              <DownOutlined style={{ fontSize: 11, color: "var(--color-primary, #003566)", marginLeft: 2 }} />
            </div>
          </div>
        </Dropdown>
      </Header>

      {/* Body: Blue Sider Left + Content Right */}
      <Layout>
        <Sider width={230} className="app-sider">
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "12px 8px" }}>
            <Menu
              theme="dark"
              mode="inline"
              className="app-sider-menu"
              selectedKeys={selectedKey ? [selectedKey] : []}
              style={{ borderInlineEnd: 0 }}
              items={config.menuItems.map((item) => ({
                key: item.key,
                icon: menuIconMap[item.key] || <DashboardOutlined />,
                label: item.label,
                onClick: () => navigate(item.path),
              }))}
            />
          </div>
        </Sider>

        <Layout style={{ padding: "10px 24px 24px", background: "var(--color-bg, #f4f6fa)" }}>
          <Content
            style={{
              padding: 18,
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