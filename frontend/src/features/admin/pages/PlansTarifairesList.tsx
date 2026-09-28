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
  Upload,
  Divider,
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
  DeleteOutlined, 
  UploadOutlined,
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Pop-up Suppression avec motif
  const [selectedTarif, setSelectedTarif] = useState<PlanTarifaire | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null); // Pièce jointe attachée


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
                             {/* Action 4 : Supprimer définitivement (Ouvre la Pop-up avec motif et pièce jointe) */}
          <Tooltip title="Supprimer avec justification et PV officiel">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedTarif(record);
                setDeleteReason("");
                setAttachedDocName(null);
                setIsDeleteModalOpen(true);
              }}
            >
              Supprimer
            </Button>
          </Tooltip>

          
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
           {/* -------------------------------------------------------------
          MODAL 1 : AJOUTER UN TARIF (AVEC MOTIF & DOCUMENT ATTACHÉ)
          ------------------------------------------------------------- */}
      <Modal
        title="Ajouter / Configurer un Tarif Parking"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setAttachedDocName(null);
        }}
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
            <InputNumber style={{ width: "100%" }} size="large" min={0} step={50} placeholder="400" />
          </Form.Item>

          <Divider style={{ margin: "14px 0 10px 0" }}>Justification Réglementaire</Divider>

          <Form.Item
            name="motifCreation"
            label={<span className="font-bold text-xs">Motif officiel / Réf. Arrêté communal *</span>}
            rules={[{ required: true, message: "Veuillez renseigner le motif officiel" }]}
          >
            <Input.TextArea rows={2} placeholder="Ex: Délibération du Conseil de la Ville de Rabat n°45 du 12/09/2026..." />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-xs">Document officiel attaché (Optionnel)</span>}>
            <Upload
              beforeUpload={(file) => {
                message.success(`Document joint : ${file.name}`);
                setAttachedDocName(file.name);
                return false;
              }}
              maxCount={1}
              onRemove={() => setAttachedDocName(null)}
            >
              <Button icon={<UploadOutlined />}>
                {attachedDocName ? `Fichier : ${attachedDocName}` : "Joindre l'Arrêté / PV officiel (PDF, Image)"}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* -------------------------------------------------------------
          MODAL 2 : MODIFIER LE PRIX (AVEC MOTIF & DOCUMENT ATTACHÉ)
          ------------------------------------------------------------- */}
      <Modal
        title={`Modifier le Prix : ${selectedTarif?.libelle} (${selectedTarif?.parkingNom})`}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setAttachedDocName(null);
        }}
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
            <InputNumber style={{ width: "100%" }} size="large" min={0} step={50} />
          </Form.Item>

          <Divider style={{ margin: "14px 0 10px 0" }}>Justification de la Révision</Divider>

          <Form.Item
            name="motifModification"
            label={<span className="font-bold text-xs">Motif officiel justifiant la révision *</span>}
            rules={[{ required: true, message: "Le motif est obligatoire pour toute modification" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Ex: Décision de révision tarifaire annuelle, harmonisation grille 2026..."
            />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-xs">Pièce justificative attachée (PDF / Image)</span>}>
            <Upload
              beforeUpload={(file) => {
                message.success(`Document joint : ${file.name}`);
                setAttachedDocName(file.name);
                return false;
              }}
              maxCount={1}
              onRemove={() => setAttachedDocName(null)}
            >
              <Button icon={<UploadOutlined />}>
                {attachedDocName ? `Fichier : ${attachedDocName}` : "Joindre l'Arrêté / PV de modification"}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* -------------------------------------------------------------
          MODAL 3 : DÉSACTIVATION / SUSPENSION DU TARIF
          ------------------------------------------------------------- */}
      <Modal
        title="Désactivation du Forfait Tarifaire"
        open={isDeactivateModalOpen}
        onCancel={() => {
          setIsDeactivateModalOpen(false);
          setAttachedDocName(null);
        }}
        onOk={() => {
          if (!deactivateReason.trim()) {
            message.error("Veuillez renseigner le motif officiel de désactivation.");
            return;
          }
          deactivateMutation.mutate();
        }}
        confirmLoading={deactivateMutation.isPending}
        okText="Désactiver le Forfait"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
      >
        <Alert
          message="Protection des Abonnés Actuels :"
          description="Ce forfait sera suspendu pour les nouvelles souscriptions tout en préservant les contrats en cours."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label={<span className="font-bold text-xs">Motif officiel de suspension *</span>} required>
            <Input.TextArea
              rows={2}
              placeholder="Ex: Travaux d'infrastructure, fermeture temporaire d'un étage, réajustement..."
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-xs">Document justificatif (Optionnel)</span>}>
            <Upload
              beforeUpload={(file) => {
                message.success(`Document joint : ${file.name}`);
                setAttachedDocName(file.name);
                return false;
              }}
              maxCount={1}
              onRemove={() => setAttachedDocName(null)}
            >
              <Button icon={<UploadOutlined />}>
                {attachedDocName ? `Fichier : ${attachedDocName}` : "Joindre la Note de service / Décision"}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* -------------------------------------------------------------
          MODAL 4 : SUPPRESSION DÉFINITIVE DE LA BASE DE DONNÉES
          ------------------------------------------------------------- */}
      <Modal
        title={
          <div style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <DeleteOutlined /> Suppression Définitive du Tarif
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setAttachedDocName(null);
        }}
        onOk={() => {
          if (!deleteReason.trim()) {
            message.error("Veuillez renseigner le motif officiel de suppression.");
            return;
          }
          if (selectedTarif) {
            deleteMutation.mutate(selectedTarif.id);
            setIsDeleteModalOpen(false);
          }
        }}
        confirmLoading={deleteMutation.isPending}
        okText="Supprimer Définitivement de MySQL"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
      >
        <Alert
          message="Attention : Suppression Irréversible"
          description={`Vous vous apprêtez à supprimer définitivement le tarif "${selectedTarif?.libelle}" (${selectedTarif?.parkingNom}) de la base de données.`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item label={<span className="font-bold text-xs">Motif officiel de suppression de la grille *</span>} required>
            <Input.TextArea
              rows={2}
              placeholder="Ex: Arrêté d'abrogation tarifaire n°2026-88, radiation définitive suite à restructuration..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<span className="font-bold text-xs">Pièce jointe officielle (PV / Arrêté de radiation)</span>}>
            <Upload
              beforeUpload={(file) => {
                message.success(`Document joint : ${file.name}`);
                setAttachedDocName(file.name);
                return false;
              }}
              maxCount={1}
              onRemove={() => setAttachedDocName(null)}
            >
              <Button icon={<UploadOutlined />}>
                {attachedDocName ? `Fichier : ${attachedDocName}` : "Joindre l'Arrêté de radiation (PDF, Image)"}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

    </Card>
  );
}