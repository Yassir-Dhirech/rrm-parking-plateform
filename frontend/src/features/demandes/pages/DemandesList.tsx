import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tabs,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Radio,
  message,
  Tag,
  Alert,
  Row,
  Col,
  Statistic,
  Space,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  DollarOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDemandesMock,
  addPublicDemandeMock,
  searchSubscriptionsForRenewalMock,
  addRenouvellementDirectMock,
  type RenewalSubscriber,
  type DirectRenewalInput,
} from "../../../api/demandesMock";
import { getPublicParkings } from "../../../api/parkings";
import { type DemandeListItem, type PublicDemandeInput, type PaymentInfoInput } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { type TypeClient, type TypeVehicule, typeVehiculeLabels } from "../../../lib/enums";

const { Title, Text } = Typography;
const { Option } = Select;

// Formules tarifaires identiques au formulaire client public
const FORFAITS_OPTIONS = [
  { id: 1, title: "Pass Permanent (24h / 7j)", priceTTC: 600, badge: "Accès 24/7" },
  { id: 2, title: "Pass Journée (08:00 - 20:00)", priceTTC: 420, badge: "Diurne" },
  { id: 3, title: "Pass Nuit (19:00 - 08:00)", priceTTC: 300, badge: "Nocturne" },
  { id: 4, title: "Abonnement Corporate (Flotte)", priceTTC: 5400, badge: "Entreprises" },
  { id: 5, title: "Pass Deux-Roues / Moto", priceTTC: 200, badge: "Deux-roues" },
];

// Parking capacity metadata according to diagram constraint
const PARKING_CAPACITY: Record<number, { nom: string; total: number; abonnesActifs: number }> = {
  1: { nom: "Parking Agdal Gare", total: 450, abonnesActifs: 150 },
  2: { nom: "Parking Hassan II", total: 300, abonnesActifs: 100 },
  3: { nom: "Parking Bab El Had", total: 200, abonnesActifs: 50 },
  4: { nom: "Parking Chellah", total: 250, abonnesActifs: 80 },
  5: { nom: "Parking Ibn Sina", total: 180, abonnesActifs: 40 },
};

