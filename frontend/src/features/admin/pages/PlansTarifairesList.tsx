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
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, EditOutlined, StopOutlined, TagsOutlined } from "@ant-design/icons";
import { getTarifsMock, mockTarifs, getParkingsMock } from "../../../api/adminMock";
import type { PlanTarifaire } from "../types";

const { Title, Text } = Typography;
const { Option } = Select;

export function PlansTarifairesList() {
  const queryClient = useQueryClient();
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

  // Create Plan Tarifaire Mutation
  const createMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      const tarifHT = values.tarifHT || 0;
      const tarifTTC = Math.round(tarifHT * 1.2); // TVA 20%

      const parkingObj = parkings.find((p) => p.id === values.parkingId);

      mockTarifs.push({
        id: Date.now(),
        libelle: values.libelle!,
        typeAbonnement: values.typeAbonnement!,
        dureeMois: values.dureeMois!,
        tarifHT,
        tarifTTC,
        parkingId: values.parkingId,
        parkingNom: parkingObj ? parkingObj.nom : "Tous les parkings",
        actif: true,
      });
    },
    onSuccess: () => {
      message.success("Nouveau plan tarifaire créé avec succès !");
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
      message.success("Tarif et caractéristiques du forfait mis à jour !");
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
      title: "Libellé du Forfait",
      dataIndex: "libelle",
      key: "libelle",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Type d'Abonnement",
      dataIndex: "typeAbonnement",
      key: "typeAbonnement",
      render: (type: PlanTarifaire["typeAbonnement"]) => (
        <Tag color={type === "CORPORATE" ? "purple" : "blue"}>
          {type === "CORPORATE" ? "Corporate (Flotte)" : "Particulier (Individuel)"}
        </Tag>
      ),
    },
    {
      title: "Durée",
      dataIndex: "dureeMois",
      key: "dureeMois",
      render: (m: number) => <Tag color="cyan">{m} mois</Tag>,
    },
    {
      title: "Tarif HT (MAD)",
      dataIndex: "tarifHT",
      key: "tarifHT",
      render: (v: number) => `${v?.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Tarif TTC (TVA 20%)",
      dataIndex: "tarifTTC",
      key: "tarifTTC",
      render: (v: number) => <strong style={{ color: "#0369a1" }}>{v?.toLocaleString("fr-FR")} MAD</strong>,
    },
    {
      title: "Parking Assigné",
      dataIndex: "parkingNom",
      key: "parkingNom",
      render: (nom?: string) => <span>{nom || "Tous les Parkings"}</span>,
    },
    {
      title: "Statut Grille",
      dataIndex: "actif",
      key: "actif",
      render: (actif: boolean) => (
        <Tag color={actif ? "green" : "red"}>{actif ? "Actif (Proposé)" : "Désactivé"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: PlanTarifaire) => (
        <Space wrap>
          <Tooltip title="Modifier le prix ou les conditions du forfait">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            >
              Modifier Prix
            </Button>
          </Tooltip>

          {record.actif && (
            <Tooltip title="Désactiver le forfait (pour éviter risque de suppression en cascade)">
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
          Ajouter un Forfait Tarifaire
        </Button>
      }
    >
      <Title level={4} style={{ margin: "0 0 4px 0" }}>
        <TagsOutlined /> Gestion des Grilles Tarifaires & Forfaits (Responsable)
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Consultez et configurez la tarification des abonnements par parking. Désactivez les offres obsolètes sans risque de suppression en cascade.
      </Text>

      <Table columns={columns} dataSource={tarifs} loading={isLoading} rowKey="id" pagination={{ pageSize: 8 }} />

      {/* Modal 1: Ajouter un Forfait */}
      <Modal
        title="Ajouter un Forfait Tarifaire — RRM"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Créer le Forfait"
        cancelText="Annuler"
      >
        <Form form={createForm} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="libelle" label="Libellé de l'Offre" rules={[{ required: true, message: "Libellé requis" }]}>
            <Input placeholder="Ex: Pass Trimestriel Agdal Gare" />
          </Form.Item>

          <Form.Item name="typeAbonnement" label="Type d'Abonnement" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "PARTICULIER", label: "Particulier (Individuel)" },
                { value: "CORPORATE", label: "Corporate (Flotte Entreprise)" },
              ]}
            />
          </Form.Item>

          <Form.Item name="dureeMois" label="Durée de souscription (en mois)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} max={36} placeholder="Ex: 1, 3, 6, 12" />
          </Form.Item>

          <Form.Item name="tarifHT" label="Tarif Hors Taxe (MAD HT)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={50} placeholder="500" addonAfter="MAD HT" />
          </Form.Item>

          <Form.Item name="parkingId" label="Parking Appliqué (Optionnel)">
            <Select placeholder="Applicable à tous les parkings par défaut" allowClear>
              {parkings.map((p) => (
                <Option key={p.id} value={p.id}>
                  📍 {p.nom} ({p.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Modifier le Prix d'un Forfait */}
      <Modal
        title={`Modifier le Forfait: ${selectedTarif?.libelle}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={editMutation.isPending}
        okText="Enregistrer les modifications"
        cancelText="Annuler"
      >
        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          <Form.Item name="libelle" label="Libellé de l'Offre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tarifHT" label="Nouveau Tarif HT (MAD HT)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={50} addonAfter="MAD HT" />
          </Form.Item>
          <Form.Item name="dureeMois" label="Durée (Mois)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} max={36} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 3: Désactivation d'un Forfait (Diagram Note: Pas de suppression en cascade) */}
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
          description="Selon les règles de gestion RRM, ce forfait sera désactivé sans suppression physique en base de données, évitant ainsi tout risque d'altération des abonnements existants."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label="Motif de désactivation du forfait" required>
            <Input.TextArea
              rows={3}
              placeholder="Raison de la désactivation (ex: Offre remplacée par la nouvelle grille tarifaire 2026)..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}