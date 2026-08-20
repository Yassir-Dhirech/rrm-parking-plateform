import { useState } from "react";
import {
  Steps,
  Form,
  Input,
  Select,
  Button,
  Result,
  Card,
  message,
  Tabs,
  Radio,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
  Modal,
  Badge,
  Space,
  Typography,
} from "antd";
import {
  QrcodeOutlined,
  FileTextOutlined,
  CarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PrinterOutlined,
  SearchOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPublicParkings } from "../../../api/parkings";
import { submitPublicDemande } from "../../../api/demandes";
import { OtpVerificationModal } from "../../../components/ui/OtpVerificationModal";
import { searchDemandeByReferenceMock } from "../../../api/demandesMock";
import { searchSubscriberByCinOrCardMock, type SubscriberRecord } from "../../../api/subscribersMock";
import { type PublicDemandeInput, type DemandeDetail } from "../types";
import { type TypeClient, type TypeVehicule, type TypeDemande, typeVehiculeLabels, typeDemandeLabels } from "../../../lib/enums";
import { PublicNavbar } from "../../../components/ui/PublicNavbar";

const { Option } = Select;
const { Title, Text } = Typography;

const FORFAITS_OPTIONS = [
  {
    id: 1,
    title: "Pass Permanent (24h / 7j)",
    plage: "24h / 7j",
    duree: "1 Mois",
    priceTTC: 600,
    badge: "Accès 24/7",
    desc: "Accès permanent jour et nuit au parking sélectionné",
  },
  {
    id: 2,
    title: "Pass Journée (08:00 - 20:00)",
    plage: "08:00 - 20:00",
    duree: "1 Mois",
    priceTTC: 420,
    badge: "Diurne",
    desc: "Accès de jour du lundi au samedi de 08:00 à 20:00",
  },
  {
    id: 3,
    title: "Pass Nuit (19:00 - 08:00)",
    plage: "19:00 - 08:00",
    duree: "1 Mois",
    priceTTC: 300,
    badge: "Nocturne",
    desc: "Accès nocturne en soirée et la nuit de 19:00 à 08:00",
  },
  {
    id: 4,
    title: "Abonnement Corporate (Flotte)",
    plage: "Sur mesure",
    duree: "12 Mois",
    priceTTC: 5400,
    badge: "Entreprises",
    desc: "Abonnement de l'entreprise pour gestion de flotte de véhicules",
  },
  {
    id: 5,
    title: "Pass Deux-Roues / Moto",
    plage: "24h / 7j",
    duree: "1 Mois",
    priceTTC: 200,
    badge: "Deux-roues",
    desc: "Abonnement dédié aux motos, scooters et deux-roues",
  },
];

