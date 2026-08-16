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
  Space,
  Tag,
  Alert,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDemandesMock, addPublicDemandeMock } from "../../../api/demandesMock";
import { getPublicParkings } from "../../../api/parkings";
import { type DemandeListItem, type PublicDemandeInput } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { type TypeClient, type TypeVehicule, typeVehiculeLabels } from "../../../lib/enums";

const { Title, Text } = Typography;
const { Option } = Select;

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
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchText, setSearchText] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [typeDemande, setTypeDemande] = useState<"NOUVEL_ABONNEMENT" | "RENOUVELLEMENT">("NOUVEL_ABONNEMENT");
  const [typeClient, setTypeClient] = useState<TypeClient>("PARTICULIER");
  const [selectedParkingId, setSelectedParkingId] = useState<number>(1);

  const [form] = Form.useForm();

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

  // Filter demandes by tab and search text
  const filteredData = data.filter((item) => {
    // Tab filter
    if (activeTab === "SOUMISE" && item.statut !== "SOUMISE") return false;
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
  const countEnCours = data.filter((d) => d.statut === "EN_COURS").length;
  const countValidees = data.filter((d) => d.statut === "VALIDEE").length;

  const handleCreateDemande = async () => {
    const values = await form.validateFields();
    const fullInput: PublicDemandeInput = {
      ...values,
      typeDemande,
      typeClient,
      parkingId: selectedParkingId,
    };
    addDemandeMutation.mutate(fullInput);
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
              title="Dossiers En Cours de Validation"
              value={countEnCours}
              prefix={<FileTextOutlined style={{ color: "#2563eb" }} />}
              valueStyle={{ color: "#2563eb" }}
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
              <FileTextOutlined /> Consultation & Gestion des Demandes (Agent)
            </Title>
            <Text type="secondary">
              Gérez, vérifiez et validez les demandes d'abonnement saisies en ligne ou au guichet.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
          >
            Ajouter une Demande au Guichet
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
            { key: "EN_COURS", label: `En Cours de Traitement (${countEnCours})` },
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

      {/* Modal: Agent Direct Counter Request Entry */}
      <Modal
        title="Saisir une Nouvelle Demande au Guichet (Agent RRM)"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreateDemande}
        confirmLoading={addDemandeMutation.isPending}
        okText="Enregistrer la demande"
        cancelText="Annuler"
        width={720}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Type de Démarche" required>
                <Radio.Group value={typeDemande} onChange={(e) => setTypeDemande(e.target.value)}>
                  <Radio.Button value="NOUVEL_ABONNEMENT">Nouvel Abonnement</Radio.Button>
                  <Radio.Button value="RENOUVELLEMENT">Renouvellement</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Type de Client" required>
                <Radio.Group value={typeClient} onChange={(e) => setTypeClient(e.target.value)}>
                  <Radio.Button value="PARTICULIER">Particulier</Radio.Button>
                  <Radio.Button value="ENTREPRISE">Entreprise</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

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

          {/* Verification of Parking Capacity (Diagram Rule) */}
          <Alert
            message={
              hasCapacity
                ? `Vérification Capacité : ${currentParkingInfo.nom} — ${placesRestantes} places d'abonnés disponibles (${currentParkingInfo.abonnesActifs}/${currentParkingInfo.total} occupées)`
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
                <Form.Item name="nom" label="Nom Client" rules={[{ required: true }]}>
                  <Input placeholder="El Amrani" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
                  <Input placeholder="Karim" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="cin" label="CIN" rules={[{ required: true }]}>
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
                <Form.Item name="ice" label="ICE" rules={[{ required: true }]}>
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
              <Form.Item name="typeVehicule" label="Type de Véhicule" rules={[{ required: true }]} initialValue="VOITURE">
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
        </Form>
      </Modal>
    </div>
  );
}