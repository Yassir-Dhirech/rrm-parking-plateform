import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Form,
  Input,
  Button,
  Select,
  Breadcrumb,
  Collapse,
  message,
  Tabs,
  Alert,
  Result,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "../components/ui/PublicNavbar";
import { getParkingsMock } from "../api/adminMock";
import { creerReclamationMock } from "../api/reclamationsMock";
import { CATEGORIES_RECLAMATION_LABELS, type CategorieReclamation, type PublicReclamationInput, type ReclamationItem } from "../features/reclamations/types";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function ContactPage() {
  const navigate = useNavigate();
  const [contactForm] = Form.useForm();
  const [reclamationForm] = Form.useForm();
  
  const [activeTab, setActiveTab] = useState<"CONTACT" | "RECLAMATION">("CONTACT");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [createdReclamation, setCreatedReclamation] = useState<ReclamationItem | null>(null);

  const { data: parkings = [] } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  const reclamationMutation = useMutation({
    mutationFn: (values: PublicReclamationInput) => creerReclamationMock(values),
    onSuccess: (data) => {
      setCreatedReclamation(data);
      reclamationForm.resetFields();
    },
  });

  const handleContactSubmit = (_values: any) => {
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      message.success("Votre message d'information a été transmis avec succès au service client RRM !");
      contactForm.resetFields();
    }, 800);
  };

  const handleReclamationSubmit = (values: any) => {
    const selectedParking = parkings.find((p) => p.id === values.parkingId);
    reclamationMutation.mutate({
      nomPrenom: values.nomPrenom,
      email: values.email,
      telephone: values.telephone,
      parkingId: values.parkingId,
      parkingNom: selectedParking?.nom || "Parking Agdal Gare",
      typeReclamation: values.typeReclamation as CategorieReclamation,
      numeroTicketOuCarte: values.numeroTicketOuCarte,
      immatriculation: values.immatriculation,
      descriptionDetaillee: values.descriptionDetaillee,
    });
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
            Contact & Service Réclamations Usagers
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Posez une question générale ou déposez un signalement / réclamation sur un incident au niveau des parkings.
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

      <div style={{ maxWidth: 1060, margin: "24px auto 0", padding: "0 20px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 20 }}
          items={[
            { title: <a onClick={() => navigate("/")}><HomeOutlined /> Accueil</a> },
            { title: "Contact & Réclamation" },
          ]}
        />

        <Row gutter={[24, 24]}>
          {/* Left Column: Nav Tabs with Forms */}
          <Col xs={24} md={15}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0, 53, 102, 0.05)",
                border: "1px solid #cbd5e1",
              }}
              styles={{ body: { padding: "16px 24px 24px" } }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                  setActiveTab(key as "CONTACT" | "RECLAMATION");
                  setCreatedReclamation(null);
                }}
                size="large"
                items={[
                  {
                    key: "CONTACT",
                    label: (
                      <span>
                        <MailOutlined style={{ marginRight: 6 }} />
                        Message & Contact Général
                      </span>
                    ),
                  },
                  {
                    key: "RECLAMATION",
                    label: (
                      <span>
                        <AlertOutlined style={{ marginRight: 6, color: "#ef4444" }} />
                        Déposer une Réclamation
                      </span>
                    ),
                  },
                ]}
              />

              {/* TAB 1: Contact Général Form */}
              {activeTab === "CONTACT" && (
                <Form form={contactForm} layout="vertical" onFinish={handleContactSubmit} size="large" style={{ marginTop: 12 }}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="nomComplet" label="Nom & Prénom" rules={[{ required: true, message: "Nom requis" }]}>
                        <Input placeholder="Ex: Karim El Amrani" style={{ borderRadius: 8 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="telephone" label="Téléphone (GSM)">
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
                      <Option value="badge_rfid">Perte de Badge RFID / Question Carte</Option>
                      <Option value="facturation">Demande de Reçu ou Facture</Option>
                      <Option value="autre">Autre Demande d'Information</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="message" label="Votre Message" rules={[{ required: true, message: "Rédigez votre message" }]}>
                    <TextArea rows={4} placeholder="Décrivez votre demande d'information en détail..." style={{ borderRadius: 8 }} />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmittingContact}
                    block
                    icon={<SendOutlined />}
                    style={{
                      height: 46,
                      fontWeight: 600,
                      borderRadius: 10,
                      backgroundColor: "#003566",
                      borderColor: "#003566",
                    }}
                  >
                    Envoyer le Message
                  </Button>
                </Form>
              )}

              {/* TAB 2: Réclamation & Incident Form */}
              {activeTab === "RECLAMATION" && (
                <div style={{ marginTop: 12 }}>
                  {createdReclamation ? (
                    <Result
                      status="success"
                      title="Réclamation Transmise au Chef de Gare !"
                      subTitle={
                        <div>
                          <Paragraph style={{ fontSize: 14 }}>
                            Votre dossier a été enregistré sous le numéro de suivi officiel :
                          </Paragraph>
                          <Tag color="red" style={{ fontSize: 16, padding: "6px 14px", borderRadius: 8, fontWeight: 700, margin: "8px 0" }}>
                            N° Suivi : {createdReclamation.reference}
                          </Tag>
                          <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 8 }}>
                            Les agents d'exploitation du <strong>{createdReclamation.parkingNom}</strong> et le service client RRM ont été notifiés en priorité.
                          </Paragraph>
                        </div>
                      }
                      extra={[
                        <Button type="primary" key="new" onClick={() => setCreatedReclamation(null)} style={{ backgroundColor: "#003566", borderRadius: 8 }}>
                          Déposer un Autre Signalement
                        </Button>,
                      ]}
                    />
                  ) : (
                    <>
                      <Alert
                        type="error"
                        showIcon
                        icon={<AlertOutlined />}
                        message="Service Signalements & Incidents Usagers RRM"
                        description="Veuillez sélectionner le cas exact de votre réclamation. Votre dossier sera transmis directement au chef de gare pour prise en charge immédiate."
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />

                      <Form form={reclamationForm} layout="vertical" onFinish={handleReclamationSubmit} size="large">
                        <Form.Item
                          name="typeReclamation"
                          label={<span style={{ fontWeight: 600 }}>Cas / Motif de la Réclamation :</span>}
                          rules={[{ required: true, message: "Sélectionnez le motif exact." }]}
                        >
                          <Select placeholder="Choisir le cas de votre réclamation..." style={{ borderRadius: 8 }}>
                            {Object.entries(CATEGORIES_RECLAMATION_LABELS).map(([key, item]) => (
                              <Option key={key} value={key}>
                                <strong>{item.label}</strong>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="parkingId"
                          label={<span style={{ fontWeight: 600 }}>Parking Concerné :</span>}
                          rules={[{ required: true, message: "Sélectionnez le parking concerné." }]}
                        >
                          <Select placeholder="Sélectionnez le parking..." style={{ borderRadius: 8 }}>
                            {parkings.map((p) => (
                              <Option key={p.id} value={p.id}>
                                {p.nom} ({p.code})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="nomPrenom" label="Nom & Prénom" rules={[{ required: true, message: "Nom requis" }]}>
                              <Input placeholder="Karim El Amrani" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="telephone" label="Téléphone (GSM)" rules={[{ required: true, message: "Téléphone requis" }]}>
                              <Input placeholder="06 61 12 34 56" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="email" label="Adresse Email" rules={[{ required: true, type: "email", message: "Email valide requis" }]}>
                          <Input placeholder="karim@exemple.ma" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item name="immatriculation" label="Plaque d'Immatriculation (Facultatif)">
                              <Input placeholder="12345-A-6" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item name="numeroTicketOuCarte" label="N° Ticket / N° Carte (Facultatif)">
                              <Input placeholder="TCK-991023 ou ABO-2026-001" style={{ borderRadius: 8 }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="descriptionDetaillee" label="Description de l'Incident" rules={[{ required: true, message: "Veuillez expliciter l'incident." }]}>
                          <TextArea rows={4} placeholder="Explicitez l'incident (heure, borne, montant prélevé, barrière bloquée...)" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={reclamationMutation.isPending}
                          block
                          icon={<AlertOutlined />}
                          style={{
                            height: 46,
                            fontWeight: 600,
                            borderRadius: 10,
                            backgroundColor: "#ef4444",
                            borderColor: "#ef4444",
                          }}
                        >
                          Transmettre la Réclamation en Ligne
                        </Button>
                      </Form>
                    </>
                  )}
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column: Contact Info Cards */}
          <Col xs={24} md={9}>
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
                label: "Comment suivre l'avancement de ma réclamation ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Lorsque vous déposez une réclamation sous l'onglet <strong>Déposer une Réclamation</strong>, un numéro de suivi unique (ex: <code>RECL-2026-000083</code>) vous est attribué. Vous recevrez une réponse du chef de gare sous 24h à 48h.
                  </p>
                ),
              },
              {
                key: "2",
                label: "Comment fonctionne le renouvellement d'abonnement sans compte ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Il vous suffit de sélectionner la démarche <strong>Renouvellement</strong> sur la plateforme et de saisir votre numéro de CIN ou votre numéro de carte d'abonné (ex: <code>CRT-2025-001099</code>). Le système retrouve immédiatement votre dossier actif.
                  </p>
                ),
              },
              {
                key: "3",
                label: "Que faire en cas de défaillance de la caméra LPR ou de la barrière ?",
                children: (
                  <p style={{ color: "#475569", margin: 0 }}>
                    Sélectionnez la catégorie <strong>Problème de Lecture LPR / Barrière non ouverte</strong> sous l'onglet Réclamation de cette page ou appelez l'assistance d'urgence <code>0537 00 11 22</code>.
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
