import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoutOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  path: string;
}

interface Props {
  title: string;
  menuItems: MenuItem[];
}

export function AppShell({ title, menuItems }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
          RRM Parking
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => navigate(item.path),
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
          <strong>{title}</strong>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Déconnexion
          </Button>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}