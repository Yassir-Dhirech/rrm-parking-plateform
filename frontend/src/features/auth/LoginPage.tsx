import { Form, Input, Button, Card, message, Divider, Typography, Checkbox, Tag } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  KeyOutlined,
} from "@ant-design/icons";
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

const roleBadgeColors: Record<Role, string> = {
  AGENT: "blue",
  SUPERVISEUR: "purple",
  RESPONSABLE: "gold",
  COMPTABLE: "green",
  RESP_REPORTING: "cyan",
  ADMIN_SI: "red",
};

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
        minHeight: "100vh",
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
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          border: "none",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
        styles={{ body: { padding: "32px 28px 24px" } }}
      >
        {/* Top Tricolor Accent Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #982B5E 0%, #FFC300 50%, #003566 100%)",
          }}
        />

        <div style={{ marginBottom: 12 }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/demande-publique")}
            style={{ padding: 0, color: "#64748b", fontWeight: 500, fontSize: 13 }}
          >
            Retour au Portail Public
          </Button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src="/pictures/logo-rrm.png"
            alt="Rabat Région Mobilité"
            style={{ maxHeight: 52, marginBottom: 12, objectFit: "contain" }}
          />
          <Title level={4} style={{ margin: "0 0 4px", color: "#003566", fontWeight: 800, fontSize: "1.2rem" }}>
            Plateforme Parking RRM
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Connectez-vous à votre espace de gestion
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Adresse Email" rules={[{ required: true, message: "Saisissez votre email" }]}>
            <Input
              prefix={<UserOutlined style={{ color: "#003566" }} />}
              placeholder="exemple@rrm.ma"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item name="motDePasse" label="Mot de passe" rules={[{ required: true, message: "Saisissez votre mot de passe" }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: "#003566" }} />}
              placeholder="••••••••"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Checkbox checked={require2fa} onChange={(e) => setRequire2fa(e.target.checked)}>
              <span style={{ fontSize: 13, color: "#475569" }}>Exiger la vérification 2FA par Code OTP</span>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 0, marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<ArrowRightOutlined />}
              style={{
                height: 44,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 8,
                backgroundColor: "#003566",
                borderColor: "#003566",
                boxShadow: "0 4px 12px rgba(0, 53, 102, 0.25)",
              }}
            >
              Se connecter
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: "20px 0 14px 0", fontSize: 12, color: "#94a3b8" }}>
          <KeyOutlined style={{ marginRight: 4 }} /> Accès Rapide Démo — Espace Personnel
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
                borderRadius: 8,
                borderColor: "#cbd5e1",
              }}
              onClick={() => handleMockLogin(role)}
            >
              <span style={{ fontWeight: 600 }}>{roleConfig[role].title.replace("Espace ", "")}</span>
              <Tag color={roleBadgeColors[role]} style={{ margin: 0, fontSize: 10, padding: "0 4px" }}>
                {role.substring(0, 3)}
              </Tag>
            </Button>
          ))}
        </div>
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