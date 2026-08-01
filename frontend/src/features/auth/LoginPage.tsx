import { Form, Input, Button, Card, message, Divider, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../api/auth";
import { mockLogin } from "./mockAuth";
import { type Role, roleConfig } from "../../lib/roleConfig";

const roleHomeRoute: Record<string, string> = {
  AGENT: "/agent",
  SUPERVISEUR: "/superviseur",
  RESPONSABLE: "/responsable",
  COMPTABLE: "/comptable",
  RESP_REPORTING: "/reporting",
  ADMIN_SI: "/admin",
};

const isDev = import.meta.env.DEV;

export function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; motDePasse: string }) => {
    try {
      const { token, role } = await login(values.email, values.motDePasse);
      setAuth(token, role as Role);
      navigate(roleHomeRoute[role] ?? "/login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      message.error("Email ou mot de passe incorrect");
    }
  };

  const handleMockLogin = (role: Role) => {
    const { token } = mockLogin(role);
    setAuth(token, role);
    navigate(roleHomeRoute[role]);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Connexion — RRM Parking" style={{ width: 380 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="motDePasse" label="Mot de passe" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Se connecter
          </Button>
        </Form>

        {isDev && (
          <>
            <Divider>Connexion rapide (dev uniquement)</Divider>
            <Space direction="vertical" style={{ width: "100%" }}>
              {(Object.keys(roleConfig) as Role[]).map((role) => (
                <Button
                  key={role}
                  block
                  onClick={() => handleMockLogin(role)}
                >
                  Se connecter comme {roleConfig[role].title}
                </Button>
              ))}
            </Space>
          </>
        )}
      </Card>
    </div>
  );
}