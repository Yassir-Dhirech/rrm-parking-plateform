import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../api/auth";

const roleHomeRoute: Record<string, string> = {
  AGENT: "/agent",
  SUPERVISEUR: "/superviseur",
  RESPONSABLE: "/responsable",
  COMPTABLE: "/comptable",
  RESP_REPORTING: "/reporting",
  ADMIN_SI: "/admin",
};

export function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; motDePasse: string }) => {
    try {
      const { token, role } = await login(values.email, values.motDePasse);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAuth(token, role as any);
      navigate(roleHomeRoute[role] ?? "/login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      message.error("Email ou mot de passe incorrect");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Connexion — RRM Parking" style={{ width: 350 }}>
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
      </Card>
    </div>
  );
}