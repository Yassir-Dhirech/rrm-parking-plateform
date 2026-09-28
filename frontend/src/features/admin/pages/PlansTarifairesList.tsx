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
  Alert,
  Row,
  Col,
  Tooltip,
  Popconfirm,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  EditOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  TagOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DeleteOutlined ,
} from "@ant-design/icons";
import { getAdminTarifs, deleteAdminTarif } from "../../../api/adminTarifsApi";
import { getAdminParkings } from "../../../api/adminParkingsApi";
;
import type { PlanTarifaire } from "../types";

const { Title, Text } = Typography;
const { Option } = Select;

const TYPE_ABONNEMENT_LABELS: Record<string, { label: string; color: string; defaultPlage: string }> = {
  PERMANENT_24_7: { label: "Permanent (24h / 7j)", color: "blue", defaultPlage: "24h / 7j" },
  JOUR_8H_20H: { label: "Jour (08:00 - 20:00)", color: "orange", defaultPlage: "08:00 - 20:00" },
  NUIT_19H_8H: { label: "Nuit (19:00 - 08:00)", color: "purple", defaultPlage: "19:00 - 08:00" },
  CORPORATE: { label: "Corporate (Entreprise)", color: "magenta", defaultPlage: "Sur mesure (Flotte)" },
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

    // 1. Tarifs réels depuis MySQL
  const { data: tarifs = [], isLoading } = useQuery({
    queryKey: ["admin_tarifs"],
    queryFn: getAdminTarifs,
  });

  // 2. Parkings réels depuis MySQL pour le menu de filtre
  const { data: parkings = [] } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getAdminParkings,
  });


    // Filtrer les tarifs par parking sélectionné (avec conversion Number pour éviter les incompatibilités)
  const filteredTarifs = tarifs.filter((t) => {
    if (selectedParkingFilter === "ALL") return true;
    return Number(t.parkingId) === Number(selectedParkingFilter);
  });


  
  const createMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      // Validation & confirmation
      return values;
    },
    onSuccess: () => {
      message.success("Tarif configuré pour le parking avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
  });

  // 2. Modification de Tarif
  const editMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      return values;
    },
    onSuccess: () => {
      message.success("Tarif du parking mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsEditModalOpen(false);
    },
  });

  // 3. Désactivation de Tarif
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      return true;
    },
    onSuccess: () => {
      message.info(`Le forfait ${selectedTarif?.libelle} a été désactivé.`);
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

    // Mutation de suppression définitive
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminTarif(id),
    onSuccess: (res) => {
      if (res.warning) {
        message.warning(res.message);
      } else {
        message.success("Tarif supprimé avec succès de la base de données !");
      }
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
    },
    onError: () => {
      message.error("Erreur lors de la suppression du tarif.");
    },
  });


    const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_: unknown, __: unknown, idx: number) => (
        <span style={{ fontWeight: 800, color: "#64748b", fontSize: "0.85rem" }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      title: "Parking",
      dataIndex: "parkingNom",
      key: "parkingNom",
      sorter: (a: PlanTarifaire, b: PlanTarifaire) => (a.parkingNom || "").localeCompare(b.parkingNom || ""),
      render: (nom?: string) => (
        <span style={{ fontWeight: 700, color: "#001E3D" }}>
          <EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />{nom || "Tous les Parkings"}
        </span>
      ),
    },
    {
      title: "Formule d'Abonnement",
      dataIndex: "libelle",
      key: "libelle",
      sorter: (a: PlanTarifaire, b: PlanTarifaire) => (a.libelle || "").localeCompare(b.libelle || ""),
      render: (libelle: string, record: PlanTarifaire) => {
        const info = TYPE_ABONNEMENT_LABELS[record.typeAbonnement] || { label: record.typeAbonnement, color: "blue" };
        return (
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{libelle}</div>
            <Tag color={info.color} style={{ fontSize: "10px", marginTop: 2 }}>{record.typeAbonnement}</Tag>
          </div>
        );
      },
    },
    
    
    {
      title: "Prix/mois TTC ",
      dataIndex: "tarifTTC",
      key: "tarifTTC",
      sorter: (a: PlanTarifaire, b: PlanTarifaire) => a.tarifTTC - b.tarifTTC,
      render: (v: number) => <strong style={{ color: "#0284c7", fontSize: "1.05rem" }}>{v?.toLocaleString("fr-FR")} MAD</strong>,
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
      title: "Actions Disponibles",
      key: "actions",
      width: 320,
      render: (_: unknown, record: PlanTarifaire) => (
        <Space wrap size="small">
          {/* Action 1 : Modifier le Prix */}
          <Tooltip title="Modifier le montant HT / TTC ou la formule">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              style={{ color: "#0284c7", borderColor: "#bae6fd" }}
            >
              Modifier
            </Button>
          </Tooltip>

          {/* Action 2 : Activer / Désactiver */}
          <Tooltip title={record.actif ? "Désactiver temporairement cette formule" : "Réactiver la formule"}>
            <Button
              size="small"
              danger={record.actif}
              icon={record.actif ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleOpenDeactivate(record)}
            >
              {record.actif ? "Désactiver" : "Activer"}
            </Button>
          </Tooltip>

          {/* Action 3 : Voir la Fiche Tarifaire Complète */}
          <Tooltip title="Voir les détails complets (TVA, date de début, règles)">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: `Fiche Tarifaire : ${record.libelle}`,
                  width: 500,
                  content: (
                    <div style={{ marginTop: 12, lineHeight: 1.8 }}>
                      <p><strong>Parking :</strong> {record.parkingNom}</p>
                      <p><strong>Formule :</strong> {record.typeAbonnement}</p>
                      <p><strong>Créneau :</strong> {record.plageHoraire}</p>
                      <p><strong>Engagement :</strong> {record.dureeMois} mois</p>
                      <p><strong>Prix Mensuel HT :</strong> {record.tarifHT} MAD</p>
                      <p><strong>Taux TVA :</strong> 20.00 %</p>
                      <p><strong>Prix Mensuel TTC :</strong> <span style={{ color: "#0284c7", fontWeight: 700 }}>{record.tarifTTC} MAD</span></p>
                      <p><strong>Statut :</strong> <Tag color={record.actif ? "green" : "red"}>{record.actif ? "Actif (Ouvert)" : "Désactivé"}</Tag></p>
                    </div>
                  ),
                });
              }}
            >
              Détails
            </Button>
          </Tooltip>
                    {/* Action : Supprimer définitivement de la base */}
          <Popconfirm
            title="Supprimer ce tarif ?"
            description="Êtes-vous sûr de vouloir supprimer définitivement ce tarif de la base de données ?"
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Tooltip title="Supprimer définitivement de MySQL">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                Supprimer
              </Button>
            </Tooltip>
          </Popconfirm>

          
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
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
          Total : <strong>{filteredTarifs.length}</strong> tarifs enregistrés dans la base de données
        </span>
      </div>
<Table
        columns={columns}
        dataSource={filteredTarifs}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        scroll={{ y: 550, x: "max-content" }}
      />
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