export function PublicQrForm() {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<TypeDemande | null>(null);
  const [typeDemande, setTypeDemande] = useState<TypeDemande>("NOUVEL_ABONNEMENT");
  const [typeClient, setTypeClient] = useState<TypeClient>("PARTICULIER");
  const [selectedForfait, setSelectedForfait] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<PublicDemandeInput>>({});

  const handleSelectType = (type: TypeDemande) => {
    setSelectedType(type);
    setTypeDemande(type);
    setCurrentStep(0);
    setFoundSubscriber(null);
    setSubscriberSearchQuery("");
    step1Form.resetFields();
    step2Form.resetFields();
  };
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [dureeMois, setDureeMois] = useState<number>(1);
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState<string>("");
  const [isSearchingSubscriber, setIsSearchingSubscriber] = useState<boolean>(false);
  const [foundSubscriber, setFoundSubscriber] = useState<SubscriberRecord | null>(null);

  // Tracking state
  const [searchRef, setSearchRef] = useState<string>("");
  const [trackedDemande, setTrackedDemande] = useState<DemandeDetail | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [cardModalOpen, setCardModalOpen] = useState<boolean>(false);

  const { data: parkings, isLoading: parkingsLoading } = useQuery({
    queryKey: ["public-parkings"],
    queryFn: getPublicParkings,
  });

  const mutation = useMutation({
    mutationFn: submitPublicDemande,
    onSuccess: (result) => {
      setSubmittedReference(result.reference);
      message.success("Votre demande a été soumise avec succès !");
    },
    onError: () => {
      message.error("Une erreur est survenue lors de l'envoi de votre demande.");
    },
  });

  const [step1Form] = Form.useForm();
  const [step2Form] = Form.useForm();

  const handleSearchSubscriber = async () => {
    if (!subscriberSearchQuery.trim()) {
      message.warning("Veuillez saisir votre N° CIN ou N° de carte d'abonné");
      return;
    }
    setIsSearchingSubscriber(true);
    try {
      const sub = await searchSubscriberByCinOrCardMock(subscriberSearchQuery);
      if (sub) {
        setFoundSubscriber(sub);
        step1Form.setFieldsValue({
          nom: sub.nom,
          prenom: sub.prenom,
          cin: sub.cin,
          email: sub.email,
          telephone: sub.telephone,
          numeroCarteAbonne: sub.numeroCarteAbonne,
          raisonSociale: sub.nom.includes("Société") ? sub.nom : undefined,
        });
        step2Form.setFieldsValue({
          immatriculation: sub.immatriculation,
          typeVehicule: sub.typeVehicule,
          marque: sub.marque,
          modele: sub.modele,
          ancienneImmatriculation: sub.immatriculation,
        });
        setSelectedForfait(sub.forfaitId);
        setFormData((prev) => ({
          ...prev,
          parkingId: sub.parkingId,
          numeroCarteAbonne: sub.numeroCarteAbonne,
          forfaitId: sub.forfaitId,
          forfaitNom: sub.forfaitNom,
        }));
        message.success(`Abonné identifié : ${sub.prenom} ${sub.nom} !`);
      } else {
        setFoundSubscriber(null);
        message.error("Aucun abonné trouvé avec ces identifiants.");
      }
    } finally {
      setIsSearchingSubscriber(false);
    }
  };

  const goNextFromStep1 = async (): Promise<void> => {
    const values = await step1Form.validateFields();
    setFormData((prev) => ({ ...prev, ...values, typeClient, typeDemande }));
    setCurrentStep(1);
  };

  const goNextFromStep2 = async (): Promise<void> => {
    const values = await step2Form.validateFields();
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep(2);
  };

  const handleFinalSubmit = () => {
    const forfaitObj = FORFAITS_OPTIONS.find((f) => f.id === selectedForfait);
    const monthlyPrice = forfaitObj?.priceTTC || 600;
    const discount = dureeMois === 12 ? 0.9 : 1;
    const totalTTC = Math.round(monthlyPrice * dureeMois * discount);

    const fullData: PublicDemandeInput = {
      ...formData,
      forfaitId: selectedForfait,
      forfaitNom: forfaitObj?.title,
      dureeMois,
      montantTotal: totalTTC,
      typeDemande,
      typeClient,
    } as PublicDemandeInput;

    mutation.mutate(fullData);
  };

  const handleTrackSearch = async () => {
    if (!searchRef.trim()) {
      message.warning("Veuillez saisir un numéro de référence (ex: DEM-2026-000001)");
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchDemandeByReferenceMock(searchRef);
      if (result) {
        setTrackedDemande(result);
      } else {
        setTrackedDemande(null);
        message.error("Aucune demande trouvée pour cette référence.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setSubmittedReference(null);
    setFormData({});
    step1Form.resetFields();
    step2Form.resetFields();
  };

  const getStatusStepIndex = (statut: string) => {
    switch (statut) {
      case "SOUMISE":
        return 0;
      case "EN_COURS":
        return 1;
      case "VALIDEE":
        return 2;
      case "COMPLETEE":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>
      <PublicNavbar />

      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #001E3D 0%, #003566 60%, #004D80 100%)",
          color: "#ffffff",
          padding: "24px 20px 32px",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0, 53, 102, 0.15)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Tag color="gold" style={{ fontSize: 12, padding: "2px 12px", borderRadius: 20, marginBottom: 8, fontWeight: 600 }}>
            <QrcodeOutlined style={{ marginRight: 6 }} /> Service Abonné sans Compte — Rabat Région Mobilité
          </Tag>
          <h1 style={{ color: "#ffffff", fontSize: "1.65rem", fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-0.5px" }}>
            Portail des Démarches & Abonnements Parking
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: 660, margin: "0 auto", lineHeight: 1.5 }}>
            Effectuez votre demande en ligne (Création, Renouvellement, Changement de Parking ou de Véhicule) en toute simplicité et suivez l'avancement de votre dossier avec votre code de suivi.
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

      <div style={{ maxWidth: 960, margin: "-16px auto 0", padding: "0 16px" }}>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: "form",
                label: (
                  <span>
                    <FileTextOutlined /> Formulaire de Demande
                  </span>
                ),
                children: (
                  <div>
                    {!submittedReference ? (
                      <>
                        {!selectedType ? (
                          /* 4 Choice Cards Landing Selection Screen */
                          <div>
                            <div style={{ textAlign: "center", marginBottom: 28 }}>
                              <Title level={3} style={{ color: "#0f172a", marginBottom: 6 }}>
                                Bienvenue sur le Portail d'Abonnement Rabat Région Mobilité
                              </Title>
                              <Text type="secondary" style={{ fontSize: 15 }}>
                                Sélectionnez la démarche que vous souhaitez effectuer :
                              </Text>
                            </div>

                            <Row gutter={[20, 20]}>
                              <Col xs={24} sm={12}>
                                <Card
                                  hoverable
                                  onClick={() => handleSelectType("NOUVEL_ABONNEMENT")}
                                  style={{
                                    borderRadius: 14,
                                    border: "1px solid #bae6fd",
                                    backgroundColor: "#f0f9ff",
                                    transition: "all 0.2s ease",
                                    height: "100%",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: "#e0f2fe", borderRadius: 12, display: "flex" }}>
                                      <FileTextOutlined style={{ fontSize: 32, color: "#0284c7" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, color: "#0369a1", fontSize: "1.15rem" }}>Nouvel Abonnement</h3>
                                        <Tag color="blue">Création</Tag>
                                      </div>
                                      <p style={{ color: "#475569", fontSize: 13, margin: "8px 0 14px", lineHeight: 1.5 }}>
                                        Première souscription à un abonnement de stationnement dans les parkings de Rabat. Formulaire complet en 4 étapes.
                                      </p>
                                      <Button type="primary" icon={<ArrowRightOutlined />} style={{ backgroundColor: "#0284c7" }}>
                                        Commencer cette démarche
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </Col>

                              <Col xs={24} sm={12}>
                                <Card
                                  hoverable
                                  onClick={() => handleSelectType("RENOUVELLEMENT")}
                                  style={{
                                    borderRadius: 14,
                                    border: "1px solid #ddd6fe",
                                    backgroundColor: "#f5f3ff",
                                    transition: "all 0.2s ease",
                                    height: "100%",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: "#ede9fe", borderRadius: 12, display: "flex" }}>
                                      <ClockCircleOutlined style={{ fontSize: 32, color: "#7c3aed" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, color: "#6d28d9", fontSize: "1.15rem" }}>Renouvellement d'Abonnement</h3>
                                        <Tag color="purple">Renouvellement</Tag>
                                      </div>
                                      <p style={{ color: "#475569", fontSize: 13, margin: "8px 0 14px", lineHeight: 1.5 }}>
                                        Prolonger un abonnement existant sans rien ressaisir. Recherche automatique par CIN ou Carte.
                                      </p>
                                      <Button type="primary" icon={<ArrowRightOutlined />} style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}>
                                        Rechercher & Renouveler
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </Col>

                              <Col xs={24} sm={12}>
                                <Card
                                  hoverable
                                  onClick={() => handleSelectType("CHANGEMENT_PARKING")}
                                  style={{
                                    borderRadius: 14,
                                    border: "1px solid #fde68a",
                                    backgroundColor: "#fffbeb",
                                    transition: "all 0.2s ease",
                                    height: "100%",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 12, display: "flex" }}>
                                      <EnvironmentOutlined style={{ fontSize: 32, color: "#d97706" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, color: "#b45309", fontSize: "1.15rem" }}>Changement de Parking</h3>
                                        <Tag color="orange">Transfert</Tag>
                                      </div>
                                      <p style={{ color: "#475569", fontSize: 13, margin: "8px 0 14px", lineHeight: 1.5 }}>
                                        Demander le transfert de votre abonnement vers un autre parking de Rabat (Agdal Gare, Bab El Had...).
                                      </p>
                                      <Button type="primary" icon={<ArrowRightOutlined />} style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}>
                                        Demander un Transfert
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </Col>

                              <Col xs={24} sm={12}>
                                <Card
                                  hoverable
                                  onClick={() => handleSelectType("CHANGEMENT_VEHICULE")}
                                  style={{
                                    borderRadius: 14,
                                    border: "1px solid #a5f3fc",
                                    backgroundColor: "#ecfeff",
                                    transition: "all 0.2s ease",
                                    height: "100%",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: "#cffaff", borderRadius: 12, display: "flex" }}>
                                      <CarOutlined style={{ fontSize: 32, color: "#0891b2" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, color: "#0e7490", fontSize: "1.15rem" }}>Changement de Véhicule</h3>
                                        <Tag color="cyan">Véhicule</Tag>
                                      </div>
                                      <p style={{ color: "#475569", fontSize: 13, margin: "8px 0 14px", lineHeight: 1.5 }}>
                                        Mettre à jour la plaque d'immatriculation ou le véhicule associé à votre abonnement actif.
                                      </p>
                                      <Button type="primary" icon={<ArrowRightOutlined />} style={{ backgroundColor: "#0891b2", borderColor: "#0891b2" }}>
                                        Changer de Véhicule
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </Col>
                            </Row>
                          </div>
                        ) : (
                          /* Form Workflow for Selected Type */
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
                              <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedType(null)}>
                                Changer de démarche
                              </Button>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Text type="secondary">Démarche en cours :</Text>
                                <Tag color={typeDemandeLabels[typeDemande].color} style={{ fontSize: 14, padding: "4px 12px", borderRadius: 6 }}>
                                  {typeDemandeLabels[typeDemande].label}
                                </Tag>
                              </div>
                            </div>

                            {/* Steps Indicator */}
                            <Steps
                              current={currentStep}
                              items={[
                                { title: "Client", icon: <UserOutlined /> },
                                { title: "Véhicule", icon: <CarOutlined /> },
                                { title: "Parking & Forfait", icon: <BuildOutlined /> },
                                { title: "Validation", icon: <CheckCircleOutlined /> },
                              ]}
                              style={{ marginBottom: 32 }}
                            />

                        {/* Step 0: Information Personnelles */}
                        {currentStep === 0 && (
                          <Form form={step1Form} layout="vertical">
                            {typeDemande === "NOUVEL_ABONNEMENT" ? (
                              /* Creation Flow: Manual Input Form */
                              <>
                                <Alert
                                  message="Création d'un Nouvel Abonnement — Renseigner vos Coordonnées"
                                  type="info"
                                  showIcon
                                  style={{ marginBottom: 20 }}
                                />
                                <Row gutter={16}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item label="Type de Client" required>
                                      <Radio.Group
                                        value={typeClient}
                                        onChange={(e) => setTypeClient(e.target.value as TypeClient)}
                                      >
                                        <Radio value="PARTICULIER">Particulier</Radio>
                                        <Radio value="ENTREPRISE">Entreprise</Radio>
                                      </Radio.Group>
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {typeClient === "PARTICULIER" ? (
                                  <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                      <Form.Item name="nom" label="Nom" rules={[{ required: true, message: "Nom requis" }]}>
                                        <Input placeholder="El Amrani" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                      <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: "Prénom requis" }]}>
                                        <Input placeholder="Karim" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                      <Form.Item name="cin" label="N° CIN" rules={[{ required: true, message: "CIN requise" }]}>
                                        <Input placeholder="AB123456" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                ) : (
                                  <Row gutter={16}>
                                    <Col xs={24} sm={14}>
                                      <Form.Item name="raisonSociale" label="Raison Sociale" rules={[{ required: true, message: "Raison sociale requise" }]}>
                                        <Input placeholder="Société Atlas Trans SARL" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={10}>
                                      <Form.Item name="ice" label="N° ICE (Entreprise)" rules={[{ required: true, message: "ICE requis" }]}>
                                        <Input placeholder="001234567000089" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                )}

                                <Row gutter={16}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item name="email" label="Adresse Email" rules={[{ required: true, type: "email", message: "Email valide requis" }]}>
                                      <Input placeholder="client@example.ma" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item name="telephone" label="Téléphone Mobile" rules={[{ required: true, message: "Téléphone requis" }]}>
                                      <Input placeholder="0661234567" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </>
                            ) : (
                              /* Existing Subscriber Flow: Search by CIN / Card ID without manual typing */
                              <div style={{ backgroundColor: "#f0f9ff", padding: 20, borderRadius: 12, border: "1px solid #bae6fd", marginBottom: 24 }}>
                                <div style={{ fontWeight: 700, color: "#0369a1", marginBottom: 6, fontSize: 16 }}>
                                  <SearchOutlined style={{ marginRight: 6 }} /> Identifier mon Dossier Abonné Existant :
                                </div>
                                <div style={{ color: "#475569", marginBottom: 16, fontSize: 13 }}>
                                  Saisissez simplement votre N° CIN ou N° de Carte RFID pour charger automatiquement votre dossier sans rien ressaisir manuellement.
                                </div>

                                <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
                                  <Input
                                    size="large"
                                    placeholder="Saisir votre N° CIN (ex: AB123456) ou N° Carte (ex: CRT-2025-001099)..."
                                    value={subscriberSearchQuery}
                                    onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                                    onPressEnter={handleSearchSubscriber}
                                    prefix={<IdcardOutlined style={{ color: "#0284c7" }} />}
                                    allowClear
                                  />
                                  <Button
                                    type="primary"
                                    size="large"
                                    loading={isSearchingSubscriber}
                                    onClick={handleSearchSubscriber}
                                    style={{ backgroundColor: "#0284c7" }}
                                  >
                                    Rechercher Mon Profil
                                  </Button>
                                </Space.Compact>

                                {foundSubscriber ? (
                                  <Alert
                                    type="success"
                                    showIcon
                                    message={`Dossier Abonné Chargé : ${foundSubscriber.prenom} ${foundSubscriber.nom}`}
                                    description={
                                      <div style={{ marginTop: 6, lineHeight: 1.6 }}>
                                        <div><strong>CIN :</strong> {foundSubscriber.cin} | <strong>Carte RFID :</strong> {foundSubscriber.numeroCarteAbonne}</div>
                                        <div><strong>Contact :</strong> {foundSubscriber.email} | {foundSubscriber.telephone}</div>
                                        <div><strong>Parking Actuel :</strong> {foundSubscriber.parkingNom} | <strong>Immatriculation :</strong> {foundSubscriber.immatriculation}</div>
                                      </div>
                                    }
                                  />
                                ) : (
                                  <div style={{ padding: "10px 14px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px dashed #93c5fd", fontSize: 13, color: "#475569" }}>
                                    💡 <strong>Comptes de démonstration prêts à tester :</strong>
                                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                                      <li>CIN : <code>AB123456</code> (Karim El Amrani — Parking Agdal Gare)</li>
                                      <li>N° Carte : <code>CRT-2025-003421</code> (Sara Bennis — Parking Bab El Had)</li>
                                      <li>CIN : <code>EF556677</code> (Youssef Tazi — Parking Hassan II)</li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                              <Button
                                size="large"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setSelectedType(null)}
                              >
                                Retour aux démarches
                              </Button>
                              <Button
                                type="primary"
                                size="large"
                                disabled={typeDemande !== "NOUVEL_ABONNEMENT" && !foundSubscriber}
                                onClick={goNextFromStep1}
                              >
                                Continuer <ArrowRightOutlined />
                              </Button>
                            </div>
                          </Form>
                        )}

                        {/* Step 1: Information Véhicule */}
                        {currentStep === 1 && (
                          <Form form={step2Form} layout="vertical">
                            <Alert
                              type="info"
                              showIcon
                              icon={<IdcardOutlined style={{ color: "#0284c7" }} />}
                              message="Abonnement Nominatif — Accès par Carte RFID"
                              description={
                                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                  L'immatriculation est renseignée <strong>uniquement à titre informatif</strong>.
                                  Vous pouvez accéder au parking <strong>directement grâce à votre carte d'abonné RFID</strong>.
                                  Votre abonnement est nominatif (lié à la personne et non au véhicule).
                                </div>
                              }
                              style={{ marginBottom: 20, borderRadius: 10, border: "1px solid #bae6fd", backgroundColor: "#f0f9ff" }}
                            />

                            {typeDemande === "CHANGEMENT_VEHICULE" && (
                              <Form.Item
                                name="ancienneImmatriculation"
                                label="Ancienne Immatriculation (Plaque Actuelle d'Abonné)"
                                rules={[{ required: true, message: "Indiquez l'ancienne plaque" }]}
                              >
                                <Input placeholder="Ex: 98765-A-1" size="large" />
                              </Form.Item>
                            )}

                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  name="immatriculation"
                                  label={typeDemande === "CHANGEMENT_VEHICULE" ? "Nouvelle Immatriculation du Véhicule" : "Immatriculation du véhicule"}
                                  rules={[{ required: true, message: "Immatriculation requise" }]}
                                >
                                  <Input placeholder="Ex: 12345-A-6" size="large" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  name="typeVehicule"
                                  label="Type de véhicule"
                                  rules={[{ required: true, message: "Sélectionnez un type" }]}
                                  initialValue="VOITURE"
                                >
                                  <Select size="large">
                                    {(Object.keys(typeVehiculeLabels) as TypeVehicule[]).map((key) => (
                                      <Option key={key} value={key}>
                                        {typeVehiculeLabels[key]}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                <Form.Item name="marque" label="Marque (Optionnel)">
                                  <Input placeholder="Dacia, Renault, Peugeot..." />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={12}>
                                <Form.Item name="modele" label="Modèle (Optionnel)">
                                  <Input placeholder="Sandero, Clio, 208..." />
                                </Form.Item>
                              </Col>
                            </Row>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                              <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(0)}>
                                Précédent
                              </Button>
                              <Button type="primary" size="large" onClick={goNextFromStep2}>
                                Continuer <ArrowRightOutlined />
                              </Button>
                            </div>
                          </Form>
                        )}

                        {/* Step 2: Choix Parking & Forfait */}
                        {currentStep === 2 && (
                          <div>
                            <Form layout="vertical">
                              <Form.Item label={typeDemande === "CHANGEMENT_PARKING" ? "Parking Actuel d'Attache" : "Parking de Rabat Souhaité"} required>
                                <Select
                                  size="large"
                                  loading={parkingsLoading}
                                  placeholder="Sélectionnez un parking de stationnement"
                                  value={formData.parkingId}
                                  onChange={(val) => setFormData((prev) => ({ ...prev, parkingId: val }))}
                                >
                                  {parkings?.map((p) => (
                                    <Option key={p.id} value={p.id}>
                                      <EnvironmentOutlined style={{ marginRight: 6 }} />{p.nom} ({p.code})
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>

                              {typeDemande === "CHANGEMENT_PARKING" && (
                                <>
                                  <Form.Item label="Nouveau Parking Souhaité (Transfert)" required>
                                    <Select
                                      size="large"
                                      loading={parkingsLoading}
                                      placeholder="Sélectionnez le nouveau parking Rabat"
                                      value={formData.nouveauParkingId}
                                      onChange={(val) => setFormData((prev) => ({ ...prev, nouveauParkingId: val }))}
                                    >
                                      {parkings?.filter((p) => p.id !== formData.parkingId).map((p) => (
                                        <Option key={p.id} value={p.id}>
                                          <EnvironmentOutlined style={{ marginRight: 6 }} />{p.nom} ({p.code})
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item label="Motif de la demande de transfert">
                                    <Input.TextArea
                                      rows={2}
                                      placeholder="Ex: Changement de lieu de résidence ou de bureau à Agdal..."
                                      value={formData.motifChangement}
                                      onChange={(e) => setFormData((prev) => ({ ...prev, motifChangement: e.target.value }))}
                                    />
                                  </Form.Item>
                                </>
                              )}

                              <div style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 16, marginBottom: 20 }}>
                                <div style={{ fontWeight: 600, color: "#334155", marginBottom: 10 }}>
                                  <ClockCircleOutlined style={{ color: "#0284c7", marginRight: 6 }} /> Choisir la Durée d'Engagement / Prolongation :
                                </div>
                                <Radio.Group
                                  value={dureeMois}
                                  onChange={(e) => setDureeMois(e.target.value)}
                                  buttonStyle="solid"
                                  size="large"
                                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                                >
                                  <Radio.Button value={1}>1 Mois</Radio.Button>
                                  <Radio.Button value={3}>3 Mois</Radio.Button>
                                  <Radio.Button value={6}>6 Mois</Radio.Button>
                                  <Radio.Button value={12}>
                                    12 Mois <Tag color="green" style={{ marginLeft: 4 }}>-10% Réduction</Tag>
                                  </Radio.Button>
                                </Radio.Group>
                              </div>

                              <Divider titlePlacement="left">Choisir la Formule d'Abonnement Souhaitée</Divider>

                              <Row gutter={[16, 16]}>
                                {FORFAITS_OPTIONS.map((f) => {
                                  const isSelected = selectedForfait === f.id;
                                  return (
                                    <Col xs={24} sm={12} key={f.id}>
                                      <Card
                                        hoverable
                                        onClick={() => setSelectedForfait(f.id)}
                                        style={{
                                          borderColor: isSelected ? "#0284c7" : "#e2e8f0",
                                          backgroundColor: isSelected ? "#f0f9ff" : "#ffffff",
                                          borderWidth: isSelected ? 2 : 1,
                                          borderRadius: 10,
                                          cursor: "pointer",
                                          position: "relative",
                                        }}
                                      >
                                        {f.badge && (
                                          <Tag
                                            color={isSelected ? "blue" : "default"}
                                            style={{ position: "absolute", top: 12, right: 12 }}
                                          >
                                            {f.badge}
                                          </Tag>
                                        )}
                                        <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.05rem" }}>{f.title}</h4>
                                        <div style={{ color: "#64748b", fontSize: 13, margin: "4px 0 6px" }}>{f.desc}</div>
                                        <div style={{ marginBottom: 8 }}>
                                          <Tag color="geekblue">
                                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                                            {f.plage}
                                          </Tag>
                                        </div>
                                        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0369a1" }}>
                                          {f.priceTTC.toLocaleString("fr-FR")} MAD <span style={{ fontSize: 12, fontWeight: 400, color: "#475569" }}>TTC / mois</span>
                                        </div>
                                      </Card>
                                    </Col>
                                  );
                                })}
                              </Row>
                            </Form>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                              <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(1)}>
                                Précédent
                              </Button>
                              <Button
                                type="primary"
                                size="large"
                                disabled={!formData.parkingId}
                                onClick={() => setCurrentStep(3)}
                              >
                                Récapitulatif <ArrowRightOutlined />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Recapitulatif & Envoyer Formulaire */}
                        {currentStep === 3 && (
                          <div>
                            <Alert
                              message="Vérification avant envoi de la demande d'abonnement"
                              type="warning"
                              showIcon
                              style={{ marginBottom: 20 }}
                            />

                            <Card title="Récapitulatif de votre souscription" style={{ backgroundColor: "#f8fafc" }}>
                              <Row gutter={[16, 12]}>
                                <Col span={12}>
                                  <strong>Type de Demande:</strong>{" "}
                                  <Tag color={typeDemandeLabels[typeDemande].color}>
                                    {typeDemandeLabels[typeDemande].label}
                                  </Tag>
                                </Col>
                                {formData.numeroCarteAbonne && (
                                  <Col span={12}>
                                    <strong>N° Carte Abonné:</strong> <Tag color="gold">{formData.numeroCarteAbonne}</Tag>
                                  </Col>
                                )}
                                <Col span={12}>
                                  <strong>Client:</strong>{" "}
                                  {typeClient === "PARTICULIER" ? `${formData.prenom} ${formData.nom} (CIN: ${formData.cin})` : `${formData.raisonSociale} (ICE: ${formData.ice})`}
                                </Col>
                                <Col span={12}>
                                  <strong>Email & Tél:</strong> {formData.email} | {formData.telephone}
                                </Col>
                                <Col span={12}>
                                  <strong>Véhicule:</strong> {formData.immatriculation} ({typeVehiculeLabels[formData.typeVehicule || "VOITURE"]})
                                  {formData.ancienneImmatriculation && (
                                    <div style={{ fontSize: 12, color: "#64748b" }}>Ancienne plaque : {formData.ancienneImmatriculation}</div>
                                  )}
                                </Col>
                                <Col span={12}>
                                  <strong>Parking:</strong>{" "}
                                  {parkings?.find((p) => p.id === formData.parkingId)?.nom || "Parking Agdal Gare"}
                                  {formData.nouveauParkingId && (
                                    <div style={{ color: "#d97706", fontWeight: 600 }}>
                                      ➜ Transfert vers : {parkings?.find((p) => p.id === formData.nouveauParkingId)?.nom}
                                    </div>
                                  )}
                                </Col>
                                <Col span={12}>
                                  <strong>Forfait & Durée:</strong>{" "}
                                  <Tag color="geekblue">
                                    {FORFAITS_OPTIONS.find((f) => f.id === selectedForfait)?.title} ({dureeMois} Mois)
                                  </Tag>
                                </Col>
                                <Col span={12}>
                                  <strong>Montant Total TTC Calculé:</strong>{" "}
                                  <strong style={{ fontSize: "1.2rem", color: "#16a34a" }}>
                                    {Math.round((FORFAITS_OPTIONS.find((f) => f.id === selectedForfait)?.priceTTC || 600) * dureeMois * (dureeMois === 12 ? 0.9 : 1)).toLocaleString("fr-FR")} MAD TTC
                                  </strong>
                                  {dureeMois === 12 && <Tag color="green" style={{ marginLeft: 6 }}>10% inclus</Tag>}
                                </Col>
                              </Row>
                            </Card>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                              <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(2)}>
                                Modifier les infos
                              </Button>
                              <Button
                                type="primary"
                                size="large"
                                loading={mutation.isPending}
                                onClick={() => setIsOtpModalOpen(true)}
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                              >
                                Envoyer le formulaire & Valider OTP
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                      </>
                    ) : (
                      /* Success Confirmation Screen */
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <Result
                          status="success"
                          title="Demande d'Abonnement Soumise avec Succès !"
                          subTitle={
                            <div style={{ fontSize: "1.1rem", color: "#334155" }}>
                              Votre référence de suivi unique :{" "}
                              <strong style={{ color: "#0284c7", fontSize: "1.3rem" }}>{submittedReference}</strong>
                            </div>
                          }
                          extra={[
                            <Button
                              key="copy"
                              type="default"
                              onClick={() => {
                                if (submittedReference) {
                                  navigator.clipboard.writeText(submittedReference);
                                  message.success("Référence copiée !");
                                }
                              }}
                            >
                              Copier la référence
                            </Button>,
                            <Button
                              key="track"
                              type="primary"
                              onClick={() => {
                                if (submittedReference) {
                                  setSearchRef(submittedReference);
                                  setActiveTab("track");
                                  handleTrackSearch();
                                }
                              }}
                            >
                              Suivre l'état de ma demande
                            </Button>,
                            <Button key="new" type="text" onClick={resetForm}>
                              Soumettre une autre demande
                            </Button>,
                          ]}
                        />

                        <Divider />

                        <Card style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", textAlign: "left", maxWidth: 650, margin: "0 auto" }}>
                          <h4 style={{ color: "#166534", marginTop: 0 }}>
                            <SafetyCertificateOutlined /> Prochaines étapes & Paiement :
                          </h4>
                          <ul style={{ color: "#15803d", paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                            <li>
                              Votre dossier est en cours de validation par un agent du parking RRM.
                            </li>
                            <li>
                              <strong>Paiement accepté au guichet :</strong> Espèces, Chèque bancaire (à l'ordre de Rabat Région Mobilité), ou Virement.
                            </li>
                            <li>
                              Une fois validé, vous recevrez une notification pour <strong>récupérer votre carte RFID</strong> ainsi que votre <strong>reçu et facture</strong>.
                            </li>
                          </ul>
                        </Card>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "track",
                label: (
                  <span>
                    <SearchOutlined /> Suivi de Ma Demande & Retrait Document
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 10 }}>
                    <Alert
                      message="Espace Suivi Abonné (Sans Compte)"
                      description="Saisissez votre numéro de référence (ex: DEM-2026-000001) pour consulter l'avancement, effectuer votre paiement et récupérer votre carte ou facture."
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />

                    <Row gutter={12} style={{ marginBottom: 24 }}>
                      <Col flex="auto">
                        <Input
                          size="large"
                          prefix={<SearchOutlined />}
                          placeholder="Entrez votre référence (ex: DEM-2026-000001, DEM-2026-000003 ou Email)"
                          value={searchRef}
                          onChange={(e) => setSearchRef(e.target.value)}
                          onPressEnter={handleTrackSearch}
                        />
                      </Col>
                      <Col>
                        <Button type="primary" size="large" onClick={handleTrackSearch} loading={isSearching}>
                          Rechercher
                        </Button>
                      </Col>
                    </Row>

                    {trackedDemande && (
                      <Card
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Dossier N° {trackedDemande.reference}</span>
                            <Tag
                              color={
                                trackedDemande.statut === "VALIDEE"
                                  ? "green"
                                  : trackedDemande.statut === "EN_COURS"
                                  ? "blue"
                                  : trackedDemande.statut === "REJETEE"
                                  ? "red"
                                  : "gold"
                              }
                            >
                              {trackedDemande.statut}
                            </Tag>
                          </div>
                        }
                        style={{ borderColor: "#cbd5e1" }}
                      >
                        <Steps
                          current={getStatusStepIndex(trackedDemande.statut)}
                          items={[
                            { title: "Demande Soumise", icon: <ClockCircleOutlined /> },
                            { title: "Traitement Guichet", icon: <UserOutlined /> },
                            { title: "Paiement Validé", icon: <DollarOutlined /> },
                            { title: "Carte Prête", icon: <IdcardOutlined /> },
                          ]}
                          style={{ marginBottom: 30 }}
                        />

                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <div><strong>Client:</strong> {trackedDemande.clientNom}</div>
                            <div><strong>Email:</strong> {trackedDemande.email}</div>
                            <div><strong>Téléphone:</strong> {trackedDemande.telephone}</div>
                          </Col>
                          <Col xs={24} sm={12}>
                            <div><strong>Parking:</strong> {trackedDemande.parkingNom}</div>
                            <div><strong>Immatriculation:</strong> {trackedDemande.immatriculation}</div>
                            <div><strong>Date de création:</strong> {trackedDemande.dateCreation}</div>
                          </Col>
                        </Row>

                        <Divider />

                        {trackedDemande.statut === "VALIDEE" ? (
                          <div style={{ backgroundColor: "#f0fdf4", padding: 16, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <span style={{ fontWeight: 600, color: "#166534", fontSize: "1.05rem" }}>
                                <CheckCircleOutlined style={{ color: "#16a34a", marginRight: 6 }} />
                                Votre demande est validée ! Carte & Documents disponibles
                              </span>
                              <Badge status="processing" text="Carte prête au guichet" />
                            </div>

                            <Space wrap>
                              <Button
                                type="primary"
                                icon={<IdcardOutlined />}
                                onClick={() => setCardModalOpen(true)}
                                style={{ backgroundColor: "#0284c7" }}
                              >
                                Récupérer la carte d'abonnement
                              </Button>
                              <Button icon={<DollarOutlined />} onClick={() => setReceiptModalOpen(true)}>
                                Récupérer le reçu de paiement
                              </Button>
                              <Button icon={<PrinterOutlined />} onClick={() => setInvoiceModalOpen(true)}>
                                Récupérer la facture
                              </Button>
                            </Space>
                          </div>
                        ) : (
                          <Alert
                            message="Dossier en cours de traitement au guichet"
                            description="Dès que l'agent RRM aura validé le paiement et édité la carte RFID, vos documents de retrait apparaîtront ici."
                            type="info"
                            showIcon
                          />
                        )}
                      </Card>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* Modal: Carte d'abonnement */}
      <Modal
        title="Carte d'Abonnement de Stationnement RFID — RRM"
        open={cardModalOpen}
        onCancel={() => setCardModalOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimer l'Attestation Carte
          </Button>,
          <Button key="close" onClick={() => setCardModalOpen(false)}>
            Fermer
          </Button>,
        ]}
      >
        {trackedDemande && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <Card
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                color: "#ffffff",
                borderRadius: 16,
                maxWidth: 400,
                margin: "0 auto",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>RABAT RÉGION MOBILITÉ</strong>
                <Tag color="gold">RFID PASS</Tag>
              </div>
              <h3 style={{ color: "#ffffff", margin: "16px 0 4px" }}>{trackedDemande.clientNom}</h3>
              <div style={{ fontSize: 13, color: "#dbeafe" }}>Immatriculation: {trackedDemande.immatriculation}</div>
              <Divider style={{ borderColor: "rgba(255,255,255,0.2)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#bfdbfe" }}>
                <span>Parking: {trackedDemande.parkingNom}</span>
                <span>Réf: {trackedDemande.reference}</span>
              </div>
            </Card>
            <div style={{ marginTop: 16, color: "#475569", fontSize: 13 }}>
              Présentez ce reçu au guichet du <strong>{trackedDemande.parkingNom}</strong> pour retirer votre badge physique.
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Reçu de paiement */}
      <Modal
        title="Reçu de Paiement — Rabat Région Mobilité"
        open={receiptModalOpen}
        onCancel={() => setReceiptModalOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimer le Reçu
          </Button>,
          <Button key="close" onClick={() => setReceiptModalOpen(false)}>
            Fermer
          </Button>,
        ]}
      >
        {trackedDemande && (
          <div style={{ padding: 10 }}>
            <h3>Reçu de Paiement N° REC-{trackedDemande.id}</h3>
            <p><strong>Référence Demande:</strong> {trackedDemande.reference}</p>
            <p><strong>Client:</strong> {trackedDemande.clientNom}</p>
            <p><strong>Montant Régler:</strong> {trackedDemande.paiementInfo?.montant ?? 600} MAD</p>
            <p><strong>Mode de Paiement:</strong> {trackedDemande.paiementInfo?.modePaiement ?? "ESPECES"}</p>
            <p><strong>Date de Paiement:</strong> {trackedDemande.paiementInfo?.datePaiement ?? trackedDemande.dateCreation}</p>
            <p><strong>Validé Par:</strong> {trackedDemande.paiementInfo?.validePar ?? "Agent Guichet RRM"}</p>
          </div>
        )}
      </Modal>

      {/* Modal: Facture */}
      <Modal
        title="Facture d'Abonnement — Rabat Région Mobilité"
        open={invoiceModalOpen}
        onCancel={() => setInvoiceModalOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimer la Facture
          </Button>,
          <Button key="close" onClick={() => setInvoiceModalOpen(false)}>
            Fermer
          </Button>,
        ]}
      >
        {trackedDemande && (
          <div style={{ padding: 10 }}>
            <h2 style={{ color: "#0f172a", marginBottom: 4 }}>RABAT RÉGION MOBILITÉ</h2>
            <div style={{ color: "#64748b", marginBottom: 16 }}>Société de Développement Local — Rabat</div>
            <Divider style={{ margin: "8px 0 16px" }} />
            <p><strong>Facture N°:</strong> FAC-2026-{String(trackedDemande.id).padStart(5, "0")}</p>
            <p><strong>Client:</strong> {trackedDemande.clientNom}</p>
            <p><strong>Parking:</strong> {trackedDemande.parkingNom}</p>
            <Divider />
            <Row justify="space-between">
              <span>Montant Hors Taxe (HT):</span>
              <span>500.00 MAD</span>
            </Row>
            <Row justify="space-between">
              <span>TVA (20%):</span>
              <span>100.00 MAD</span>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row justify="space-between" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#16a34a" }}>
              <span>Total TTC Réglé:</span>
              <span>600.00 MAD</span>
            </Row>
          </div>
        )}
      </Modal>

      {/* Otp Verification Modal */}
      <OtpVerificationModal
        open={isOtpModalOpen}
        phone={formData.telephone || "0612345678"}
        email={formData.email || "client@example.ma"}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          handleFinalSubmit();
        }}
      />
    </div>
  );
}