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
  ReloadOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPublicParkings } from "../../../api/parkings";
import { submitPublicDemande } from "../../../api/demandes";
import { searchDemandeByReferenceMock } from "../../../api/demandesMock";
import { type PublicDemandeInput, type DemandeDetail } from "../types";
import { type TypeClient, type TypeVehicule, typeVehiculeLabels } from "../../../lib/enums";
import { PublicNavbar } from "../../../components/ui/PublicNavbar";

const { Option } = Select;

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
  const [typeDemande, setTypeDemande] = useState<"NOUVEL_ABONNEMENT" | "RENOUVELLEMENT">("NOUVEL_ABONNEMENT");
  const [typeClient, setTypeClient] = useState<TypeClient>("PARTICULIER");
  const [selectedForfait, setSelectedForfait] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<PublicDemandeInput>>({});
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  // Tracking state
  const [searchRef, setSearchRef] = useState<string>("");
  const [trackedDemande, setTrackedDemande] = useState<DemandeDetail | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
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
    const fullData: PublicDemandeInput = {
      ...formData,
      forfaitId: selectedForfait,
      forfaitNom: forfaitObj?.title,
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          color: "#ffffff",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Tag color="cyan" style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, marginBottom: 12 }}>
            <QrcodeOutlined /> Service Abonné sans Compte — Scanner Code QR
          </Tag>
          <h1 style={{ color: "#ffffff", fontSize: "2rem", fontWeight: 700, margin: "10px 0" }}>
            Plateforme d'Abonnement des Parkings de Rabat
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", maxWidth: 680, margin: "0 auto" }}>
            Remplissez votre demande ou renouvellement d'abonnement en ligne sans créer de compte.
            Suivez l'état de votre dossier et téléchargez vos documents.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "-20px auto 0", padding: "0 16px" }}>
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
                        {/* Type de Demande Radio Selector */}
                        <div
                          style={{
                            backgroundColor: "#f1f5f9",
                            padding: 16,
                            borderRadius: 10,
                            marginBottom: 24,
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#334155", marginBottom: 8 }}>
                            Sélectionnez le type de démarche :
                          </div>
                          <Radio.Group
                            value={typeDemande}
                            onChange={(e) => setTypeDemande(e.target.value)}
                            buttonStyle="solid"
                            size="large"
                          >
                            <Radio.Button value="NOUVEL_ABONNEMENT">
                              <FileTextOutlined /> Nouvel Abonnement
                            </Radio.Button>
                            <Radio.Button value="RENOUVELLEMENT">
                              <ReloadOutlined /> Renouvellement d'Abonnement
                            </Radio.Button>
                          </Radio.Group>
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
                            <Alert
                              message={
                                typeDemande === "NOUVEL_ABONNEMENT"
                                  ? "Formulaire de première souscription — Informations du souscripteur"
                                  : "Formulaire de renouvellement — Veuillez renseigner les coordonnées du titulaire"
                              }
                              type="info"
                              showIcon
                              style={{ marginBottom: 20 }}
                            />

                            {typeDemande === "RENOUVELLEMENT" && (
                              <Form.Item
                                name="ancienNumeroCarte"
                                label="N° de Carte / Ancien Contrat"
                                rules={[{ required: true, message: "Veuillez saisir votre n° de carte d'abonné" }]}
                              >
                                <Input prefix={<IdcardOutlined />} placeholder="Ex: CRT-2025-004812" />
                              </Form.Item>
                            )}

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

                            <div style={{ textAlign: "right", marginTop: 12 }}>
                              <Button type="primary" size="large" onClick={goNextFromStep1}>
                                Continuer <ArrowRightOutlined />
                              </Button>
                            </div>
                          </Form>
                        )}

                        {/* Step 1: Information Véhicule */}
                        {currentStep === 1 && (
                          <Form form={step2Form} layout="vertical">
                            <Alert
                              message="Transmettre les caractéristiques du véhicule à abonner"
                              type="info"
                              showIcon
                              style={{ marginBottom: 20 }}
                            />

                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  name="immatriculation"
                                  label="Immatriculation du véhicule"
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
                              <Button size="large" onClick={() => setCurrentStep(0)}>
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
                              <Form.Item label="Parking de Rabat Souhaité" required>
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
                                          {f.priceTTC.toLocaleString("fr-FR")} MAD <span style={{ fontSize: 12, fontWeight: 400, color: "#475569" }}>TTC / {f.duree}</span>
                                        </div>
                                      </Card>
                                    </Col>
                                  );
                                })}
                              </Row>
                            </Form>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                              <Button size="large" onClick={() => setCurrentStep(1)}>
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
                                  <Tag color="purple">
                                    {typeDemande === "NOUVEL_ABONNEMENT" ? "Nouvel Abonnement" : "Renouvellement"}
                                  </Tag>
                                </Col>
                                <Col span={12}>
                                  <strong>Client:</strong>{" "}
                                  {typeClient === "PARTICULIER" ? `${formData.prenom} ${formData.nom} (CIN: ${formData.cin})` : `${formData.raisonSociale} (ICE: ${formData.ice})`}
                                </Col>
                                <Col span={12}>
                                  <strong>Email & Tél:</strong> {formData.email} | {formData.telephone}
                                </Col>
                                <Col span={12}>
                                  <strong>Véhicule:</strong> {formData.immatriculation} ({typeVehiculeLabels[formData.typeVehicule || "VOITURE"]})
                                </Col>
                                <Col span={12}>
                                  <strong>Parking Choisis:</strong>{" "}
                                  {parkings?.find((p) => p.id === formData.parkingId)?.nom || "Parking Agdal Gare"}
                                </Col>
                                <Col span={12}>
                                  <strong>Forfait Sélectionné:</strong>{" "}
                                  <Tag color="green">
                                    {FORFAITS_OPTIONS.find((f) => f.id === selectedForfait)?.title} (
                                    {FORFAITS_OPTIONS.find((f) => f.id === selectedForfait)?.priceTTC} MAD TTC)
                                  </Tag>
                                </Col>
                              </Row>
                            </Card>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                              <Button size="large" onClick={() => setCurrentStep(2)}>
                                Modifier les infos
                              </Button>
                              <Button
                                type="primary"
                                size="large"
                                loading={mutation.isPending}
                                onClick={handleFinalSubmit}
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                              >
                                Envoyer le formulaire
                              </Button>
                            </div>
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
    </div>
  );
}