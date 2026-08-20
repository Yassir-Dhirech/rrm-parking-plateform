import { Button, Card, Row, Col, Tag, Typography, Divider } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";

const { Title, Paragraph, Text } = Typography;

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section
        id="accueil"
        style={{
          background: "linear-gradient(135deg, #001E3D 0%, #003566 60%, #004D80 100%)",
          color: "#ffffff",
          padding: "48px 24px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Tag
            color="gold"
            style={{
              fontSize: 12,
              padding: "4px 14px",
              borderRadius: 20,
              marginBottom: 12,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(255, 195, 0, 0.25)",
            }}
          >
            <SafetyCertificateOutlined style={{ marginRight: 6 }} /> Service Officiel Rabat Région Mobilité
          </Tag>

          <Title level={1} style={{ color: "#ffffff", fontSize: "2.1rem", fontWeight: 800, margin: "8px 0 12px", lineHeight: 1.25 }}>
            Plateforme d'Abonnement des Parkings de Rabat
          </Title>

          <Paragraph style={{ color: "#cbd5e1", fontSize: "1.05rem", maxWidth: 680, margin: "0 auto 24px", lineHeight: 1.55 }}>
            Souscrivez, renouvelez ou gérez votre abonnement de stationnement en ligne en quelques clics.
            Service rapide sans création de compte, disponible pour les 17 parkings régionaux de Rabat.
          </Paragraph>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/demande-publique")}
              style={{
                height: 50,
                padding: "0 28px",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 25,
                backgroundColor: "#ffc300",
                borderColor: "#ffc300",
                color: "#001e3d",
                boxShadow: "0 4px 15px rgba(255, 195, 0, 0.4)",
              }}
            >
              Faire une Démarche en Ligne
            </Button>
            <Button
              size="large"
              icon={<PhoneOutlined />}
              onClick={() => {
                const el = document.getElementById("contact");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                height: 50,
                padding: "0 24px",
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 25,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              Assistance & Contact
            </Button>
          </div>

          {/* Key Stats Chips */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 28 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#ffc300" }}>17</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Parkings Rabat</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8" }}>10 000+</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Abonnés Actifs</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#4ade80" }}>24h / 7j</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Accès Garanti</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f472b6" }}>100%</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Certification OTP</div>
            </div>
          </div>
        </div>

        {/* Decorative Tricolor Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #982B5E 0%, #FFC300 50%, #0284C7 100%)",
          }}
        />
      </section>

      {/* 4 Demarches Cards Portal Section */}
      <section id="abonnement" style={{ padding: "70px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Tag color="blue" style={{ fontSize: 12, padding: "2px 10px", borderRadius: 12, marginBottom: 8 }}>
            Services en Ligne Sans Compte
          </Tag>
          <Title level={2} style={{ color: "#0f172a", margin: 0, fontWeight: 700 }}>
            Quelle démarche souhaitez-vous effectuer ?
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Sélectionnez votre type de demande pour accéder directement au formulaire personnalisé.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate("/demande-publique")}
              style={{
                borderRadius: 16,
                border: "1px solid #bae6fd",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 14px rgba(0, 53, 102, 0.05)",
                textAlign: "center",
                height: "100%",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#f0f9ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "1px solid #bae6fd",
                }}
              >
                <FileTextOutlined style={{ fontSize: 26, color: "#0284c7" }} />
              </div>
              <Tag color="blue" style={{ marginBottom: 10 }}>Nouvel Abonnement</Tag>
              <h3 style={{ margin: "4px 0 8px", color: "#0f172a", fontSize: "1.1rem" }}>Première Souscription</h3>
              <p style={{ color: "#64748b", fontSize: 13, minHeight: 48, lineHeight: 1.5 }}>
                Formulaire en 4 étapes pour créer votre premier abonnement.
              </p>
              <Button type="primary" size="small" block style={{ backgroundColor: "#0284c7", borderRadius: 8, marginTop: 12 }}>
                Souscrire →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate("/demande-publique")}
              style={{
                borderRadius: 16,
                border: "1px solid #ddd6fe",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 14px rgba(0, 53, 102, 0.05)",
                textAlign: "center",
                height: "100%",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "1px solid #ddd6fe",
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 26, color: "#7c3aed" }} />
              </div>
              <Tag color="purple" style={{ marginBottom: 10 }}>Renouvellement</Tag>
              <h3 style={{ margin: "4px 0 8px", color: "#0f172a", fontSize: "1.1rem" }}>Prolonger Abonnement</h3>
              <p style={{ color: "#64748b", fontSize: 13, minHeight: 48, lineHeight: 1.5 }}>
                Recherche automatique par CIN ou Carte sans ressaisir vos coordonnées.
              </p>
              <Button type="primary" size="small" block style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed", borderRadius: 8, marginTop: 12 }}>
                Renouveler →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate("/demande-publique")}
              style={{
                borderRadius: 16,
                border: "1px solid #fde68a",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 14px rgba(0, 53, 102, 0.05)",
                textAlign: "center",
                height: "100%",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "1px solid #fde68a",
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 26, color: "#d97706" }} />
              </div>
              <Tag color="orange" style={{ marginBottom: 10 }}>Transfert Parking</Tag>
              <h3 style={{ margin: "4px 0 8px", color: "#0f172a", fontSize: "1.1rem" }}>Changer de Gare</h3>
              <p style={{ color: "#64748b", fontSize: 13, minHeight: 48, lineHeight: 1.5 }}>
                Demander le transfert de votre abonnement vers un autre parking Rabat.
              </p>
              <Button type="primary" size="small" block style={{ backgroundColor: "#d97706", borderColor: "#d97706", borderRadius: 8, marginTop: 12 }}>
                Changer Parking →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              onClick={() => navigate("/demande-publique")}
              style={{
                borderRadius: 16,
                border: "1px solid #a5f3fc",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 14px rgba(0, 53, 102, 0.05)",
                textAlign: "center",
                height: "100%",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#ecfeff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "1px solid #a5f3fc",
                }}
              >
                <CarOutlined style={{ fontSize: 26, color: "#0891b2" }} />
              </div>
              <Tag color="cyan" style={{ marginBottom: 10 }}>Véhicule</Tag>
              <h3 style={{ margin: "4px 0 8px", color: "#0f172a", fontSize: "1.1rem" }}>Modifier Véhicule</h3>
              <p style={{ color: "#64748b", fontSize: 13, minHeight: 48, lineHeight: 1.5 }}>
                Mettre à jour la plaque d'immatriculation de votre carte d'abonné.
              </p>
              <Button type="primary" size="small" block style={{ backgroundColor: "#0891b2", borderColor: "#0891b2", borderRadius: 8, marginTop: 12 }}>
                Modifier Plaque →
              </Button>
            </Card>
          </Col>
        </Row>
      </section>

      {/* About RRM Section */}
      <section
        id="about"
        style={{
          backgroundColor: "#ffffff",
          padding: "70px 24px",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Tag color="geekblue" style={{ marginBottom: 12 }}>À Propos de l'Opérateur</Tag>
              <Title level={2} style={{ color: "#0f172a", marginTop: 0, fontWeight: 700 }}>
                Rabat Région Mobilité (RRM)
              </Title>
              <Paragraph style={{ color: "#475569", fontSize: 15, lineHeight: 1.7 }}>
                Société de Développement Local (SDL), Rabat Région Mobilité est l'acteur majeur de la mobilité urbaine dans la conurbation Rabat-Salé-Témara.
              </Paragraph>
              <Paragraph style={{ color: "#475569", fontSize: 15, lineHeight: 1.7 }}>
                Nous assurons la gestion moderne et sécurisée des ouvrages de stationnement régionaux, du réseau de tramway et des infrastructures de transport pour offrir aux usagers des solutions de mobilité fluide et connectée.
              </Paragraph>
              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                <CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} /> <Text style={{ fontWeight: 600 }}>Contrôle d'Accès RFID & Lecture LPR</Text>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} /> <Text style={{ fontWeight: 600 }}>Paiement Sécurisé & Certification OTP</Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 16,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <BuildOutlined style={{ fontSize: 24, color: "#0284c7" }} />
                  <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem" }}>Principaux Parkings Régionaux</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span><strong>Parking Agdal Gare</strong> (450 places)</span>
                    <Tag color="green">Accès 24/7</Tag>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span><strong>Parking Bab El Had</strong> (200 places)</span>
                    <Tag color="blue">Centre-Ville</Tag>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span><strong>Parking Hassan II</strong> (300 places)</span>
                    <Tag color="purple">Gare Ville</Tag>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span><strong>Parking Chellah</strong> (250 places)</span>
                    <Tag color="cyan">Historique</Tag>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer id="contact" style={{ backgroundColor: "#001e3d", color: "#ffffff", padding: "50px 24px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12} md={8}>
              <img src="/pictures/logo-rrm.png" alt="RRM" style={{ height: 48, filter: "brightness(0) invert(1)", marginBottom: 12 }} />
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
                Société de Développement Local — Rabat Région Mobilité.
                Opérateur officiel du stationnement et de la mobilité urbaine.
              </p>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <h4 style={{ color: "#ffffff", fontSize: 15, marginBottom: 12 }}>Contact & Assistance</h4>
              <div style={{ color: "#94a3b8", fontSize: 13, display: "flex", flexDirection: "column", gap: 8 }}>
                <div><PhoneOutlined style={{ marginRight: 8, color: "#ffc300" }} /> Centre d'appel : 0537 00 11 22</div>
                <div><MailOutlined style={{ marginRight: 8, color: "#ffc300" }} /> Support Email : contact@rrm.ma</div>
                <div><EnvironmentOutlined style={{ marginRight: 8, color: "#ffc300" }} /> Siège RRM, Avenue Al Araar, Hay Riad, Rabat</div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <h4 style={{ color: "#ffffff", fontSize: 15, marginBottom: 12 }}>Accès Personnel</h4>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
                Espace réservé aux Agents de guichet, Superviseurs et Responsables RRM.
              </p>
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate("/login")} style={{ backgroundColor: "#0284c7", borderRadius: 8 }}>
                Connexion Personnel RRM
              </Button>
            </Col>
          </Row>

          <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "32px 0 16px" }} />

          <div style={{ textAlign: "center", color: "#64748b", fontSize: 12 }}>
            © {new Date().getFullYear()} Rabat Région Mobilité (RRM). Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}