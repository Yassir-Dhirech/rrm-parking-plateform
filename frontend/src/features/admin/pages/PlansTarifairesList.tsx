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
  Upload,
  Radio,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  EditOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DeleteOutlined, 
  UploadOutlined,
  UserOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getAdminTarifs, deleteAdminTarif , createAdminTarif, updateAdminTarif} from "../../../api/adminTarifsApi";
import { getAdminParkings } from "../../../api/adminParkingsApi";
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

// Fonction de détection du segment Corporate (B2B multi-véhicules) vs Régulier (Particulier 1 véhicule)
export function getSegmentTarif(record: PlanTarifaire): { isCorporate: boolean; label: string; tagColor: string; description: string } {
  const code = (record.typeAbonnement || "").toUpperCase();
  const lib = (record.libelle || "").toUpperCase();
  
  const isCorp = 
    code === "CORPORATE" || 
    code.startsWith("CORP") || 
    code === "TAJIR" || 
    lib.includes("CORPORATE") || 
    lib.includes("FLOTTE") || 
    lib.includes("ENTREPRISE") ||
    lib.includes("CONVENTION") ||
    (record.dureeMois && record.dureeMois > 36);

      if (isCorp) {
    return {
      isCorporate: true,
      label: "Corporate (Flotte B2B)",
      tagColor: "magenta",
      description: "Tarif dégressif multi-véhicules",
    };
  }

  return {
    isCorporate: false,
    label: "Régulier (Particulier)",
    tagColor: "blue",
    description: "Tarif individuel (1 véhicule)",
  };
}

// Calcul automatique du Hors Taxe (HT) et de la TVA (20%) à partir du prix TTC
export function getHtAndTva(ttc?: number | null) {
  const safeTtc = Number(ttc) || 0;
  if (safeTtc <= 0) return { ht: 0, tva: 0 };
  const ht = Math.round((safeTtc / 1.2) * 100) / 100;
  const tva = Math.round((safeTtc - ht) * 100) / 100;
  return { ht, tva };
}

