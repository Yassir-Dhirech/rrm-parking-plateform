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
} from "@ant-design/icons";
import { getParkingsMock, mockParkings } from "../../../api/adminMock";
import type { Parking } from "../types";

const { Title, Text } = Typography;

export function ParkingsList() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: parkings = [], isLoading } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  // Create Parking Mutation
  const createMutation = useMutation({
    mutationFn: async (values: Partial<Parking>) => {
      mockParkings.push({
        id: Date.now(),
        code: values.code!,
        nom: values.nom!,
        adresse: values.adresse!,
        capaciteTotale: values.capaciteTotale!,
        placesReserveesAbonnes: values.placesReserveesAbonnes!,
        actif: true,
        verrouille: false,
        latitude: values.latitude ?? 34.02088,
        longitude: values.longitude ?? -6.84165,
      });
    },
    onSuccess: () => {
      message.success("Nouveau parking configuré avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
  });

  // Edit Parking Mutation
  const editMutation = useMutation({
    mutationFn: async (values: Partial<Parking>) => {
      if (!selectedParking) return;
      const target = mockParkings.find((p) => p.id === selectedParking.id);
      if (target) {
        Object.assign(target, values);
      }
    },
    onSuccess: () => {
      message.success("Informations du parking mises à jour !");
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsEditModalOpen(false);
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

  // Deactivate Parking Mutation (Alternative to deletion)
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
      title: "Nom du Parking",
      dataIndex: "nom",
      key: "nom",
      render: (nom: string, record: Parking) => (
        <div>
          <strong>{nom}</strong>
          {record.verrouille && (
            <div>
              <Tag color="volcano" icon={<LockOutlined />}>
                Verrouillé Maintenance
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Adresse",
      dataIndex: "adresse",
      key: "adresse",
    },
    {
      title: "Capacité Totale",
      dataIndex: "capaciteTotale",
      key: "capaciteTotale",
      render: (cap: number) => <span>{cap} places</span>,
    },
    {
      title: "Quota Abonnés",
      dataIndex: "placesReserveesAbonnes",
      key: "placesReserveesAbonnes",
      render: (quota: number) => <Tag color="cyan">{quota} places</Tag>,
    },
    {
      title: "Statut Exploitation",
      dataIndex: "actif",
      key: "actif",
      render: (actif: boolean, record: Parking) => {
        if (!actif) return <Tag color="red">Désactivé (Inactif)</Tag>;
        if (record.verrouille) return <Tag color="orange">Sous Maintenance</Tag>;
        return <Tag color="green">En Exploitation</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Parking) => (
        <Space wrap>
          <Tooltip title="Géolocalisation sur carte Google Maps">
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => handleOpenMap(record)}
            />
          </Tooltip>

          <Tooltip title="Modifier les informations">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          {record.verrouille ? (
            <Tooltip title="Déverrouiller le parking (Rétablir abonnements)">
              <Button
                size="small"
                type="primary"
                icon={<UnlockOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => {
                  setSelectedParking(record);
                  toggleLockMutation.mutate({ lock: false });
                }}
              >
                Déverrouiller
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Verrouiller pour maintenance (Bloquer abonnements)">
              <Button
                size="small"
                danger
                icon={<LockOutlined />}
                onClick={() => handleOpenLock(record)}
              >
                Verrouiller
              </Button>
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
        title="Ajouter un Nouveau Parking — Rabat Région Mobilité"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Valider & Créer"
        cancelText="Annuler"
      >
        <Form form={createForm} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Code Parking" rules={[{ required: true, message: "Code requis" }]}>
                <Input placeholder="PRK-AGD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nom" label="Nom du Parking" rules={[{ required: true, message: "Nom requis" }]}>
                <Input placeholder="Parking Agdal Gare" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse" label="Adresse Physique" rules={[{ required: true }]}>
            <Input placeholder="Avenue Hajj Ahmed Balafrej, Rabat" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capaciteTotale" label="Capacité Totale" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} placeholder="450" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="placesReserveesAbonnes" label="Quota Places Abonnés" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} placeholder="150" />
              </Form.Item>
            </Col>
          </Row>

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
        </Form>
      </Modal>

      {/* Modal 2: Modifier les Informations d'un Parking */}
      <Modal
        title={`Modifier le Parking: ${selectedParking?.nom}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={editMutation.isPending}
        okText="Enregistrer les modifications"
        cancelText="Annuler"
      >
        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Code Parking" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="adresse" label="Adresse" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capaciteTotale" label="Capacité Totale" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="placesReserveesAbonnes" label="Quota Abonnés" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
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