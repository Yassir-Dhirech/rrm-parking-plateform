import { Layout, Menu, Button, Avatar } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../lib/roleConfig";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "./RoleLayout.css";

const { Header, Sider, Content } = Layout;

export function RoleLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userName, logout } = useAuth();

  if (!role) return null;

  const config = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const selectedKey = config.menuItems.find((item) =>
    location.pathname.startsWith(item.path) && item.path !== config.homePath
  )?.key ?? (location.pathname === config.homePath ? "dashboard" : undefined);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="sidebar-account">
            <Avatar size={40} icon={<UserOutlined />} />
            <div className="sidebar-account-info">
              <div className="sidebar-account-name">{userName ?? "Utilisateur"}</div>
              <div className="sidebar-account-role">{config.title}</div>
            </div>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={config.menuItems.map((item) => ({
              key: item.key,
              label: item.label,
              onClick: () => navigate(item.path),
            }))}
          />
        </div>

        <div className="sidebar-logout">
          <Button icon={<LogoutOutlined />} onClick={handleLogout} block danger>
            Déconnexion
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", display: "flex", alignItems: "center", padding: "0 16px" }}>
          <strong>{config.title}</strong>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}