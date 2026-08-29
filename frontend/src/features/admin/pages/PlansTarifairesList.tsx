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
  Select,
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
  StopOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { getTarifsMock, mockTarifs, getParkingsMock } from "../../../api/adminMock";
import type { PlanTarifaire } from "../types";

const { Title, Text } = Typography;
const { Option } = Select;

const TYPE_ABONNEMENT_LABELS: Record<string, { label: string; color: string; defaultPlage: string }> = {
  PERMANENT_24_7: { label: "Permanent (24h / 7j)", color: "blue", defaultPlage: "24h / 7j" },
  JOUR_8H_20H: { label: "Jour (08:00 - 20:00)", color: "orange", defaultPlage: "08:00 - 20:00" },
  NUIT_19H_8H: { label: "Nuit (19:00 - 08:00)", color: "purple", defaultPlage: "19:00 - 08:00" },
  CORPORATE: { label: "Corporate (Entreprise)", color: "magenta", defaultPlage: "Sur mesure (Flotte)" },
  DEUX_ROUES: { label: "Deux-Roues / Moto", color: "cyan", defaultPlage: "24h / 7j" },
  PARTICULIER: { label: "Particulier Standard", color: "geekblue", defaultPlage: "24h / 7j" },
};

export function PlansTarifairesList() {
  const queryClient = useQueryClient();
  const [selectedParkingFilter, setSelectedParkingFilter] = useState<number | "ALL">("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<PlanTarifaire | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const { data: tarifs = [], isLoading } = useQuery({
    queryKey: ["admin_tarifs"],
    queryFn: getTarifsMock,
  });

  const { data: parkings = [] } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
  });

  // Filter tariffs by selected parking
  const filteredTarifs = tarifs.filter((t) => {
    if (selectedParkingFilter === "ALL") return true;
    return t.parkingId === selectedParkingFilter;
  });

  // Create Plan Tarifaire Mutation
  const createMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      const tarifHT = values.tarifHT || 0;
      const tarifTTC = Math.round(tarifHT * 1.2); // TVA 20%

      const parkingObj = parkings.find((p) => p.id === values.parkingId);
      const typeInfo = TYPE_ABONNEMENT_LABELS[values.typeAbonnement || "PERMANENT_24_7"];

      mockTarifs.push({
        id: Date.now(),
        libelle: values.libelle || typeInfo?.label || "Offre Tarifaire",
        typeAbonnement: values.typeAbonnement || "PERMANENT_24_7",
        plageHoraire: values.plageHoraire || typeInfo?.defaultPlage || "24h / 7j",
        dureeMois: values.dureeMois || 1,
        tarifHT,
        tarifTTC,
        parkingId: values.parkingId,
        parkingNom: parkingObj ? parkingObj.nom : "Tous les parkings",
        actif: true,
      });
    },
    onSuccess: () => {
      message.success("Tarif configuré pour le parking avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
  });

  // Edit Plan Tarifaire Mutation
  const editMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      if (!selectedTarif) return;
      const target = mockTarifs.find((t) => t.id === selectedTarif.id);
      if (target) {
        const tarifHT = values.tarifHT ?? target.tarifHT;
        const tarifTTC = Math.round(tarifHT * 1.2);
        Object.assign(target, {
          ...values,
          tarifHT,
          tarifTTC,
        });
      }
    },
    onSuccess: () => {
      message.success("Tarif du parking mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsEditModalOpen(false);
    },
  });

  // Deactivate Plan Tarifaire Mutation (Safe Deactivation to prevent CASCADE deletion)
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTarif) return;
      const target = mockTarifs.find((t) => t.id === selectedTarif.id);
      if (target) {
        target.actif = false;
      }
    },
    onSuccess: () => {
      message.info(`Le forfait ${selectedTarif?.libelle} a été désactivé sans suppression physique.`);
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsDeactivateModalOpen(false);
      setDeactivateReason("");
    },
  });

  const handleOpenEdit = (record: PlanTarifaire) => {
    setSelectedTarif(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const handleOpenDeactivate = (record: PlanTarifaire) => {
    setSelectedTarif(record);
    setIsDeactivateModalOpen(true);
  };

  const columns = [
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
      render: (nom?: string) => (
        <span style={{ fontWeight: 600, color: "#0f172a" }}>
          <EnvironmentOutlined style={{ marginRight: 6 }} />{nom || "Tous les Parkings"}
        </span>
      ),
    },
    {
      title: "Type d'Abonnement",
      dataIndex: "typeAbonnement",
      key: "typeAbonnement",
      render: (type: string) => {
        const info = TYPE_ABONNEMENT_LABELS[type] || { label: type, color: "blue" };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "Plage Horaire / Créneau",
      dataIndex: "plageHoraire",
      key: "plageHoraire",
      render: (plage?: string) => (
        <span>
          <ClockCircleOutlined style={{ color: "#64748b", marginRight: 6 }} />
          {plage || "24h / 7j"}
        </span>
      ),
    },
    {
      title: "Durée",
      dataIndex: "dureeMois",
      key: "dureeMois",
      render: (m: number) => <Tag color="cyan">{m} mois</Tag>,
    },
    {
      title: "Prix HT (MAD)",
      dataIndex: "tarifHT",
      key: "tarifHT",
      render: (v: number) => `${v?.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Prix TTC (TVA 20%)",
      dataIndex: "tarifTTC",
      key: "tarifTTC",
      render: (v: number) => <strong style={{ color: "#0369a1", fontSize: "1.05rem" }}>{v?.toLocaleString("fr-FR")} MAD</strong>,
    },
    {
      title: "Statut Grille",
      dataIndex: "actif",
      key: "actif",
      render: (actif: boolean) => (
        <Tag color={actif ? "green" : "red"}>{actif ? "Actif (Applicable)" : "Désactivé"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PlanTarifaire) => (
        <Space wrap>
          <Tooltip title="Modifier le tarif spécifique de ce parking">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            >
              Modifier Prix
            </Button>
          </Tooltip>

          {record.actif && (
            <Tooltip title="Désactiver le tarif (pour éviter risque de suppression en cascade)">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleOpenDeactivate(record)}
              >
                Désactiver
              </Button>
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
          Ajouter / Configurer un Tarif Parking
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: "0 0 4px 0" }}>
          <TagsOutlined /> Grille Tarifaire Spécifique par Parking (Responsable)
        </Title>
        <Text type="secondary">
          Chaque parking possède ses propres tarifs selon le type d'abonnement (24h/7j, Jour 8h-20h, Nuit 19h-8h, Corporate entreprise, etc.).
        </Text>
      </div>

      {/* Filter by Parking Bar */}
      <div style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 20, border: "1px solid #e2e8f0" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              <FilterOutlined /> Filtrer les Tarifs par Parking :
            </div>
            <Select
              style={{ width: "100%" }}
              size="large"
              value={selectedParkingFilter}
              onChange={(val) => setSelectedParkingFilter(val)}
            >
              <Option value="ALL"><EnvironmentOutlined style={{ marginRight: 6 }} />Tous les Parkings de Rabat</Option>
              {parkings.map((p) => (
                <Option key={p.id} value={p.id}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />{p.nom} ({p.code})
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <Table columns={columns} dataSource={filteredTarifs} loading={isLoading} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: "max-content" }} />

      {/* Modal 1: Ajouter / Configurer un Tarif pour un Parking */}
      <Modal
        title="Ajouter un Tarif Spécifique pour un Parking"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Valider & Enregistrer"
        cancelText="Annuler"
      >
        <Form form={createForm} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="parkingId" label="Parking Concerné" rules={[{ required: true, message: "Veuillez choisir un parking" }]}>
            <Select placeholder="Sélectionnez un parking Rabat" size="large">
              {parkings.map((p) => (
                <Option key={p.id} value={p.id}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />{p.nom} ({p.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="typeAbonnement" label="Type d'Abonnement" rules={[{ required: true, message: "Type requis" }]}>
            <Select
              size="large"
              onChange={(val) => {
                const info = TYPE_ABONNEMENT_LABELS[val];
                if (info) {
                  createForm.setFieldValue("libelle", info.label);
                  createForm.setFieldValue("plageHoraire", info.defaultPlage);
                }
              }}
            >
              <Option value="PERMANENT_24_7"><ClockCircleOutlined style={{ marginRight: 6 }} />Permanent 24h / 7j</Option>
              <Option value="JOUR_8H_20H"><ClockCircleOutlined style={{ marginRight: 6 }} />Journée (08:00 - 20:00)</Option>
              <Option value="NUIT_19H_8H"><ClockCircleOutlined style={{ marginRight: 6 }} />Nuit (19:00 - 08:00)</Option>
              <Option value="CORPORATE"><TagOutlined style={{ marginRight: 6 }} />Corporate (Abonnement Flotte Entreprise)</Option>
              <Option value="DEUX_ROUES"><TagOutlined style={{ marginRight: 6 }} />Deux-Roues / Moto</Option>
            </Select>
          </Form.Item>

          <Form.Item name="libelle" label="Libellé du Forfait" rules={[{ required: true }]}>
            <Input placeholder="Ex: Abonnement Journée 8h-20h Agdal" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="plageHoraire" label="Plage Horaire / Créneau">
                <Input placeholder="08:00 - 20:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dureeMois" label="Durée (Mois)" rules={[{ required: true }]} initialValue={1}>
                <InputNumber style={{ width: "100%" }} min={1} max={36} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tarifHT" label="Tarif Mensuel HT (MAD HT)" rules={[{ required: true, message: "Tarif requis" }]}>
            <InputNumber style={{ width: "100%" }} size="large" min={0} step={50} placeholder="400" addonAfter="MAD HT" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Modifier le Prix d'un Forfait */}
      <Modal
        title={`Modifier le Prix: ${selectedTarif?.libelle} (${selectedTarif?.parkingNom})`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={editMutation.isPending}
        okText="Enregistrer les modifications"
        cancelText="Annuler"
      >
        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          <Form.Item name="libelle" label="Libellé du Forfait" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="plageHoraire" label="Plage Horaire">
            <Input />
          </Form.Item>

          <Form.Item name="tarifHT" label="Nouveau Tarif HT (MAD HT)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} size="large" min={0} step={50} addonAfter="MAD HT" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 3: Désactivation d'un Forfait */}
      <Modal
        title="Désactivation du Forfait Tarifaire"
        open={isDeactivateModalOpen}
        onCancel={() => setIsDeactivateModalOpen(false)}
        onOk={() => deactivateMutation.mutate()}
        confirmLoading={deactivateMutation.isPending}
        okText="Désactiver le Forfait"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
      >
        <Alert
          message="Protection Contre les Suppressions en Cascade :"
          description="Ce forfait sera désactivé pour ce parking sans suppression en base de données, préservant les abonnements en cours."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label="Motif de désactivation du forfait" required>
            <Input.TextArea
              rows={3}
              placeholder="Raison de la désactivation pour ce parking..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}