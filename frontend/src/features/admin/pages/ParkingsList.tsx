import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Tooltip,
  Alert,
  Row,
  Col,
  Progress,
  Divider,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  EnvironmentOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
  PieChartOutlined,
  UserOutlined,
  BankOutlined,
  TagOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { getParkingsMock, mockParkings, recalculerQuotasParking } from "../../../api/adminMock";
import type { Parking } from "../types";

const { Title, Text } = Typography;

export function ParkingsList() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [quotaForm] = Form.useForm();

  // Temporary state for live preview in Quota Modal
  const [modalCapacite, setModalCapacite] = useState<number>(450);
  const [modalPctTickets, setModalPctTickets] = useState<number>(50);
  const [modalPctAbonnements, setModalPctAbonnements] = useState<number>(50);
  const [modalPctCorporate, setModalPctCorporate] = useState<number>(60);
  const [modalPctParticulier, setModalPctParticulier] = useState<number>(40);

  const { data: parkings = [], isLoading } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  // Create Parking Mutation
  const createMutation = useMutation({
    mutationFn: async (values: Partial<Parking>) => {
      const newP = recalculerQuotasParking({
        id: Date.now(),
        code: values.code!,
        nom: values.nom!,
        adresse: values.adresse!,
        capaciteTotale: values.capaciteTotale || 450,
        placesReserveesAbonnes: 225,
        pourcentageTickets: values.pourcentageTickets || 50,
        pourcentageAbonnements: values.pourcentageAbonnements || 50,
        pourcentageCorporate: values.pourcentageCorporate || 60,
        pourcentageParticulier: values.pourcentageParticulier || 40,
        quotaTickets: 225,
        quotaAbonnementsTotal: 225,
        quotaCorporate: 135,
        quotaParticulier: 90,
        abonnementsParticulierActifs: 0,
        abonnementsCorporateActifs: 0,
        placesRestantesParticulier: 90,
        placesRestantesCorporate: 135,
        actif: true,
        verrouille: false,
        latitude: values.latitude ?? 34.02088,
        longitude: values.longitude ?? -6.84165,
      });
      mockParkings.push(newP);
    },
    onSuccess: () => {
      message.success("Nouveau parking configuré avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
  });

  // Edit Parking Basic Info
  const editMutation = useMutation({
    mutationFn: async (values: Partial<Parking>) => {
      if (!selectedParking) return;
      const targetIndex = mockParkings.findIndex((p) => p.id === selectedParking.id);
      if (targetIndex !== -1) {
        Object.assign(mockParkings[targetIndex], values);
        mockParkings[targetIndex] = recalculerQuotasParking(mockParkings[targetIndex]);
      }
    },
    onSuccess: () => {
      message.success("Informations du parking mises à jour !");
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsEditModalOpen(false);
    },
  });

  // Edit Quotas & Percentages Mutation (Responsable)
  const quotaMutation = useMutation({
    mutationFn: async (values: {
      capaciteTotale: number;
      pourcentageTickets: number;
      pourcentageAbonnements: number;
      pourcentageCorporate: number;
      pourcentageParticulier: number;
    }) => {
      if (!selectedParking) return;
      const targetIndex = mockParkings.findIndex((p) => p.id === selectedParking.id);
      if (targetIndex !== -1) {
        const p = mockParkings[targetIndex];
        p.capaciteTotale = values.capaciteTotale;
        p.pourcentageTickets = values.pourcentageTickets;
        p.pourcentageAbonnements = values.pourcentageAbonnements;
        p.pourcentageCorporate = values.pourcentageCorporate;
        p.pourcentageParticulier = values.pourcentageParticulier;
        mockParkings[targetIndex] = recalculerQuotasParking(p);
      }
    },
    onSuccess: () => {
      message.success(`Quotas et pourcentages du parking ${selectedParking?.nom} mis à jour par le Responsable !`);
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsQuotaModalOpen(false);
    },
  });

  // Lock / Unlock Parking Mutation
  const toggleLockMutation = useMutation({
    mutationFn: async ({ lock, reason }: { lock: boolean; reason?: string }) => {
      if (!selectedParking) return;
      const target = mockParkings.find((p) => p.id === selectedParking.id);
      if (target) {
        target.verrouille = lock;
        target.motifVerrouillage = lock ? reason : undefined;
      }
    },
    onSuccess: (_, variables) => {
      if (variables.lock) {
        message.warning(`Parking ${selectedParking?.nom} verrouillé pour maintenance. Les souscriptions sont suspendues.`);
      } else {
        message.success(`Parking ${selectedParking?.nom} déverrouillé et disponible aux abonnements !`);
      }
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsLockModalOpen(false);
      setLockReason("");
    },
  });

  // Deactivate Parking Mutation
  const deactivateMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!selectedParking) return;
      const target = mockParkings.find((p) => p.id === selectedParking.id);
      if (target) {
        target.actif = false;
        target.motifDesactivation = reason;
      }
    },
    onSuccess: () => {
      message.info(`Parking ${selectedParking?.nom} désactivé.`);
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsDeactivateModalOpen(false);
      setDeactivateReason("");
    },
  });

  const handleOpenEdit = (record: Parking) => {
    setSelectedParking(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleOpenQuotasModal = (record: Parking) => {
    setSelectedParking(record);
    setModalCapacite(record.capaciteTotale || 450);
    setModalPctTickets(record.pourcentageTickets || 50);
    setModalPctAbonnements(record.pourcentageAbonnements || 50);
    setModalPctCorporate(record.pourcentageCorporate || 60);
    setModalPctParticulier(record.pourcentageParticulier || 40);

    quotaForm.setFieldsValue({
      capaciteTotale: record.capaciteTotale || 450,
      pourcentageTickets: record.pourcentageTickets || 50,
      pourcentageAbonnements: record.pourcentageAbonnements || 50,
      pourcentageCorporate: record.pourcentageCorporate || 60,
      pourcentageParticulier: record.pourcentageParticulier || 40,
    });
    setIsQuotaModalOpen(true);
  };

  const handleOpenLock = (record: Parking) => {
    setSelectedParking(record);
    setLockReason(record.motifVerrouillage || "");
    setIsLockModalOpen(true);
  };

  const handleOpenMap = (record: Parking) => {
    setSelectedParking(record);
    setIsMapModalOpen(true);
  };

  const handleOpenDeactivate = (record: Parking) => {
    setSelectedParking(record);
    setIsDeactivateModalOpen(true);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: "Parking & Adresse",
      dataIndex: "nom",
      key: "nom",
      render: (nom: string, record: Parking) => (
        <div>
          <strong>{nom}</strong>
          <div style={{ fontSize: 12, color: "#64748b" }}>{record.adresse}</div>
          {record.verrouille && (
            <Tag color="volcano" icon={<LockOutlined />} style={{ marginTop: 4 }}>
              Verrouillé Maintenance
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Capacité Totale & Tickets",
      key: "capaciteTickets",
      render: (_: unknown, record: Parking) => (
        <div>
          <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 13 }}>{record.capaciteTotale} places</Tag>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            <TagOutlined style={{ marginRight: 4 }} /> Tickets (Rotation): <strong>{record.pourcentageTickets}%</strong> ({record.quotaTickets} pl.)
          </div>
        </div>
      ),
    },
    {
      title: "Quota Abonnements Corporate (Flottes)",
      key: "quotaCorporate",
      render: (_: unknown, record: Parking) => {
        const pctOccup = Math.round((record.abonnementsCorporateActifs / (record.quotaCorporate || 1)) * 100);
        return (
          <div style={{ minWidth: 160 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: "#7e22ce" }}>
                <BankOutlined /> Corporate ({record.pourcentageCorporate}%):
              </span>
              <span>{record.quotaCorporate} pl.</span>
            </div>
            <Progress percent={pctOccup} size="small" status={pctOccup > 90 ? "exception" : "normal"} strokeColor="#9333ea" />
            <div style={{ fontSize: 11.5, display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ color: "#475569" }}>Inscrits: <strong>{record.abonnementsCorporateActifs}</strong></span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>Dispo: {record.placesRestantesCorporate}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Quota Abonnements Particuliers",
      key: "quotaParticulier",
      render: (_: unknown, record: Parking) => {
        const pctOccup = Math.round((record.abonnementsParticulierActifs / (record.quotaParticulier || 1)) * 100);
        return (
          <div style={{ minWidth: 160 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: "#0284c7" }}>
                <UserOutlined /> Particuliers ({record.pourcentageParticulier}%):
              </span>
              <span>{record.quotaParticulier} pl.</span>
            </div>
            <Progress percent={pctOccup} size="small" status={pctOccup > 90 ? "exception" : "normal"} strokeColor="#0284c7" />
            <div style={{ fontSize: 11.5, display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ color: "#475569" }}>Inscrits: <strong>{record.abonnementsParticulierActifs}</strong></span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>Dispo: {record.placesRestantesParticulier}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Statut",
      dataIndex: "actif",
      key: "actif",
      render: (actif: boolean, record: Parking) => {
        if (!actif) return <Tag color="red">Désactivé</Tag>;
        if (record.verrouille) return <Tag color="orange">Sous Maintenance</Tag>;
        return <Tag color="green">En Exploitation</Tag>;
      },
    },
    {
      title: "Actions (Responsable)",
      key: "actions",
      render: (_: unknown, record: Parking) => (
        <Space wrap>
          <Tooltip title="Configurer la répartition % & quotas de places (Responsable)">
            <Button
              size="small"
              type="primary"
              icon={<PieChartOutlined />}
              onClick={() => handleOpenQuotasModal(record)}
              style={{ backgroundColor: "#0284c7" }}
            >
              Quotas %
            </Button>
          </Tooltip>

          <Tooltip title="Géolocalisation sur carte Google Maps">
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => handleOpenMap(record)}
            />
          </Tooltip>

          <Tooltip title="Modifier les informations du parking">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          {record.verrouille ? (
            <Tooltip title="Déverrouiller le parking">
              <Button
                size="small"
                type="primary"
                icon={<UnlockOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => {
                  setSelectedParking(record);
                  toggleLockMutation.mutate({ lock: false });
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Verrouiller pour maintenance">
              <Button
                size="small"
                danger
                icon={<LockOutlined />}
                onClick={() => handleOpenLock(record)}
              />
            </Tooltip>
          )}

          {record.actif && (
            <Tooltip title="Désactiver le parking (Alternative de suppression)">
              <Button
                size="small"
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleOpenDeactivate(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ backgroundColor: "#0284c7", borderColor: "#0284c7" }}
        >
          Ajouter un Nouveau Parking
        </Button>
      }
    >
      <Title level={4} style={{ margin: "0 0 4px 0" }}>
        <SafetyCertificateOutlined /> Gestion des Parkings & Stationnement (Responsable)
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Gérez les parkings de Rabat, configurez les quotas d'abonnés, géolocalisez sur Google Maps et verrouillez en cas de maintenance.
      </Text>

      <Table columns={columns} dataSource={parkings} loading={isLoading} rowKey="id" pagination={{ pageSize: 8 }} />

      {/* Modal 1: Ajouter un Parking */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ color: "#0284c7" }} /> Ajouter un Nouveau Parking — Rabat Région Mobilité
          </span>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Valider & Créer le Parking"
        cancelText="Annuler"
        width={680}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            capaciteTotale: 450,
            pourcentageTickets: 50,
            pourcentageAbonnements: 50,
            pourcentageCorporate: 60,
            pourcentageParticulier: 40,
            latitude: 34.02088,
            longitude: -6.84165,
          }}
          onFinish={(v) => createMutation.mutate(v)}
        >
          <Divider titlePlacement="left" style={{ margin: "4px 0 16px" }}>
            <EnvironmentOutlined style={{ color: "#0284c7" }} /> 1. Identification & Localisation GPS
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Code Identifiant Unique" rules={[{ required: true, message: "Code requis (ex: PRK-AGD)" }]}>
                <Input placeholder="ex: PRK-AGD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nom" label="Nom Officiel du Parking" rules={[{ required: true, message: "Nom requis" }]}>
                <Input placeholder="ex: Parking Agdal Gare" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse" label="Adresse Physique Complète" rules={[{ required: true, message: "Adresse requise" }]}>
            <Input placeholder="ex: Avenue Hajj Ahmed Balafrej, Rabat" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude GPS (Google Maps)">
                <InputNumber style={{ width: "100%" }} step={0.0001} placeholder="34.02088" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude GPS (Google Maps)">
                <InputNumber style={{ width: "100%" }} step={0.0001} placeholder="-6.84165" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: "16px 0 16px" }}>
            <PieChartOutlined style={{ color: "#0284c7" }} /> 2. Capacité Globale & Quotas d'Attribution
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="capaciteTotale" label="Capacité Globale" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={10} max={5000} placeholder="450" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageTickets" label="% Réservé Tickets " rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageAbonnements" label="% Réservé Abonnements Total" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageCorporate" label="% Quota Abonnements Corporate" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageParticulier" label="% Quota Abonnements Particuliers" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Quotas & Pourcentages (Responsable) */}
      <Modal
        title={
          <span>
            <PieChartOutlined style={{ color: "#0284c7" }} /> Configuration des Quotas & Pourcentages: {selectedParking?.nom}
          </span>
        }
        open={isQuotaModalOpen}
        onCancel={() => setIsQuotaModalOpen(false)}
        onOk={() => quotaForm.submit()}
        confirmLoading={quotaMutation.isPending}
        okText="Enregistrer & Recalculer les Quotas"
        cancelText="Annuler"
        width={650}
      >
        <Alert
          message="Répartition Stratégique de la Capacité"
          description="Fixez les pourcentages d'attribution du parking. Chaque nouvelle souscription décrémente automatiquement le nombre de places restantes."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Form
          form={quotaForm}
          layout="vertical"
          onFinish={(v) => quotaMutation.mutate(v)}
          onValuesChange={(_, allValues) => {
            if (allValues.capaciteTotale) setModalCapacite(allValues.capaciteTotale);
            if (allValues.pourcentageTickets !== undefined) {
              setModalPctTickets(allValues.pourcentageTickets);
              setModalPctAbonnements(100 - allValues.pourcentageTickets);
              quotaForm.setFieldsValue({ pourcentageAbonnements: 100 - allValues.pourcentageTickets });
            }
            if (allValues.pourcentageCorporate !== undefined) {
              setModalPctCorporate(allValues.pourcentageCorporate);
              setModalPctParticulier(100 - allValues.pourcentageCorporate);
              quotaForm.setFieldsValue({ pourcentageParticulier: 100 - allValues.pourcentageCorporate });
            }
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="capaciteTotale"
                label="Capacité Globale du Parking (Nombre Total de Places)"
                rules={[{ required: true, message: "Capacité requise" }]}
              >
                <InputNumber style={{ width: "100%" }} min={10} max={5000} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: "12px 0 16px" }}>
            1. Répartition Globale (Tickets vs Abonnements)
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageTickets" label="% Reserve Tickets" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageAbonnements" label="% Réservé Abonnements Total" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: "12px 0 16px" }}>
            2. Sous-Répartition des Abonnements (Corporate vs Particulier)
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageCorporate" label="% Quota Abonnements Corporate" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageParticulier" label="% Quota Abonnements Particuliers" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* Dynamic Preview Box inside Modal */}
          {(() => {
            const quotaTicketsCalc = Math.round(modalCapacite * (modalPctTickets / 100));
            const quotaAbonnementCalc = Math.round(modalCapacite * (modalPctAbonnements / 100));
            const quotaCorpCalc = Math.round(quotaAbonnementCalc * (modalPctCorporate / 100));
            const quotaPartCalc = Math.round(quotaAbonnementCalc * (modalPctParticulier / 100));

            return (
              <div style={{ padding: 16, backgroundColor: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd", marginTop: 16 }}>
                <Text style={{ fontWeight: 700, color: "#0369a1", display: "block", marginBottom: 8 }}>
                  <BarChartOutlined style={{ marginRight: 6 }} /> Prévisualisation des Quotas Calculés ({modalCapacite} places au total) :
                </Text>
                <Row gutter={[12, 12]}>
                  <Col span={8}>
                    <div style={{ fontSize: 12, color: "#334155" }}><TagOutlined style={{ marginRight: 4 }} /> Tickets (Rotation):</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0284c7" }}>{quotaTicketsCalc} places</div>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: 12, color: "#6b21a8" }}><BankOutlined style={{ marginRight: 4 }} /> Corporate ({modalPctCorporate}%):</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#7e22ce" }}>{quotaCorpCalc} places</div>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: 12, color: "#166534" }}><UserOutlined style={{ marginRight: 4 }} /> Particuliers ({modalPctParticulier}%):</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#15803d" }}>{quotaPartCalc} places</div>
                  </Col>
                </Row>
              </div>
            );
          })()}
        </Form>
      </Modal>

      {/* Modal 2: Modifier les Informations d'un Parking */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ color: "#0284c7" }} /> Modifier les Caractéristiques du Parking: {selectedParking?.nom}
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={editMutation.isPending}
        okText="Enregistrer les modifications"
        cancelText="Annuler"
        width={680}
      >
        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          <Divider titlePlacement="left" style={{ margin: "4px 0 16px" }}>
            <EnvironmentOutlined style={{ color: "#0284c7" }} /> 1. Identification & Localisation GPS
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Code Identifiant Unique" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nom" label="Nom Officiel du Parking" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse" label="Adresse Physique Complète" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude GPS (Google Maps)">
                <InputNumber style={{ width: "100%" }} step={0.0001} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude GPS (Google Maps)">
                <InputNumber style={{ width: "100%" }} step={0.0001} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: "16px 0 16px" }}>
            <PieChartOutlined style={{ color: "#0284c7" }} /> 2. Capacité Globale & Quotas d'Attribution
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="capaciteTotale" label="Capacité Globale (Places)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={10} max={5000} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageTickets" label="% Reserve Tickets (Rotation Passagers)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageAbonnements" label="% Réservé Abonnements Total" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageCorporate" label="% Quota Abonnements Corporate (Flottes)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageParticulier" label="% Quota Abonnements Particuliers" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal 3: Géolocalisation Google Maps */}
      <Modal
        title={
          <span>
            <EnvironmentOutlined style={{ color: "#0284c7" }} /> Géolocalisation: {selectedParking?.nom}
          </span>
        }
        open={isMapModalOpen}
        onCancel={() => setIsMapModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsMapModalOpen(false)}>
            Fermer
          </Button>,
        ]}
        width={650}
      >
        {selectedParking && (
          <div>
            <p><strong>Adresse:</strong> {selectedParking.adresse}</p>
            <p><strong>Coordonnées GPS:</strong> Latitude {selectedParking.latitude ?? 34.02088}, Longitude {selectedParking.longitude ?? -6.84165}</p>
            <div
              style={{
                width: "100%",
                height: 300,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f1f5f9",
              }}
            >
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${selectedParking.latitude ?? 34.02088},${selectedParking.longitude ?? -6.84165}&z=15&output=embed`}
                allowFullScreen
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Verrouillage pour Maintenance */}
      <Modal
        title="Verrouillage d'un Parking (Maintenance & Clôture Temporaire)"
        open={isLockModalOpen}
        onCancel={() => setIsLockModalOpen(false)}
        onOk={() => toggleLockMutation.mutate({ lock: true, reason: lockReason })}
        confirmLoading={toggleLockMutation.isPending}
        okText="Verrouiller le parking"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
      >
        <Alert
          message="Conséquence du verrouillage :"
          description="Aucun nouvel abonnement ou renouvellement ne pourra être créé pour ce parking tant qu'il restera verrouillé."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label="Motif & Durée de la Maintenance (ex: Travaux 3 mois)" required>
            <Input.TextArea
              rows={3}
              placeholder="Ex: Le parking Bab El Had est sous maintenance pour les prochains 3 mois. Abonnements temporairement bloqués."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 5: Désactivation (Alternative de suppression) */}
      <Modal
        title="Désactivation Définitive du Parking"
        open={isDeactivateModalOpen}
        onCancel={() => setIsDeactivateModalOpen(false)}
        onOk={() => deactivateMutation.mutate(deactivateReason)}
        confirmLoading={deactivateMutation.isPending}
        okText="Confirmer la désactivation"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
      >
        <Alert
          message="Alternative de suppression pour préserver l'historique :"
          description="Le parking sera désactivé sans suppression physique en base de données pour éviter la perte d'historique."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label="Motif de clôture / désactivation" required>
            <Input.TextArea
              rows={3}
              placeholder="Spécifiez la raison de la fermeture du parking..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}