export function DemandesList() {
  const navigate = useNavigate();
  const { role, userName } = useAuth();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [modalTab, setModalTab] = useState<"NEW" | "RENEWAL">("NEW");
  const [searchText, setSearchText] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  // New Demand State
  const [typeClient, setTypeClient] = useState<TypeClient>("PARTICULIER");
  const [selectedParkingId, setSelectedParkingId] = useState<number>(1);
  const [selectedForfaitId, setSelectedForfaitId] = useState<number>(1);

  // Renewal Search State
  const [renewalSearchQuery, setRenewalSearchQuery] = useState<string>("");
  const [renewalResults, setRenewalResults] = useState<RenewalSubscriber[]>([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState<RenewalSubscriber | null>(null);
  const [isSearchingRenewal, setIsSearchingRenewal] = useState<boolean>(false);

  const [form] = Form.useForm();
  const [renewalForm] = Form.useForm();
  const renewalPaymentMode = Form.useWatch("modePaiement", renewalForm) ?? "ESPECES";

  const { data = [], isLoading } = useQuery({
    queryKey: ["demandes"],
    queryFn: getDemandesMock,
  });

  const { data: parkings } = useQuery({
    queryKey: ["public-parkings"],
    queryFn: getPublicParkings,
  });

  const addDemandeMutation = useMutation({
    mutationFn: (input: PublicDemandeInput) => addPublicDemandeMock(input),
    onSuccess: (res) => {
      message.success(`Demande enregistrée au guichet avec succès (Réf: ${res.reference})`);
      setModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
    onError: () => {
      message.error("Erreur lors de l'enregistrement de la demande.");
    },
  });

  const renewalMutation = useMutation({
    mutationFn: (input: DirectRenewalInput) => addRenouvellementDirectMock(input),
    onSuccess: (res) => {
      message.success(`Renouvellement effectué et abonnement prolongé avec succès ! (Réf: ${res.reference})`);
      setModalOpen(false);
      renewalForm.resetFields();
      setSelectedSubscriber(null);
      setRenewalResults([]);
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
    onError: () => {
      message.error("Erreur lors du renouvellement.");
    },
  });

  const handleSearchSubscribers = async () => {
    if (!renewalSearchQuery.trim()) {
      message.warning("Veuillez saisir un CIN, Nom, Immatriculation ou N° de carte");
      return;
    }
    setIsSearchingRenewal(true);
    try {
      const results = await searchSubscriptionsForRenewalMock(renewalSearchQuery);
      setRenewalResults(results);
      if (results.length === 0) {
        message.info("Aucun abonnement correspondant trouvé.");
      }
    } finally {
      setIsSearchingRenewal(false);
    }
  };

  // Filter demandes by tab and search text
  const filteredData = data.filter((item) => {
    // Tab filter
    if (activeTab === "SOUMISE" && item.statut !== "SOUMISE") return false;
    if (activeTab === "PAIEMENT_ENREGISTRE" && item.statut !== "PAIEMENT_ENREGISTRE") return false;
    if (activeTab === "EN_COURS" && item.statut !== "EN_COURS") return false;
    if (activeTab === "VALIDEE" && item.statut !== "VALIDEE") return false;
    if (activeTab === "REJETEE" && item.statut !== "REJETEE") return false;

    // Search text filter (Reference, Client, Parking)
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchRef = item.reference.toLowerCase().includes(q);
      const matchClient = item.clientNom.toLowerCase().includes(q);
      const matchParking = item.parkingNom.toLowerCase().includes(q);
      return matchRef || matchClient || matchParking;
    }

    return true;
  });

  const countSoumises = data.filter((d) => d.statut === "SOUMISE").length;
  const countPaiementEnregistre = data.filter((d) => d.statut === "PAIEMENT_ENREGISTRE").length;
  const countValidees = data.filter((d) => d.statut === "VALIDEE").length;

  const handleCreateDemande = async () => {
    const values = await form.validateFields();
    const forfaitObj = FORFAITS_OPTIONS.find((f) => f.id === selectedForfaitId);
    const fullInput: PublicDemandeInput = {
      ...values,
      typeDemande: "NOUVEL_ABONNEMENT",
      typeClient,
      parkingId: selectedParkingId,
      forfaitId: selectedForfaitId,
      forfaitNom: forfaitObj?.title,
    };
    addDemandeMutation.mutate(fullInput);
  };

  const handleCreateRenewal = async () => {
    if (!selectedSubscriber) {
      message.error("Veuillez sélectionner un abonné à renouveler.");
      return;
    }
    const payValues: PaymentInfoInput = await renewalForm.validateFields();
    renewalMutation.mutate({
      subscriberId: selectedSubscriber.id,
      paymentInfo: payValues,
      actorName: `${userName ?? "Utilisateur"} (${role})`,
    });
  };

  const currentParkingInfo = PARKING_CAPACITY[selectedParkingId] || {
    nom: "Parking Sélectionné",
    total: 300,
    abonnesActifs: 90,
  };
  const placesRestantes = currentParkingInfo.total - currentParkingInfo.abonnesActifs;
  const hasCapacity = placesRestantes > 0;

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{ref}</Tag>,
    },
    {
      title: "Type",
      dataIndex: "typeDemande",
      key: "typeDemande",
      render: (value: string) => (
        <Tag color={value === "NOUVEL_ABONNEMENT" ? "purple" : "cyan"}>
          {value === "NOUVEL_ABONNEMENT" ? "Nouvel abonnement" : "Renouvellement"}
        </Tag>
      ),
    },
    {
      title: "Client / Souscripteur",
      dataIndex: "clientNom",
      key: "clientNom",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
    },
    {
      title: "Statut Traitement",
      dataIndex: "statut",
      key: "statut",
      render: (statut: DemandeListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    {
      title: "Date Soumission",
      dataIndex: "dateCreation",
      key: "dateCreation",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top Counters Summary */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderColor: "#e2e8f0" }}>
            <Statistic
              title="Demandes Soumises (En Attente Guichet)"
              value={countSoumises}
              prefix={<ClockCircleOutlined style={{ color: "#d97706" }} />}
              valueStyle={{ color: "#d97706" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderColor: "#e2e8f0" }}>
            <Statistic
              title="Paiements Enregistrés (À Valider Superviseur)"
              value={countPaiementEnregistre}
              prefix={<FileTextOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ color: "#0284c7" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderColor: "#e2e8f0" }}>
            <Statistic
              title="Demandes Validées & Payées"
              value={countValidees}
              prefix={<CheckCircleOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Demandes Card */}
      <Card style={{ borderRadius: 10, borderColor: "#cbd5e1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <FileTextOutlined /> Consultation & Gestion des Demandes
            </Title>
            <Text type="secondary">
              Gérez les encaissements guichet (Agent) et la validation de conformité des dossiers (Superviseur).
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
          >
            Nouvelle Demande / Renouvellement
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Rechercher par référence, nom client, immatriculation ou parking..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 450 }}
            allowClear
          />
        </div>

        {/* Tab Filter Navigation */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "ALL", label: `Toutes les Demandes (${data.length})` },
            { key: "SOUMISE", label: `En Attente de Paiement (${countSoumises})` },
            { key: "PAIEMENT_ENREGISTRE", label: `Paiement Enregistré (${countPaiementEnregistre})` },
            { key: "VALIDEE", label: `Validées (${countValidees})` },
            { key: "REJETEE", label: "Rejetées" },
          ]}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => navigate(`${basePath}/demandes/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Modal Guichet : Nouvelle Demande ou Renouvellement Direct */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined style={{ color: "#2563eb" }} />
            <span>Guichet : Saisie de Demande ou Renouvellement</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={780}
        destroyOnClose
      >
        <Tabs
          activeKey={modalTab}
          onChange={(key) => setModalTab(key as "NEW" | "RENEWAL")}
          items={[
            {
              key: "NEW",
              label: (
                <span>
                  <PlusOutlined /> 1. Nouvelle Demande (Nouveau Client)
                </span>
              ),
              children: (
                <Form form={form} layout="vertical" initialValues={{ typeVehicule: "VOITURE" }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Type de Client" required>
                        <Radio.Group value={typeClient} onChange={(e) => setTypeClient(e.target.value)}>
                          <Radio.Button value="PARTICULIER">Particulier</Radio.Button>
                          <Radio.Button value="ENTREPRISE">Entreprise</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Parking Rabat Concerné" required>
                        <Select
                          value={selectedParkingId}
                          onChange={(val) => setSelectedParkingId(val)}
                          placeholder="Sélectionnez un parking"
                        >
                          {parkings?.map((p) => (
                            <Option key={p.id} value={p.id}>
                              📍 {p.nom} ({p.code})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Choix de Formule Tarifaire (Même que le formulaire client) */}
                  <Form.Item label="Formule Tarifaire (Formulaire Client Identique)" required>
                    <Select
                      value={selectedForfaitId}
                      onChange={(val) => setSelectedForfaitId(val)}
                    >
                      {FORFAITS_OPTIONS.map((f) => (
                        <Option key={f.id} value={f.id}>
                          🏷️ {f.title} — {f.priceTTC.toLocaleString("fr-FR")} MAD / mois ({f.badge})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Alert
                    message={
                      hasCapacity
                        ? `Capacité Parking : ${currentParkingInfo.nom} — ${placesRestantes} places d'abonnés disponibles (${currentParkingInfo.abonnesActifs}/${currentParkingInfo.total} occupées)`
                        : `Alerte Capacité : ${currentParkingInfo.nom} a atteint sa capacité maximale d'abonnements !`
                    }
                    type={hasCapacity ? "success" : "error"}
                    showIcon
                    icon={<SafetyCertificateOutlined />}
                    style={{ marginBottom: 16 }}
                  />

                  {typeClient === "PARTICULIER" ? (
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="nom" label="Nom Client" rules={[{ required: true, message: "Nom requis" }]}>
                          <Input placeholder="El Amrani" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: "Prénom requis" }]}>
                          <Input placeholder="Karim" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="cin" label="CIN Client" rules={[{ required: true, message: "CIN requis" }]}>
                          <Input placeholder="AB123456" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Row gutter={16}>
                      <Col span={14}>
                        <Form.Item name="raisonSociale" label="Raison Sociale" rules={[{ required: true }]}>
                          <Input placeholder="Société Atlas Trans" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name="ice" label="ICE Entreprise" rules={[{ required: true }]}>
                          <Input placeholder="001234567" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="email" label="Email Contact" rules={[{ required: true, type: "email" }]}>
                        <Input placeholder="client@example.ma" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="telephone" label="Téléphone Mobile" rules={[{ required: true }]}>
                        <Input placeholder="0612345678" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="immatriculation" label="Immatriculation Véhicule" rules={[{ required: true }]}>
                        <Input placeholder="12345-A-6" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="typeVehicule" label="Type de Véhicule" rules={[{ required: true }]}>
                        <Select>
                          {(Object.keys(typeVehiculeLabels) as TypeVehicule[]).map((key) => (
                            <Option key={key} value={key}>
                              {typeVehiculeLabels[key]}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                      <Button onClick={() => setModalOpen(false)}>Annuler</Button>
                      <Button
                        type="primary"
                        onClick={handleCreateDemande}
                        loading={addDemandeMutation.isPending}
                        icon={<FileDoneOutlined />}
                        style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                      >
                        Enregistrer la Nouvelle Demande
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "RENEWAL",
              label: (
                <span>
                  <ReloadOutlined /> 2. Renouvellement d'Abonnement (Recherche Client)
                </span>
              ),
              children: (
                <div>
                  <Alert
                    type="info"
                    showIcon
                    icon={<ReloadOutlined />}
                    message="Procédure de Renouvellement Direct sans Deuxième Validation"
                    description="Recherchez l'abonné par CIN, Nom, Immatriculation ou N° de carte. Une fois le paiement encaissé, l'abonnement est automatiquement renouvelé et validé car le dossier client a déjà été approuvé préalablement."
                    style={{ marginBottom: 16 }}
                  />

                  {/* Barre de Recherche Abonné */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <Input
                      placeholder="Saisir CIN (ex: AB123456), Immatriculation (ex: 12345-A-6) ou Nom..."
                      prefix={<SearchOutlined />}
                      value={renewalSearchQuery}
                      onChange={(e) => setRenewalSearchQuery(e.target.value)}
                      onPressEnter={handleSearchSubscribers}
                      allowClear
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleSearchSubscribers}
                      loading={isSearchingRenewal}
                    >
                      Rechercher
                    </Button>
                  </div>

                  {/* Résultats de Recherche */}
                  {renewalResults.length > 0 && !selectedSubscriber && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      <Text type="secondary">Sélectionnez le dossier à renouveler :</Text>
                      {renewalResults.map((sub) => (
                        <Card
                          key={sub.id}
                          size="small"
                          hoverable
                          style={{
                            borderColor: "#cbd5e1",
                            borderLeft: sub.statut === "EXPIRE" ? "4px solid #d97706" : "4px solid #16a34a",
                          }}
                          onClick={() => {
                            setSelectedSubscriber(sub);
                            renewalForm.setFieldsValue({ montant: sub.montantMensuel, modePaiement: "ESPECES" });
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong>{sub.clientNom}</strong> ({sub.cin}) — <Tag color="blue">{sub.immatriculation}</Tag>
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                📍 {sub.parkingNom} | Formule: {sub.forfaitNom} | Carte: <code>{sub.numeroCarte}</code>
                              </div>
                            </div>
                            <Button type="primary" size="small" style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}>
                              Sélectionner
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Abonné Sélectionné & Formulaire de Règlement Direct */}
                  {selectedSubscriber && (
                    <div>
                      <Card
                        size="small"
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Abonnement Sélectionné pour Renouvellement</span>
                            <Button size="small" onClick={() => setSelectedSubscriber(null)}>
                              Changer de client
                            </Button>
                          </div>
                        }
                        style={{ marginBottom: 20, backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
                      >
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Text type="secondary">Client :</Text> <strong>{selectedSubscriber.clientNom}</strong> ({selectedSubscriber.cin})
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Immatriculation :</Text> <Tag color="cyan">{selectedSubscriber.immatriculation}</Tag>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Parking :</Text> {selectedSubscriber.parkingNom}
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Formule Actuelle :</Text> <strong>{selectedSubscriber.forfaitNom}</strong>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Paiement Mensuel :</Text> <strong style={{ color: "#15803d" }}>{selectedSubscriber.montantMensuel} MAD</strong>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Expiration Actuelle :</Text> <Tag color="orange">{selectedSubscriber.dateFinActuelle}</Tag>
                          </Col>
                        </Row>
                      </Card>

                      <Form form={renewalForm} layout="vertical" onFinish={handleCreateRenewal}>
                        <h4 style={{ marginBottom: 12, color: "#16a34a" }}>
                          <DollarOutlined /> Encaisser le Règlement & Valider le Renouvellement
                        </h4>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="modePaiement"
                              label="Mode d'Encaissement"
                              rules={[{ required: true, message: "Choisir un mode de paiement" }]}
                              initialValue="ESPECES"
                            >
                              <Select
                                options={[
                                  { label: "Espèces (Guichet)", value: "ESPECES" },
                                  { label: "Chèque Bancaire", value: "CHEQUE" },
                                  { label: "Virement Bancaire", value: "VIREMENT" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              name="montant"
                              label="Montant Réglé (MAD)"
                              rules={[{ required: true }]}
                            >
                              <InputNumber style={{ width: "100%" }} addonAfter="MAD" min={0} />
                            </Form.Item>
                          </Col>
                        </Row>

                        {renewalPaymentMode === "CHEQUE" && (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="numeroCheque" label="N° Chèque" rules={[{ required: true }]}>
                                <Input placeholder="Ex: CHQ-991203" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="banque" label="Banque Émettrice" rules={[{ required: true }]}>
                                <Input placeholder="Ex: Attijariwafa Bank" />
                              </Form.Item>
                            </Col>
                          </Row>
                        )}

                        {renewalPaymentMode === "VIREMENT" && (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="referenceVirement" label="Réf. Virement" rules={[{ required: true }]}>
                                <Input placeholder="Ex: VIR-2026-901" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="banque" label="Banque d'origine" rules={[{ required: true }]}>
                                <Input placeholder="Ex: CIH Bank" />
                              </Form.Item>
                            </Col>
                          </Row>
                        )}

                        <Form.Item name="remarques" label="Observations Renouvellement">
                          <Input.TextArea rows={2} placeholder="Remarques éventuelles sur le renouvellement..." />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                          <Space>
                            <Button onClick={() => setModalOpen(false)}>Annuler</Button>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={renewalMutation.isPending}
                              icon={<CheckCircleOutlined />}
                              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                            >
                              Confirmer le Paiement & Renouveler l'Abonnement
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}