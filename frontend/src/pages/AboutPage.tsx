import { Card, Row, Col, Tag, Typography, Breadcrumb } from "antd";
import {
  BuildOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PublicNavbar } from "../components/ui/PublicNavbar";

const { Title, Paragraph } = Typography;

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>
      <PublicNavbar />

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #001E3D 0%, #003566 60%, #004D80 100%)",
          color: "#ffffff",
          padding: "28px 20px 36px",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0, 53, 102, 0.15)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Tag color="gold" style={{ fontSize: 12, padding: "2px 12px", borderRadius: 20, marginBottom: 8, fontWeight: 600 }}>
            <SafetyCertificateOutlined style={{ marginRight: 6 }} /> Société de Développement Local (SDL)
          </Tag>
          <h1 style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-0.5px" }}>
            À Propos de Rabat Région Mobilité
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Acteur majeur et opérateur public de la mobilité urbaine moderne dans la région Rabat-Salé-Témara.
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #982B5E 0%, #FFC300 50%, #0284C7 100%)",
          }}
        />
      </div>

      <div style={{ maxWidth: 1000, margin: "24px auto 0", padding: "0 20px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 20 }}
          items={[
            { title: <a onClick={() => navigate("/")}><HomeOutlined /> Accueil</a> },
            { title: "À Propos de RRM" },
          ]}
        />

        {/* Mission Card */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0, 53, 102, 0.05)",
            border: "1px solid #e2e8f0",
            marginBottom: 24,
          }}
          styles={{ body: { padding: 32 } }}
        >
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} md={14}>
              <Tag color="blue" style={{ marginBottom: 12 }}>Mission Institutionnelle</Tag>
              <Title level={2} style={{ color: "#003566", marginTop: 0, fontWeight: 800, fontSize: "1.5rem" }}>
                Un Réseau de Stationnement Moderne & Connecté
              </Title>
              <Paragraph style={{ color: "#334155", fontSize: 14.5, lineHeight: 1.7 }}>
                Créée sous forme de Société de Développement Local, <strong>Rabat Région Mobilité (RRM)</strong> a pour vocation d’organiser, de développer et d’exploiter les services de mobilité urbaine dans la capitale et ses environs.
              </Paragraph>
              <Paragraph style={{ color: "#334155", fontSize: 14.5, lineHeight: 1.7 }}>
                En plus du réseau de tramway et des autobus, RRM gère un parc de <strong>17 ouvrages de stationnement stratégiques</strong> totalisant des milliers de places équipées des dernières technologies de lecture de plaque (LPR) et de contrôle RFID.
              </Paragraph>
            </Col>
            <Col xs={24} md={10}>
              <div
                style={{
                  backgroundColor: "#f0f9ff",
                  padding: 24,
                  borderRadius: 16,
                  border: "1px solid #bae6fd",
                  textAlign: "center",
                }}
              >
                <BuildOutlined style={{ fontSize: 42, color: "#0284c7", marginBottom: 12 }} />
                <h3 style={{ margin: "0 0 8px", color: "#0369a1", fontSize: "1.2rem" }}>17 Parkings Régionaux</h3>
                <p style={{ color: "#475569", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Gestion centralisée avec suivi en temps réel des disponibilités et des abonnements.
                </p>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Pillars Cards */}
        <Title level={3} style={{ color: "#0f172a", marginBottom: 16, fontWeight: 700 }}>
          Nos Engagements et Technologies
        </Title>
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} md={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                height: "100%",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <RocketOutlined style={{ fontSize: 32, color: "#0284c7", marginBottom: 12 }} />
              <h4 style={{ color: "#0f172a", fontSize: "1.1rem", margin: "0 0 8px" }}>Fluidité & Digitalisation</h4>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Abonnements souscrits sans déplacement physique avec validation OTP rapide et paiement bancaire sécurisé.
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                height: "100%",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <SafetyCertificateOutlined style={{ fontSize: 32, color: "#7c3aed", marginBottom: 12 }} />
              <h4 style={{ color: "#0f172a", fontSize: "1.1rem", margin: "0 0 8px" }}>Sécurité & Contrôle RFID</h4>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Chaque abonné dispose d'un badge RFID individuel couplé aux caméras LPR de détection automatique des véhicules.
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                height: "100%",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <TeamOutlined style={{ fontSize: 32, color: "#10b981", marginBottom: 12 }} />
              <h4 style={{ color: "#0f172a", fontSize: "1.1rem", margin: "0 0 8px" }}>Service Client Dédier</h4>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Assistance téléphonique 7j/7 et guichets physiques dans tous les grands parkings de la capitale.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Directory List */}
        <Card title="Répertoire des Parkings Rabat Région Mobilité" style={{ borderRadius: 16 }}>
          <Row gutter={[16, 12]}>
            {[
              { nom: "Parking Agdal Gare", cap: "450 places", badge: "Gare TGV" },
              { nom: "Parking Bab El Had", cap: "200 places", badge: "Centre-Ville" },
              { nom: "Parking Hassan II", cap: "300 places", badge: "Gare Ville" },
              { nom: "Parking Chellah", cap: "250 places", badge: "Site Historique" },
              { nom: "Parking Avenue de France", cap: "180 places", badge: "Agdal Business" },
              { nom: "Parking Oudaïas", cap: "150 places", badge: "Kasbah" },
            ].map((p, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8fafc",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13.5 }}>
                      <EnvironmentOutlined style={{ color: "#0284c7", marginRight: 6 }} />
                      {p.nom}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{p.cap}</div>
                  </div>
                  <Tag color="blue">{p.badge}</Tag>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  );
}
