import { Card, Row, Col, Tag, Typography, Form, Input, Button, Select, Breadcrumb, Collapse, message } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PublicNavbar } from "../components/ui/PublicNavbar";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function ContactPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (_values: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      message.success("Votre message a été transmis avec succès au service client RRM !");
      form.resetFields();
    }, 1000);
  };

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
            <CustomerServiceOutlined style={{ marginRight: 6 }} /> Support & Assistance Client RRM
          </Tag>
          <h1 style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-0.5px" }}>
            Contactez Rabat Région Mobilité
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Une question sur votre abonnement, votre badge RFID ou un paiement ? Nos équipes sont à votre écoute.
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
            { title: "Contact & Assistance" },
          ]}
        />

        <Row gutter={[24, 24]}>
          {/* Left Column: Form */}
          <Col xs={24} md={14}>
            <Card
              title={<span style={{ color: "#003566", fontWeight: 700 }}><SendOutlined style={{ marginRight: 8 }} /> Formulaire d'Assistance</span>}
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0, 53, 102, 0.05)",
                border: "1px solid #e2e8f0",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="nomComplet" label="Nom & Prénom" rules={[{ required: true, message: "Nom requis" }]}>
                      <Input placeholder="Karim El Amrani" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="telephone" label="Téléphone (Optionnel)">
                      <Input placeholder="0661 12 34 56" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="email" label="Adresse Email" rules={[{ required: true, type: "email", message: "Email valide requis" }]}>
                  <Input placeholder="karim@exemple.ma" style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item name="sujet" label="Sujet de votre demande" rules={[{ required: true, message: "Sélectionnez un sujet" }]}>
                  <Select placeholder="Choisir le motif de votre message" style={{ borderRadius: 8 }}>
                    <Option value="renouvellement">Question sur un Renouvellement</Option>
                    <Option value="changement_parking">Demande de Transfert de Parking</Option>
                    <Option value="badge_rfid">Perte ou Dysfonctionnement de Badge RFID</Option>
                    <Option value="facturation">Question sur une Facture / Paiement</Option>
                    <Option value="autre">Autre Demande d'Information</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="message" label="Votre Message" rules={[{ required: true, message: "Rédigez votre message" }]}>
                  <TextArea rows={4} placeholder="Décrivez votre demande en détail..." style={{ borderRadius: 8 }} />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                  icon={<SendOutlined />}
                  style={{
                    height: 44,
                    fontWeight: 600,
                    borderRadius: 10,
                    backgroundColor: "#003566",
                    borderColor: "#003566",
                  }}
                >
                  Envoyer le Message
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Right Column: Contact Info Cards */}
          <Col xs={24} md={10}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #bae6fd",
                  backgroundColor: "#f0f9ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ padding: 10, backgroundColor: "#e0f2fe", borderRadius: 10 }}>
                    <PhoneOutlined style={{ fontSize: 24, color: "#0284c7" }} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#0369a1", fontSize: "1.05rem" }}>Centre d'Appel Client</h4>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>0537 00 11 22</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} /> Lundi au Samedi : 8h00 - 20h00
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #ddd6fe",
                  backgroundColor: "#f5f3ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ padding: 10, backgroundColor: "#ede9fe", borderRadius: 10 }}>
                    <MailOutlined style={{ fontSize: 24, color: "#7c3aed" }} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#6d28d9", fontSize: "1.05rem" }}>Support par Email</h4>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>contact@rrm.ma</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Réponse sous 24h ouvrées</p>
                  </div>
                </div>
              </Card>

              <Card
                style={{
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 10 }}>
                    <EnvironmentOutlined style={{ fontSize: 24, color: "#475569" }} />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "1.05rem" }}>Siège Social RRM</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                      Avenue Al Araar, Secteur 16, Hay Riad, Rabat
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* FAQ Accordion Section */}
        <div style={{ marginTop: 36 }}>
          <Title level={3} style={{ color: "#0f172a", marginBottom: 16, fontWeight: 700 }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: "#0284c7" }} /> Questions Fréquemment Posées (FAQ)
          </Title>

          <Collapse
            style={{ borderRadius: 12, backgroundColor: "#ffffff" }}
            items={[
              {
                key: "1",
                label: "Comment fonctionne le renouvellement d'abonnement sans compte ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Il vous suffit de sélectionner la démarche <strong>Renouvellement</strong> sur la plateforme et de saisir votre numéro de CIN ou votre numéro de carte d'abonné (ex: <code>CRT-2025-001099</code>). Le système retrouve immédiatement votre dossier actif.
                  </p>
                ),
              },
              {
                key: "2",
                label: "Que faire en cas de perte de ma carte d'abonné RFID ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Contactez immédiatement notre centre d'appel au <code>0537 00 11 22</code> ou présentez-vous au guichet de votre parking d'attache avec votre pièce d'identité pour bloquer l'ancienne carte et obtenir un duplicata.
                  </p>
                ),
              },
              {
                key: "3",
                label: "Puis-je changer d'immatriculation en cours d'abonnement ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Oui ! Utilisez la démarche <strong>Changement de Véhicule</strong> sur la plateforme. Saisissez votre CIN pour charger votre profil, puis indiquez la nouvelle plaque. La modification est prise en compte après validation.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
