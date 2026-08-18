import { Form, Input, Button, Card, message, Divider, Typography, Checkbox } from "antd";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../api/auth";
import { mockLogin } from "./mockAuth";
import { type Role, roleConfig } from "../../lib/roleConfig";
import { OtpVerificationModal } from "../../components/ui/OtpVerificationModal";

const { Title, Text } = Typography;

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

  const [require2fa, setRequire2fa] = useState<boolean>(false);
  const [isOtpOpen, setIsOtpOpen] = useState<boolean>(false);
  const [pendingLogin, setPendingLogin] = useState<{ token: string; role: Role; name?: string } | null>(null);

  const executeLogin = (token: string, role: Role, name?: string) => {
    setAuth(token, role, name ?? roleConfig[role].title);
    navigate(roleHomeRoute[role] ?? "/login");
  };

  const onFinish = async (values: { email: string; motDePasse: string }) => {
    try {
      const { token, role } = await login(values.email, values.motDePasse);
      if (require2fa) {
        setPendingLogin({ token, role: role as Role });
        setIsOtpOpen(true);
      } else {
        executeLogin(token, role as Role);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      message.error("Email ou mot de passe incorrect");
    }
  };

  const handleMockLogin = (role: Role) => {
    const { token } = mockLogin(role);
    if (require2fa) {
      setPendingLogin({ token, role, name: roleConfig[role].title });
      setIsOtpOpen(true);
    } else {
      executeLogin(token, role, roleConfig[role].title);
    }
  };

  return (
    <div
      style={{
        minHeight: "92vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #001E3D 0%, #003566 60%, #004D80 100%)",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
          border: "none",
          background: "#ffffff"
        }}
        styles={{ body: { padding: "36px 28px" } }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <img
            src="/pictures/logo-rrm.png"
            alt="Rabat Région Mobilité"
            style={{ maxHeight: 60, marginBottom: 16, filter: "drop-shadow(0 2px 4px rgba(0,0,0))" }}
          />
          <Title level={4} style={{ margin: 0, color: "var(--color-primary)", fontWeight: 700 }}>
            Plateforme Parking RRM
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Connectez-vous à votre espace de gestion
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Adresse Email" rules={[{ required: true, message: "Saisissez votre email" }]}>
            <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="exemple@rrm.ma" />
          </Form.Item>
          <Form.Item name="motDePasse" label="Mot de passe" rules={[{ required: true, message: "Saisissez votre mot de passe" }]}>
            <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Checkbox checked={require2fa} onChange={(e) => setRequire2fa(e.target.checked)}>
              Exiger la vérification 2FA par Code OTP (SMS / Email)
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 0 }}>
            <Button type="primary" htmlType="submit" block style={{ height: 44, fontWeight: 600, fontSize: 15 }}>
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        {isDev && (
          <>
            <Divider style={{ margin: "24px 0 16px 0", fontSize: 12, color: "#94a3b8" }}>
              Accès Rapide Démo (Environnement Dev)
            </Divider>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(Object.keys(roleConfig) as Role[]).map((role) => (
                <Button
                  key={role}
                  size="middle"
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                  }}
                  onClick={() => handleMockLogin(role)}
                >
                  <span>{roleConfig[role].title.replace("Espace ", "")}</span>
                  <SafetyCertificateOutlined style={{ fontSize: 11, color: "var(--color-primary)" }} />
                </Button>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Otp Verification Modal for 2FA Login */}
      <OtpVerificationModal
        open={isOtpOpen}
        title="Double Facteur (2FA) - Connexion Sécurisée"
        subtitle="Entrez le code OTP envoyé par SMS ou Email pour valider votre connexion."
        onClose={() => setIsOtpOpen(false)}
        onSuccess={() => {
          setIsOtpOpen(false);
          if (pendingLogin) {
            executeLogin(pendingLogin.token, pendingLogin.role, pendingLogin.name);
          }
        }}
      />
    </div>
  );
}