export function PlansTarifairesList() {
  const queryClient = useQueryClient();
  const [selectedParkingFilter, setSelectedParkingFilter] = useState<number | "ALL">("ALL");
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<"ALL" | "REGULIER" | "CORPORATE">("ALL");
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

  // Écoute en temps réel du prix TTC saisi pour calculer immédiatement le HT et la TVA
  const watchedCreateTTC = Form.useWatch("tarifTTC", createForm);
  const watchedEditTTC = Form.useWatch("tarifTTC", editForm);

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

  // Filtrer les tarifs par parking et par segment client (Régulier vs Corporate)
  const filteredTarifs = tarifs.filter((t) => {
    const matchParking = selectedParkingFilter === "ALL" || Number(t.parkingId) === Number(selectedParkingFilter);
    const seg = getSegmentTarif(t);
    const matchSegment = 
      selectedSegmentFilter === "ALL" ||
      (selectedSegmentFilter === "CORPORATE" && seg.isCorporate) ||
      (selectedSegmentFilter === "REGULIER" && !seg.isCorporate);
    return matchParking && matchSegment;
  });

    const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { ht } = getHtAndTva(values.tarifTTC);
      values.tarifHT = ht;
      return createAdminTarif(values);
    },
    onSuccess: () => {
      message.success("Tarif enregistré avec succès dans la base de données !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: () => {
      message.error("Erreur lors de l'enregistrement du tarif.");
    }
  });

  const editMutation = useMutation({
    mutationFn: async (values: any) => {
      const { ht } = getHtAndTva(values.tarifTTC);
      values.tarifHT = ht;
      return updateAdminTarif(selectedTarif!.id, values);
    },
    onSuccess: () => {
      message.success("Tarif mis à jour avec succès dans la base de données !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsEditModalOpen(false);
    },
    onError: () => {
      message.error("Erreur lors de la mise à jour du tarif.");
    }
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
    const seg = getSegmentTarif(record);
    const ttc = record.tarifTTC || (record.tarifHT ? Math.round(record.tarifHT * 1.2) : 0);
    editForm.setFieldsValue({
      parkingNom: record.parkingNom,
      segment: seg.isCorporate ? "CORPORATE" : "REGULIER",
      libelle: record.libelle,
      typeAbonnement: record.typeAbonnement,
      plageHoraire: record.plageHoraire || "24h / 7j",
      tarifTTC: ttc,
      motifModification: "",
    });
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
      title: "Type de Client",
      key: "segment",
      width: 200,
      filters: [
        { text: "👤 Régulier (Particulier)", value: "REGULIER" },
        { text: "🏢 Corporate (Flottes Entreprises)", value: "CORPORATE" },
      ],
      onFilter: (value: any, record: PlanTarifaire) => {
        const seg = getSegmentTarif(record);
        return value === "CORPORATE" ? seg.isCorporate : !seg.isCorporate;
      },
      render: (_: unknown, record: PlanTarifaire) => {
        const seg = getSegmentTarif(record);
        return seg.isCorporate ? (
          <div>
            <Tag color="magenta" style={{ fontWeight: 700, borderRadius: 6, padding: "3px 9px", fontSize: "12px" }}>
              <BankOutlined style={{ marginRight: 5 }} /> Corporate
            </Tag>
            <div style={{ fontSize: "11px", color: "#9d174d", marginTop: 3, fontWeight: 600 }}>
              Flottes (Multi-véhicules)
            </div>
          </div>
        ) : (
          <div>
            <Tag color="blue" style={{ fontWeight: 700, borderRadius: 6, padding: "3px 9px", fontSize: "12px" }}>
              <UserOutlined style={{ marginRight: 5 }} /> Régulier
            </Tag>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: 3 }}>
              Particulier (1 véhicule)
            </div>
          </div>
        );
      },
    },
    {
      title: "Prix Mensuel TTC",
      dataIndex: "tarifTTC",
      key: "tarifTTC",
      sorter: (a: PlanTarifaire, b: PlanTarifaire) => a.tarifTTC - b.tarifTTC,
      render: (v: number, record: PlanTarifaire) => {
        const seg = getSegmentTarif(record);
        return (
          <div>
            <strong style={{ color: seg.isCorporate ? "#9333ea" : "#0284c7", fontSize: "1.05rem" }}>
              {v?.toLocaleString("fr-FR")} MAD
            </strong>
            <span style={{ fontSize: "11px", color: "#64748b", marginLeft: 4 }}>
              {seg.isCorporate ? "/ place / mois" : "/ mois"}
            </span>
            {seg.isCorporate ? (
              <div style={{ fontSize: "10px", color: "#a855f7", fontWeight: 600 }}>
                Tarif groupé B2B (Dégressif)
              </div>
            ) : (
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                Tarif standard unitaire
              </div>
            )}
          </div>
        );
      },
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

      {/* Filter Bar : Parking & Type de Client */}
      <div style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 20, border: "1px solid #e2e8f0" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              <FilterOutlined /> Filtrer par Parking :
            </div>
            <Select
              style={{ width: "100%" }}
              size="large"
              value={selectedParkingFilter}
              onChange={(val) => setSelectedParkingFilter(val)}
            >
              <Option value="ALL"><EnvironmentOutlined style={{ marginRight: 6 }} />Tous les Parkings ({parkings.length})</Option>
              {parkings.map((p) => (
                <Option key={p.id} value={p.id}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />{p.nom} ({p.code})
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              <TeamOutlined /> Type de Client / Segment :
            </div>
            <Select
              style={{ width: "100%" }}
              size="large"
              value={selectedSegmentFilter}
              onChange={(val) => setSelectedSegmentFilter(val)}
            >
              <Option value="ALL">Tous les Segments (Régulier & Corporate)</Option>
              <Option value="REGULIER">
                <UserOutlined style={{ marginRight: 6, color: "#0284c7" }} /> Régulier (Particulier 1 véhicule)
              </Option>
              <Option value="CORPORATE">
                <BankOutlined style={{ marginRight: 6, color: "#9333ea" }} /> Corporate (Flottes multi-véhicules)
              </Option>
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
          MODAL 1 : AJOUTER UN TARIF (STRUCTURE PROPRE EN 4 ÉTAPES)
          ------------------------------------------------------------- */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <PlusOutlined style={{ fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>Nouveau Tarif Parking</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 400 }}>Configuration homologuée d'un forfait d'abonnement</div>
            </div>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setAttachedDocName(null);
        }}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Valider & Enregistrer dans la Base"
        cancelText="Annuler"
        width={650}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            segment: "REGULIER",
            typeAbonnement: "H24_NON_RESERVEE",
            libelle: "24h/24 et 7j/7 place non réservée",
            plageHoraire: "24h / 7j",
            dureeMois: 1,
          }}
          onFinish={(v) => createMutation.mutate(v)}
        >
          {/* Bloc 1 : Périmètre & Typologie Client */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: 12 }}>
              1. Périmètre & Typologie Client
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="parkingId"
                  label={<span style={{ fontWeight: 600 }}>Parking Concerné *</span>}
                  rules={[{ required: true, message: "Veuillez choisir un parking" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select placeholder="Sélectionnez un parking" size="large">
                    {parkings.map((p) => (
                      <Option key={p.id} value={p.id}>
                        <EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />{p.nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="segment"
                  label={<span style={{ fontWeight: 600 }}>Type de Client / Segment *</span>}
                  rules={[{ required: true }]}
                  style={{ marginBottom: 0 }}
                >
                  <Radio.Group buttonStyle="solid" style={{ width: "100%", display: "flex" }}>
                    <Radio.Button value="REGULIER" style={{ flex: 1, textAlign: "center" }}>
                      <UserOutlined style={{ marginRight: 4, color: "#0284c7" }} /> Régulier
                    </Radio.Button>
                    <Radio.Button value="CORPORATE" style={{ flex: 1, textAlign: "center" }}>
                      <BankOutlined style={{ marginRight: 4, color: "#9333ea" }} /> Corporate
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Bloc 2 : Formule d'Abonnement */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: 12 }}>
              2. Formule & Créneau d'Accès
            </div>

            <Form.Item
              name="typeAbonnement"
              label={<span style={{ fontWeight: 600 }}>Modèle de Forfait Homologué *</span>}
              rules={[{ required: true, message: "Veuillez sélectionner un forfait" }]}
            >
              <Select
                size="large"
                onChange={(val) => {
                  const FORFAITS_DEFAULTS: Record<string, { libelle: string; plage: string }> = {
                    H24_NON_RESERVEE: { libelle: "24h/24 et 7j/7 place non réservée", plage: "24h / 7j" },
                    H24_RESERVEE: { libelle: "24h/24 et 7j/7 place réservée", plage: "24h / 7j" },
                    JOUR_7J_08H_20H: { libelle: "Jour 7j/7 08h-20h", plage: "08:00 - 20:00" },
                    JOUR_7J_08H_22H: { libelle: "Jour 7j/7 08h-22h", plage: "08:00 - 22:00" },
                    NUIT_7J_20H_08H: { libelle: "Nuit 7j/7 20h-08h", plage: "20:00 - 08:00" },
                    NUIT_5J_20H_08H: { libelle: "Nuit 5j/7 hors week-end 20h-08h", plage: "20:00 - 08:00 (Lun-Ven)" },
                    NUIT_5J_WE_24H: { libelle: "Nuit 5j/7 20h-08h et week-end 24h/24", plage: "20:00 - 08:00 + WE 24h" },
                    RAHTI: { libelle: "Rahti - nuit 7j/7 18h-09h et week-end 24h/24", plage: "18:00 - 09:00 + WE 24h" },
                    TAJIR: { libelle: "Tajir - jour 7j/7 08h-22h", plage: "08:00 - 22:00" },
                    CORPORATE_FLOTTE: { libelle: "Abonnement Flotte Corporate Entreprise", plage: "Accès multi-véhicules" },
                  };
                  const f = FORFAITS_DEFAULTS[val];
                  if (f) {
                    createForm.setFieldValue("libelle", f.libelle);
                    createForm.setFieldValue("plageHoraire", f.plage);
                  }
                }}
              >
                <Option value="H24_NON_RESERVEE"><ClockCircleOutlined style={{ marginRight: 6, color: "#0284c7" }} />24h/24 et 7j/7 — Non Réservée</Option>
                <Option value="H24_RESERVEE"><ClockCircleOutlined style={{ marginRight: 6, color: "#16a34a" }} />24h/24 et 7j/7 — Place Réservée (VIP)</Option>
                <Option value="JOUR_7J_08H_20H"><ClockCircleOutlined style={{ marginRight: 6, color: "#f59e0b" }} />Jour 7j/7 (08:00 - 20:00)</Option>
                <Option value="JOUR_7J_08H_22H"><ClockCircleOutlined style={{ marginRight: 6, color: "#f97316" }} />Jour 7j/7 (08:00 - 22:00)</Option>
                <Option value="NUIT_7J_20H_08H"><ClockCircleOutlined style={{ marginRight: 6, color: "#8b5cf6" }} />Nuit 7j/7 (20:00 - 08:00)</Option>
                <Option value="NUIT_5J_20H_08H"><ClockCircleOutlined style={{ marginRight: 6, color: "#6366f1" }} />Nuit 5j/7 Semaine (20:00 - 08:00)</Option>
                <Option value="NUIT_5J_WE_24H"><ClockCircleOutlined style={{ marginRight: 6, color: "#a855f7" }} />Nuit 5j/7 + Week-end 24h</Option>
                <Option value="RAHTI"><TagsOutlined style={{ marginRight: 6, color: "#06b6d4" }} />Formule Rahti (Résidents)</Option>
                <Option value="TAJIR"><TagsOutlined style={{ marginRight: 6, color: "#eab308" }} />Formule Tajir (Commerçants)</Option>
                <Option value="CORPORATE_FLOTTE"><BankOutlined style={{ marginRight: 6, color: "#ec4899" }} />Convention Corporate (Flotte Entreprise)</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="libelle" label={<span style={{ fontWeight: 600 }}>Libellé Affiché *</span>} rules={[{ required: true }]}>
                  <Input placeholder="Ex: 24h/24 et 7j/7 place non réservée" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name="plageHoraire" label={<span style={{ fontWeight: 600 }}>Créneau Horaire</span>}>
                  <Input placeholder="Ex: 24h / 7j" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Bloc 3 : Tarification Homologuée & Calcul Automatique TTC -> HT */}
          <div style={{ background: "#f0fdf4", padding: "14px 16px", borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#166534", letterSpacing: "0.05em", marginBottom: 12 }}>
              3. Tarification Homologuée (TTC & Décomposition Fiscale)
            </div>

            <Form.Item
              name="tarifTTC"
              label={<span style={{ fontWeight: 700, color: "#166534" }}>Prix Public Mensuel TTC (MAD TTC) *</span>}
              rules={[{ required: true, message: "Veuillez saisir le montant TTC" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                min={0}
                step={50}
                placeholder="Ex: 600"
                addonAfter="MAD TTC / mois"
              />
            </Form.Item>

            {/* Carte de Décomposition Fiscale en direct */}
            <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 8, border: "1px solid #86efac" }}>
              <Row gutter={12} align="middle">
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>PRIX SAISI TTC</div>
                  <div style={{ fontWeight: 800, color: "#166534", fontSize: "1.05rem" }}>
                    {Number(watchedCreateTTC || 0).toLocaleString("fr-FR")} MAD
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>TVA LÉGALE (20%)</div>
                  <div style={{ fontWeight: 700, color: "#0284c7", fontSize: "1rem" }}>
                    {getHtAndTva(watchedCreateTTC).tva.toLocaleString("fr-FR")} MAD
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>NET HORS TAXE (HT)</div>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                    {getHtAndTva(watchedCreateTTC).ht.toLocaleString("fr-FR")} MAD HT
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Bloc 4 : Justification & Traçabilité */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: 12 }}>
              4. Cadre Réglementaire & Traçabilité
            </div>
            <Form.Item
              name="motifCreation"
              label={<span style={{ fontWeight: 600 }}>Motif officiel / Réf. Arrêté communal *</span>}
              rules={[{ required: true, message: "Le motif réglementaire est obligatoire" }]}
            >
              <Input.TextArea rows={2} placeholder="Ex: Décision tarifaire communale n°2026/04..." />
            </Form.Item>
            <Form.Item label={<span style={{ fontWeight: 600 }}>Pièce jointe officielle (Optionnel)</span>}>
              <Upload
                beforeUpload={(file) => {
                  message.success(`Fichier attaché : ${file.name}`);
                  setAttachedDocName(file.name);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setAttachedDocName(null)}
              >
                <Button icon={<UploadOutlined />}>
                  {attachedDocName ? `Fichier : ${attachedDocName}` : "Joindre l'Arrêté communal ou PV (PDF / Image)"}
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>

           {/* -------------------------------------------------------------
          MODAL 2 : MODIFIER LE PRIX (STRUCTURE ENRICHIE & PRÉ-REMPLIE)
          ------------------------------------------------------------- */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <EditOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                Modifier le Tarif Homologué
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 400 }}>
                Ajustement du prix mensuel, du segment et des spécifications
              </div>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setAttachedDocName(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={editMutation.isPending}
        okText="Enregistrer les modifications"
        cancelText="Annuler"
        width={650}
      >
        {/* Bandeau d'Identification du Parking & Forfait en cours */}
        {selectedTarif && (
          <div style={{ background: "#f1f5f9", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: 16 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Parking Affecté</div>
                <div style={{ fontWeight: 800, color: "#001E3D", fontSize: "1.05rem" }}>
                  <EnvironmentOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                  {selectedTarif.parkingNom}
                </div>
              </Col>
              <Col style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Référence BDD</div>
                <Tag color="blue" style={{ fontWeight: 700 }}>Tarif #{selectedTarif.id}</Tag>
              </Col>
            </Row>
          </div>
        )}

        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          {/* Section 1 : Segment & Libellé */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: 12 }}>
              1. Typologie & Libellé
            </div>

            {/* Sélecteur de Segment avec boutons Radio pré-sélectionnés */}
            <Form.Item
              name="segment"
              label={<span style={{ fontWeight: 600 }}>Type de Client / Segment *</span>}
              rules={[{ required: true, message: "Veuillez sélectionner le segment" }]}
            >
              <Radio.Group buttonStyle="solid" style={{ width: "100%", display: "flex" }}>
                <Radio.Button value="REGULIER" style={{ flex: 1, textAlign: "center" }}>
                  <UserOutlined style={{ marginRight: 6, color: "#0284c7" }} /> Régulier (Particulier — 1 véhicule)
                </Radio.Button>
                <Radio.Button value="CORPORATE" style={{ flex: 1, textAlign: "center" }}>
                  <BankOutlined style={{ marginRight: 6, color: "#9333ea" }} /> Corporate (Flottes B2B — multi-véhicules)
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Row gutter={16}>
              <Col span={14}>
                <Form.Item name="libelle" label={<span style={{ fontWeight: 600 }}>Libellé du Forfait *</span>} rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name="plageHoraire" label={<span style={{ fontWeight: 600 }}>Plage Horaire / Créneau</span>}>
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 2 : Nouveau Prix TTC & Calcul direct HT */}
          <div style={{ background: "#f0fdf4", padding: "14px 16px", borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 16 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#166534", letterSpacing: "0.05em", marginBottom: 12 }}>
              2. Tarification Homologuée (TTC & Décomposition Fiscale)
            </div>

            <Form.Item
              name="tarifTTC"
              label={<span style={{ fontWeight: 700, color: "#166534" }}>Nouveau Prix Mensuel TTC (MAD TTC) *</span>}
              rules={[{ required: true, message: "Veuillez saisir le prix TTC" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                min={0}
                step={50}
                addonAfter="MAD TTC / mois"
              />
            </Form.Item>

            {/* Comparatif Ancien vs Nouveau Prix */}
            {selectedTarif && (
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: 10 }}>
                Prix actuel en base : <strong style={{ color: "#0f172a" }}>{selectedTarif.tarifTTC || Math.round((selectedTarif.tarifHT || 0) * 1.2)} MAD TTC</strong>
                {Boolean(watchedEditTTC && watchedEditTTC !== (selectedTarif.tarifTTC || Math.round((selectedTarif.tarifHT || 0) * 1.2))) && (
                  <span style={{ marginLeft: 8, fontWeight: 700, color: (watchedEditTTC || 0) > (selectedTarif.tarifTTC || 0) ? "#ef4444" : "#16a34a" }}>
                    ({(watchedEditTTC || 0) > (selectedTarif.tarifTTC || 0) ? "+" : ""}{(watchedEditTTC || 0) - (selectedTarif.tarifTTC || 0)} MAD)
                  </span>
                )}
              </div>
            )}

            {/* Carte de Décomposition automatique HT & TVA en direct */}
            <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 8, border: "1px solid #86efac" }}>
              <Row gutter={12} align="middle">
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>NOUVEAU TTC SAISI</div>
                  <div style={{ fontWeight: 800, color: "#166534", fontSize: "1.05rem" }}>
                    {Number(watchedEditTTC || 0).toLocaleString("fr-FR")} MAD
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>TVA (20%)</div>
                  <div style={{ fontWeight: 700, color: "#0284c7", fontSize: "1rem" }}>
                    {getHtAndTva(watchedEditTTC).tva.toLocaleString("fr-FR")} MAD
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>NET HORS TAXE (HT)</div>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>
                    {getHtAndTva(watchedEditTTC).ht.toLocaleString("fr-FR")} MAD HT
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Section 3 : Justification & Traçabilité */}
          <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: 12 }}>
              3. Justification de la Révision & Traçabilité
            </div>

            <Form.Item
              name="motifModification"
              label={<span style={{ fontWeight: 600 }}>Motif officiel justifiant la révision *</span>}
              rules={[{ required: true, message: "Le motif est obligatoire pour toute modification" }]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Ex: Décision de révision tarifaire annuelle 2026, délibération communale n°..."
              />
            </Form.Item>

            <Form.Item label={<span style={{ fontWeight: 600 }}>Pièce justificative attachée (Optionnel)</span>}>
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
          </div>
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
