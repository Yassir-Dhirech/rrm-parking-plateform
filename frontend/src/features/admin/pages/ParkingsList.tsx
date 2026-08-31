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
  Alert,
  Row,
  Col,
  Divider,
  Dropdown,
  Upload,
  Steps,
  Select,
  Checkbox,
  Descriptions,
  Tooltip,
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
  TagsOutlined,
  SettingOutlined,
  DownOutlined,
  FileProtectOutlined,
  UploadOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  RightOutlined,
  LeftOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getParkingsMock,
  getUtilisateursMock,
  mockParkings,
  mockTarifs,
  mockUtilisateurs,
  recalculerQuotasParking,
} from "../../../api/adminMock";
import type { Parking } from "../types";
import { ParkingPlansTarifairesModal } from "../../../components/parkings/ParkingPlansTarifairesModal";

const { Title, Text } = Typography;

function getHtAndTva(ttc: number) {
  const ht = Math.round(ttc / 1.2);
  const tva = Math.round(ttc - ht);
  return { ht, tva };
}

export function ParkingsList() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [attachedPvName, setAttachedPvName] = useState<string | null>(null);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [selectedParkingForPlans, setSelectedParkingForPlans] = useState<Parking | null>(null);
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

  const { data: utilisateurs = [] } = useQuery({
    queryKey: ["admin_utilisateurs"],
    queryFn: getUtilisateursMock,
  });

  const agentsDisponibles = utilisateurs.filter(
    (u) => (u.role === "AGENT" || u.role === "SUPERVISEUR") && u.actif
  );

  const [currentCreateStep, setCurrentCreateStep] = useState(0);
  const watchedCreateValues = Form.useWatch([], createForm);

  // Dynamic Plans State inside Create Parking Wizard
  interface CreatePlanItem {
    id: number;
    libelle: string;
    typeAbonnement: string;
    categorie: "Particulier" | "Corporate 20 Ans" | "Conventionné / Spécial";
    plageHoraire: string;
    dureeMois: number;
    tarifTTC: number;
  }

  const [createPlans, setCreatePlans] = useState<CreatePlanItem[]>([]);

  const handleUpdateCreatePlan = (id: number, field: keyof CreatePlanItem, val: any) => {
    setCreatePlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleAddCreatePlan = () => {
    const newId = Date.now();
    setCreatePlans((prev) => [
      ...prev,
      {
        id: newId,
        libelle: `Nouvelle Formule Personnalisée ${prev.length + 1}`,
        typeAbonnement: "PARTICULIER",
        categorie: "Particulier",
        plageHoraire: "24h / 7j",
        dureeMois: 1,
        tarifTTC: 500,
      },
    ]);
  };

  const handleDeleteCreatePlan = (id: number) => {
    if (createPlans.length <= 1) {
      message.warning("Le parking doit comporter au moins une formule d'abonnement.");
      return;
    }
    setCreatePlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenCreateModal = () => {
    setCurrentCreateStep(0);
    createForm.resetFields();
    createForm.setFieldsValue({
      capaciteTotale: 450,
      pourcentageTickets: 50,
      pourcentageAbonnements: 50,
      pourcentageCorporate: 60,
      pourcentageParticulier: 40,
      latitude: 34.02088,
      longitude: -6.84165,
      zone: "Agdal",
      typeOuvrage: "Souterrain (Ouvrage enterré)",
      nombreNiveaux: 2,
      horairesOuverture: "24h / 24, 7j / 7 (Permanent)",
      agentAssigneId: agentsDisponibles[0]?.id || 1,
      equipements: ["RFID", "LPR", "GUIDAGE_LED", "SURVEILLANCE_247"],
    });
    setCreatePlans([
      { id: 1, libelle: "Abonnement Particulier — Permanent (24h / 7j)", typeAbonnement: "PERMANENT_24_7", categorie: "Particulier", plageHoraire: "24h / 7j", dureeMois: 1, tarifTTC: 600 },
      { id: 2, libelle: "Abonnement Particulier — Diurne (Jour 08:00 - 20:00)", typeAbonnement: "JOUR_8H_20H", categorie: "Particulier", plageHoraire: "08:00 - 20:00", dureeMois: 1, tarifTTC: 420 },
      { id: 3, libelle: "Abonnement Particulier — Nocturne (Nuit 19:00 - 08:00)", typeAbonnement: "NUIT_19H_8H", categorie: "Particulier", plageHoraire: "19:00 - 08:00", dureeMois: 1, tarifTTC: 300 },
      { id: 4, libelle: "Contrat Corporate 20 Ans — Formule 08:00 - 20:00", typeAbonnement: "CORPORATE", categorie: "Corporate 20 Ans", plageHoraire: "08:00 - 20:00", dureeMois: 240, tarifTTC: 500 },
      { id: 5, libelle: "Contrat Corporate 20 Ans — Formule 08:00 - 22:00", typeAbonnement: "CORPORATE", categorie: "Corporate 20 Ans", plageHoraire: "08:00 - 22:00", dureeMois: 240, tarifTTC: 550 },
      { id: 6, libelle: "Contrat Corporate 20 Ans — Formule 24h / 7j", typeAbonnement: "CORPORATE", categorie: "Corporate 20 Ans", plageHoraire: "24h / 7j", dureeMois: 240, tarifTTC: 650 },
    ]);
    setIsCreateModalOpen(true);
  };

  const handleNextCreateStep = async () => {
    try {
      if (currentCreateStep === 0) {
        await createForm.validateFields(["code", "nom", "adresse", "zone", "latitude", "longitude"]);
      } else if (currentCreateStep === 1) {
        await createForm.validateFields([
          "capaciteTotale",
          "pourcentageTickets",
          "pourcentageAbonnements",
          "pourcentageCorporate",
          "pourcentageParticulier",
        ]);
        const pt = createForm.getFieldValue("pourcentageTickets") || 0;
        const pa = createForm.getFieldValue("pourcentageAbonnements") || 0;
        if (pt + pa !== 100) {
          message.error("La somme du % Tickets et % Abonnements doit être exactement égale à 100%.");
          return;
        }
        const pc = createForm.getFieldValue("pourcentageCorporate") || 0;
        const pp = createForm.getFieldValue("pourcentageParticulier") || 0;
        if (pc + pp !== 100) {
          message.error("La somme du % Corporate et % Particuliers doit être exactement égale à 100%.");
          return;
        }
      } else if (currentCreateStep === 2) {
        await createForm.validateFields(["typeOuvrage", "nombreNiveaux", "horairesOuverture", "agentAssigneId"]);
      } else if (currentCreateStep === 3) {
        // Validate plans in step 4
        const hasEmptyName = createPlans.some((p) => !p.libelle.trim());
        if (hasEmptyName) {
          message.error("Chaque formule d'abonnement doit avoir un libellé valide.");
          return;
        }
        const hasInvalidPrice = createPlans.some((p) => !p.tarifTTC || p.tarifTTC <= 0);
        if (hasInvalidPrice) {
          message.error("Chaque formule d'abonnement doit avoir un tarif mensuel supérieur à 0 MAD.");
          return;
        }
      }
      setCurrentCreateStep((prev) => Math.min(prev + 1, 4));
    } catch {
      // form validation feedback handled by antd
    }
  };

  const handlePrevCreateStep = () => {
    setCurrentCreateStep((prev) => Math.max(prev - 1, 0));
  };

  // Create Parking Mutation with Step-by-Step Data, Assigned Agent, and Pre-configured Plans
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const newId = Date.now();
      const capTotale = values.capaciteTotale || 450;
      const pctTickets = values.pourcentageTickets || 50;
      const pctAbos = values.pourcentageAbonnements || 50;
      const pctCorp = values.pourcentageCorporate || 60;
      const pctPart = values.pourcentageParticulier || 40;

      const qTickets = Math.round((capTotale * pctTickets) / 100);
      const qAbosTotal = Math.round((capTotale * pctAbos) / 100);
      const qCorp = Math.round((qAbosTotal * pctCorp) / 100);
      const qPart = Math.round((qAbosTotal * pctPart) / 100);

      const newP = recalculerQuotasParking({
        id: newId,
        code: values.code?.toUpperCase() || `PRK-${newId}`,
        nom: values.nom!,
        adresse: values.adresse!,
        zone: values.zone,
        capaciteTotale: capTotale,
        placesReserveesAbonnes: qAbosTotal,
        pourcentageTickets: pctTickets,
        pourcentageAbonnements: pctAbos,
        pourcentageCorporate: pctCorp,
        pourcentageParticulier: pctPart,
        quotaTickets: qTickets,
        quotaAbonnementsTotal: qAbosTotal,
        quotaCorporate: qCorp,
        quotaParticulier: qPart,
        abonnementsParticulierActifs: 0,
        abonnementsCorporateActifs: 0,
        placesRestantesParticulier: qPart,
        placesRestantesCorporate: qCorp,
        actif: true,
        verrouille: false,
        latitude: values.latitude ?? 34.02088,
        longitude: values.longitude ?? -6.84165,
      });
      mockParkings.push(newP);

      // Assign the selected Agent / Supervisor account to this new parking
      if (values.agentAssigneId) {
        const assignedUser = mockUtilisateurs.find((u) => u.id === values.agentAssigneId);
        if (assignedUser) {
          assignedUser.parkingAssigneId = newId;
          assignedUser.parkingAssigneNom = newP.nom;
        }
      }

      // Populate mockTarifs with the exact plans configured by the Responsable in Step 4
      createPlans.forEach((plan, i) => {
        mockTarifs.push({
          id: Date.now() + 200 + i,
          libelle: plan.libelle,
          typeAbonnement: plan.typeAbonnement as any,
          plageHoraire: plan.plageHoraire,
          dureeMois: plan.dureeMois,
          tarifHT: Math.round(plan.tarifTTC / 1.2),
          tarifTTC: plan.tarifTTC,
          parkingId: newId,
          parkingNom: newP.nom,
          actif: true,
        });
      });
    },
    onSuccess: (_, variables: any) => {
      message.success(`Nouveau parking "${variables.nom}" créé et prêt avec agent et tarifs configurés !`);
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      queryClient.invalidateQueries({ queryKey: ["admin_utilisateurs"] });
      setIsCreateModalOpen(false);
      setCurrentCreateStep(0);
      createForm.resetFields();
    },
  });

  // Edit Parking Basic Info
  const editMutation = useMutation({
    mutationFn: async (values: Partial<Parking> & { motifModification?: string }) => {
      if (!selectedParking) return;
      if (!values.motifModification?.trim()) {
        throw new Error("Le motif officiel de la modification est obligatoire.");
      }
      const targetIndex = mockParkings.findIndex((p) => p.id === selectedParking.id);
      if (targetIndex !== -1) {
        Object.assign(mockParkings[targetIndex], values);
        mockParkings[targetIndex] = recalculerQuotasParking(mockParkings[targetIndex]);
      }
    },
    onSuccess: () => {
      message.success(
        `Caractéristiques du parking mises à jour avec motif officiel enregistré${attachedPvName ? ` et PV "${attachedPvName}" associé` : ""} !`
      );
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsEditModeActive(false);
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      message.error(err.message || "Erreur lors de la mise à jour");
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
    setIsEditModeActive(false);
    setAttachedPvName(null);
    editForm.setFieldsValue({
      ...record,
      motifModification: "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPlansModal = (record: Parking) => {
    setSelectedParkingForPlans(record);
    setIsPlansModalOpen(true);
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
      title: "Capacité Globale",
      dataIndex: "capaciteTotale",
      key: "capaciteTotale",
      render: (capaciteTotale: number) => (
        <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 13 }}>
          {capaciteTotale} places
        </Tag>
      ),
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
      title: "Paramètres",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Parking) => {
        const menuItems = [
          {
            key: "plans",
            icon: <TagsOutlined style={{ color: "#006398" }} />,
            label: <span style={{ fontWeight: 700, color: "#006398" }}>Plans Tarifaires</span>,
            onClick: () => handleOpenPlansModal(record),
          },
          {
            key: "edit",
            icon: <EditOutlined style={{ color: "#0284c7" }} />,
            label: <span>Modifier Caractéristiques</span>,
            onClick: () => handleOpenEdit(record),
          },
          {
            key: "map",
            icon: <EnvironmentOutlined style={{ color: "#16a34a" }} />,
            label: <span>Localisation Google Maps</span>,
            onClick: () => handleOpenMap(record),
          },
          {
            type: "divider" as const,
          },
          record.verrouille
            ? {
                key: "unlock",
                icon: <UnlockOutlined style={{ color: "#16a34a" }} />,
                label: <span style={{ fontWeight: 700, color: "#16a34a" }}>Déverrouiller le Parking</span>,
                onClick: () => {
                  setSelectedParking(record);
                  toggleLockMutation.mutate({ lock: false });
                },
              }
            : {
                key: "lock",
                icon: <LockOutlined style={{ color: "#d97706" }} />,
                label: <span style={{ color: "#d97706" }}>Verrouiller (Maintenance)</span>,
                onClick: () => handleOpenLock(record),
              },
          ...(record.actif
            ? [
                {
                  key: "deactivate",
                  icon: <StopOutlined style={{ color: "#dc2626" }} />,
                  label: <span style={{ fontWeight: 700, color: "#dc2626" }}>Désactiver le Parking</span>,
                  danger: true,
                  onClick: () => handleOpenDeactivate(record),
                },
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="primary"
              icon={<SettingOutlined />}
              style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700, borderRadius: 8 }}
              className="flex items-center gap-1.5 shadow-2xs"
            >
              Paramètres <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
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
          onClick={handleOpenCreateModal}
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

      <Table columns={columns} dataSource={parkings} loading={isLoading} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />

      {/* Modal 1: Configuration d'un Nouveau Parking par Étapes (Wizard 5 Étapes) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <PlusOutlined style={{ color: "#006398" }} />
            <span>Nouveau Parking — Configuration & Déploiement Clé en Main (RRM)</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div>
              {currentCreateStep > 0 ? (
                <Button icon={<LeftOutlined />} onClick={handlePrevCreateStep} className="font-bold rounded-xl">
                  Précédent
                </Button>
              ) : (
                <Button onClick={() => setIsCreateModalOpen(false)} className="font-bold rounded-xl">
                  Annuler
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                Étape {currentCreateStep + 1} sur 5
              </span>
              {currentCreateStep < 4 ? (
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  onClick={handleNextCreateStep}
                  style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                  className="rounded-xl px-5"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => createForm.submit()}
                  loading={createMutation.isPending}
                  style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
                  className="rounded-xl px-6 h-10 shadow-sm"
                >
                  Créer et Déployer le Parking
                </Button>
              )}
            </div>
          </div>
        }
        width={820}
        destroyOnClose
      >
        <div className="pt-2">
          {/* Progress Steps Header */}
          <Steps
            current={currentCreateStep}
            size="small"
            className="mb-5"
            items={[
              { title: "Localisation", icon: <EnvironmentOutlined /> },
              { title: "Capacités & Quotas", icon: <PieChartOutlined /> },
              { title: "Exploitation & Agent", icon: <UserOutlined /> },
              { title: "Plans Tarifaires", icon: <TagsOutlined /> },
              { title: "Validation", icon: <CheckCircleOutlined /> },
            ]}
          />

          <Form
            form={createForm}
            layout="vertical"
            onFinish={(v) => createMutation.mutate(v)}
            className="mt-3"
          >
            {/* ÉTAPE 1: Identification & Localisation */}
            {currentCreateStep === 0 && (
              <div>
                <Alert
                  type="info"
                  showIcon
                  icon={<EnvironmentOutlined style={{ color: "#006398" }} />}
                  message="Étape 1/5 : Identification & Localisation du Parking"
                  description="Renseignez le code officiel, le nom de l'ouvrage, le quartier d'implantation et les coordonnées GPS pour la cartographie interactive."
                  className="rounded-xl border-blue-200 bg-blue-50/70 mb-4"
                />

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label={<span className="font-bold text-xs text-slate-800">Code Identifiant Unique <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Code requis (ex: PRK-RYD-01)" }]}
                    >
                      <Input placeholder="ex: PRK-RYD-01" className="font-bold uppercase rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nom"
                      label={<span className="font-bold text-xs text-slate-800">Nom Officiel de l'Ouvrage <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Nom requis" }]}
                    >
                      <Input placeholder="ex: Parking Ryad Al Andalous" className="font-bold rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={10}>
                    <Form.Item
                      name="zone"
                      label={<span className="font-bold text-xs text-slate-800">Arrondissement / Quartier <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Quartier requis" }]}
                    >
                      <Select
                        placeholder="Sélectionnez le quartier"
                        options={[
                          { value: "Agdal", label: "Agdal" },
                          { value: "Hay Riad", label: "Hay Riad" },
                          { value: "Hassan", label: "Hassan" },
                          { value: "Médina", label: "Médina" },
                          { value: "Souissi", label: "Souissi" },
                          { value: "Yacoub El Mansour", label: "Yacoub El Mansour" },
                          { value: "Océan", label: "Océan" },
                          { value: "Aviation", label: "Aviation" },
                          { value: "Autre Rabat", label: "Autre Rabat" },
                        ]}
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    <Form.Item
                      name="adresse"
                      label={<span className="font-bold text-xs text-slate-800">Adresse Physique Complète <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Adresse requise" }]}
                    >
                      <Input placeholder="ex: Avenue Annakhil, Hay Riad, Rabat" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="latitude"
                      label={<span className="font-bold text-xs text-slate-800">Latitude GPS (Google Maps) <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Latitude requise" }]}
                    >
                      <InputNumber style={{ width: "100%" }} step={0.0001} placeholder="34.02088" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="longitude"
                      label={<span className="font-bold text-xs text-slate-800">Longitude GPS (Google Maps) <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: "Longitude requise" }]}
                    >
                      <InputNumber style={{ width: "100%" }} step={0.0001} placeholder="-6.84165" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-600">
                  <EnvironmentOutlined style={{ color: "#006398", fontSize: 18 }} />
                  <span>
                    Coordonnées géographiques : <strong>{watchedCreateValues?.latitude ?? 34.02088}, {watchedCreateValues?.longitude ?? -6.84165}</strong> (Rabat, Maroc). Ce point sera marqué sur Google Maps.
                  </span>
                </div>
              </div>
            )}

            {/* ÉTAPE 2: Capacité & Quotas */}
            {currentCreateStep === 1 && (
              <div>
                <Alert
                  type="info"
                  showIcon
                  icon={<PieChartOutlined style={{ color: "#006398" }} />}
                  message="Étape 2/5 : Capacité & Quotas Réglementaires RRM"
                  description="Définissez la capacité globale du parking et les pourcentages d'attribution entre tickets passagers et abonnements, ainsi que la ventilation Corporate vs Particuliers."
                  className="rounded-xl border-blue-200 bg-blue-50/70 mb-4"
                />

                <Form.Item
                  name="capaciteTotale"
                  label={<span className="font-bold text-sm text-slate-900">Capacité Globale (Nombre Total de Places) <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: "Capacité globale requise" }]}
                >
                  <InputNumber
                    min={10}
                    max={5000}
                    size="large"
                    addonAfter="Places au total"
                    style={{ width: "100%" }}
                    className="font-black text-slate-900 rounded-xl"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 mb-4">
                      <div className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide">
                        1. Répartition Primaire (Somme = 100%)
                      </div>
                      <Form.Item
                        name="pourcentageTickets"
                        label={<span className="font-bold text-xs text-slate-700">% Tickets Rotation (Passagers)</span>}
                        rules={[{ required: true }]}
                        className="mb-2"
                      >
                        <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} className="font-bold" />
                      </Form.Item>
                      <Form.Item
                        name="pourcentageAbonnements"
                        label={<span className="font-bold text-xs text-slate-700">% Total Réservé Abonnements</span>}
                        rules={[{ required: true }]}
                        className="mb-0"
                      >
                        <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} className="font-bold" />
                      </Form.Item>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-purple-50/40 mb-4">
                      <div className="text-xs font-black text-purple-900 mb-2 uppercase tracking-wide">
                        2. Ventilation Abonnements (Somme = 100%)
                      </div>
                      <Form.Item
                        name="pourcentageCorporate"
                        label={<span className="font-bold text-xs text-purple-800">% Quota Corporate (Flottes)</span>}
                        rules={[{ required: true }]}
                        className="mb-2"
                      >
                        <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} className="font-bold text-purple-900" />
                      </Form.Item>
                      <Form.Item
                        name="pourcentageParticulier"
                        label={<span className="font-bold text-xs text-purple-800">% Quota Particuliers (Résidents)</span>}
                        rules={[{ required: true }]}
                        className="mb-0"
                      >
                        <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} className="font-bold text-blue-900" />
                      </Form.Item>
                    </div>
                  </Col>
                </Row>

                {/* Live calculated capacity pills */}
                {(() => {
                  const cap = watchedCreateValues?.capaciteTotale || 450;
                  const pt = watchedCreateValues?.pourcentageTickets ?? 50;
                  const pa = watchedCreateValues?.pourcentageAbonnements ?? 50;
                  const pc = watchedCreateValues?.pourcentageCorporate ?? 60;
                  const pp = watchedCreateValues?.pourcentageParticulier ?? 40;

                  const placesTickets = Math.round((cap * pt) / 100);
                  const placesAbos = Math.round((cap * pa) / 100);
                  const placesCorp = Math.round((placesAbos * pc) / 100);
                  const placesPart = Math.round((placesAbos * pp) / 100);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-center">
                        <div className="text-[11px] font-bold text-blue-700 uppercase">Tickets Rotation ({pt}%)</div>
                        <div className="text-lg font-black text-[#006398]">{placesTickets} places</div>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-center">
                        <div className="text-[11px] font-bold text-purple-700 uppercase">Quota Corporate ({pc}%)</div>
                        <div className="text-lg font-black text-purple-800">{placesCorp} places</div>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
                        <div className="text-[11px] font-bold text-emerald-700 uppercase">Quota Particuliers ({pp}%)</div>
                        <div className="text-lg font-black text-emerald-800">{placesPart} places</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ÉTAPE 3: Exploitation & Affectation Compte Agent */}
            {currentCreateStep === 2 && (
              <div>
                <Alert
                  type="info"
                  showIcon
                  icon={<UserOutlined style={{ color: "#006398" }} />}
                  message="Étape 3/5 : Spécifications d'Exploitation & Affectation du Compte Agent"
                  description="Sélectionnez un compte utilisateur Agent ou Superviseur existant dans le système pour superviser ce parking, puis renseignez les caractéristiques physiques et les équipements."
                  className="rounded-xl border-blue-200 bg-blue-50/70 mb-4"
                />

                {/* Agent Account Selection Dropdown */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <Form.Item
                    name="agentAssigneId"
                    label={
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <UserOutlined style={{ color: "#006398" }} />
                        Compte Agent / Superviseur Référent Affecté à ce Parking <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "Veuillez sélectionner un compte agent ou superviseur" }]}
                    className="mb-2"
                  >
                    <Select
                      placeholder="Sélectionnez un compte agent ou superviseur dans la liste des collaborateurs RRM..."
                      options={agentsDisponibles.map((a) => ({
                        value: a.id,
                        label: `${a.prenom} ${a.nom} (${a.role === "SUPERVISEUR" ? "Superviseur" : "Agent d'Exploitation"}) — ${a.email}`,
                      }))}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  {/* Selected Agent Preview Pill */}
                  {(() => {
                    const selectedAgentId = watchedCreateValues?.agentAssigneId;
                    const agent = agentsDisponibles.find((a) => a.id === selectedAgentId);
                    if (!agent) return null;
                    return (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-2">
                          <Tag color={agent.role === "SUPERVISEUR" ? "gold" : "blue"} className="font-black m-0">
                            {agent.role}
                          </Tag>
                          <span className="font-bold text-slate-900">{agent.prenom} {agent.nom}</span>
                          <span className="text-slate-500">({agent.email})</span>
                        </div>
                        <Tag color="success" className="font-bold m-0">Compte Actif RRM</Tag>
                      </div>
                    );
                  })()}
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="typeOuvrage"
                      label={<span className="font-bold text-xs text-slate-800">Typologie d'Ouvrage <span className="text-red-500">*</span></span>}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={[
                          { value: "Souterrain (Ouvrage enterré)", label: "Souterrain (Ouvrage enterré)" },
                          { value: "Surface (Enclos sécurisé)", label: "Surface (Enclos sécurisé)" },
                          { value: "Silo Aérien (R+N)", label: "Silo Aérien (R+N)" },
                        ]}
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nombreNiveaux"
                      label={<span className="font-bold text-xs text-slate-800">Nombre de Niveaux / Sous-sols</span>}
                    >
                      <InputNumber min={1} max={10} style={{ width: "100%" }} addonAfter="Niveaux" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="horairesOuverture"
                  label={<span className="font-bold text-xs text-slate-800">Plage Horaires d'Exploitation</span>}
                >
                  <Select
                    options={[
                      { value: "24h / 24, 7j / 7 (Permanent)", label: "24h / 24, 7j / 7 (Permanent)" },
                      { value: "06:00 - 00:00 (Service Continu)", label: "06:00 - 00:00 (Service Continu)" },
                      { value: "07:00 - 22:00 (Diurne étendu)", label: "07:00 - 22:00 (Diurne étendu)" },
                    ]}
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="equipements"
                  label={<span className="font-bold text-xs text-slate-800">Équipements & Contrôle d'Accès Installés</span>}
                  className="mb-1"
                >
                  <Checkbox.Group className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Checkbox value="RFID">Bornes & Barrières RFID RRM</Checkbox>
                    <Checkbox value="LPR">Caméras LPR (Lecture de Plaques)</Checkbox>
                    <Checkbox value="GUIDAGE_LED">Guidage dynamique à la place (LED)</Checkbox>
                    <Checkbox value="SURVEILLANCE_247">Vidéosurveillance 24/7</Checkbox>
                    <Checkbox value="EV_CHARGERS">Bornes de recharge électrique (EV)</Checkbox>
                    <Checkbox value="PMR_ACCESS">Ascenseurs & Accès PMR</Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </div>
            )}

            {/* ÉTAPE 4: Plans Tarifaires Initialement Déployés */}
            {currentCreateStep === 3 && (
              <div>
                <Alert
                  type="info"
                  showIcon
                  icon={<TagsOutlined style={{ color: "#006398" }} />}
                  message="Étape 4/5 : Plans & Grilles Tarifaires du Parking"
                  description="Ce parking sera créé avec les formules tarifaires ci-dessous prêtes à l'emploi. Vous pouvez modifier les intitulés, ajuster les tarifs mensuels TTC, ajouter des formules ou en supprimer."
                  className="rounded-xl border-blue-200 bg-blue-50/70 mb-3"
                />

                {/* Table Header for Clean Alignment */}
                <div className="hidden sm:flex items-center justify-between px-3.5 py-1 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <span>Formule d'Abonnement & Intitulé</span>
                  <span className="w-56 text-right pr-2">Tarif Mensuel (MAD TTC)</span>
                </div>

                {/* Dynamic List of Plans inside Create Wizard */}
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {createPlans.map((plan) => {
                    const { ht, tva } = getHtAndTva(plan.tarifTTC);

                    return (
                      <div
                        key={plan.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-[#006398]/50 transition-all"
                      >
                        {/* Top Line: Category Select + Plage Horaire Select + HT/TVA live breakdown + Delete Button */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Select
                              size="small"
                              value={plan.categorie}
                              onChange={(val) => {
                                handleUpdateCreatePlan(plan.id, "categorie", val);
                                if (val === "Corporate 20 Ans") {
                                  handleUpdateCreatePlan(plan.id, "typeAbonnement", "CORPORATE");
                                  handleUpdateCreatePlan(plan.id, "dureeMois", 240);
                                } else {
                                  handleUpdateCreatePlan(plan.id, "typeAbonnement", "PARTICULIER");
                                  handleUpdateCreatePlan(plan.id, "dureeMois", 1);
                                }
                              }}
                              style={{ width: 145 }}
                              options={[
                                { value: "Particulier", label: "Particulier" },
                                { value: "Corporate 20 Ans", label: "Corporate 20 Ans" },
                                { value: "Conventionné / Spécial", label: "Spécial / Conv." },
                              ]}
                            />
                            <Select
                              size="small"
                              value={plan.plageHoraire}
                              onChange={(val) => handleUpdateCreatePlan(plan.id, "plageHoraire", val)}
                              style={{ width: 130 }}
                              options={[
                                { value: "24h / 7j", label: "24h / 7j" },
                                { value: "08:00 - 20:00", label: "08:00 - 20:00" },
                                { value: "08:00 - 22:00", label: "08:00 - 22:00" },
                                { value: "19:00 - 08:00", label: "19:00 - 08:00" },
                              ]}
                            />
                            <span className="text-[11px] text-slate-500 font-medium ml-1">
                              HT : <strong>{ht} MAD</strong> | TVA (20%) : <strong>{tva} MAD</strong>
                            </span>
                          </div>

                          <Tooltip title="Supprimer cette formule">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteCreatePlan(plan.id)}
                              className="rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            />
                          </Tooltip>
                        </div>

                        {/* Bottom Line: Name Input and Price Input Perfectly Aligned Side-by-Side! */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <Input
                              value={plan.libelle}
                              onChange={(e) => handleUpdateCreatePlan(plan.id, "libelle", e.target.value)}
                              placeholder="Intitulé de la formule d'abonnement..."
                              className="font-bold text-sm text-slate-900 rounded-xl w-full h-10"
                            />
                          </div>

                          <div className="w-56 shrink-0">
                            <InputNumber
                              value={plan.tarifTTC}
                              onChange={(val) => handleUpdateCreatePlan(plan.id, "tarifTTC", val || 0)}
                              style={{ width: "100%" }}
                              min={50}
                              max={10000}
                              step={10}
                              addonAfter="MAD / m"
                              className="font-black text-slate-900 h-10 flex items-center rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddCreatePlan}
                  className="w-full font-bold h-10 rounded-xl mt-3 text-slate-700 hover:text-[#006398] hover:border-[#006398]"
                >
                  + Ajouter une Autre Formule d'Abonnement
                </Button>
              </div>
            )}

            {/* ÉTAPE 5: Récapitulatif Global & Déploiement */}
            {currentCreateStep === 4 && (
              <div>
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined style={{ color: "#16a34a" }} />}
                  message="Étape 5/5 : Récapitulatif & Déploiement Clé en Main"
                  description="Vérifiez l'ensemble des informations saisies. La validation déploiera immédiatement le parking avec son agent référent affecté et ses formules tarifaires opérationnelles."
                  className="rounded-xl border-emerald-200 bg-emerald-50/70 mb-4"
                />

                {(() => {
                  const cap = watchedCreateValues?.capaciteTotale || 450;
                  const pt = watchedCreateValues?.pourcentageTickets ?? 50;
                  const pa = watchedCreateValues?.pourcentageAbonnements ?? 50;
                  const pc = watchedCreateValues?.pourcentageCorporate ?? 60;
                  const pp = watchedCreateValues?.pourcentageParticulier ?? 40;

                  const placesTickets = Math.round((cap * pt) / 100);
                  const placesAbos = Math.round((cap * pa) / 100);
                  const placesCorp = Math.round((placesAbos * pc) / 100);
                  const placesPart = Math.round((placesAbos * pp) / 100);

                  const assignedAgent = agentsDisponibles.find(
                    (a) => a.id === watchedCreateValues?.agentAssigneId
                  );

                  return (
                    <div className="space-y-3">
                      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} className="rounded-xl overflow-hidden">
                        <Descriptions.Item label="Code Parking">
                          <Tag color="blue" className="font-extrabold">{watchedCreateValues?.code?.toUpperCase() || "PRK-NOUVEAU"}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Nom Officiel">
                          <strong className="text-slate-900">{watchedCreateValues?.nom || "Non renseigné"}</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Quartier">
                          {watchedCreateValues?.zone || "Rabat"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Adresse Complète">
                          {watchedCreateValues?.adresse || "Non renseignée"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Coordonnées GPS">
                          {watchedCreateValues?.latitude ?? 34.02088}, {watchedCreateValues?.longitude ?? -6.84165}
                        </Descriptions.Item>
                        <Descriptions.Item label="Capacité Globale">
                          <strong className="text-[#006398] font-black">{cap} places</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tickets Rotation">
                          {pt}% ({placesTickets} places)
                        </Descriptions.Item>
                        <Descriptions.Item label="Abonnements Total">
                          {pa}% ({placesAbos} places)
                        </Descriptions.Item>

                        <Descriptions.Item label="Quota Corporate">
                          <Tag color="purple" className="font-bold">{pc}% ({placesCorp} places)</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Quota Particuliers">
                          <Tag color="blue" className="font-bold">{pp}% ({placesPart} places)</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Type d'Ouvrage">
                          {watchedCreateValues?.typeOuvrage || "Souterrain"} ({watchedCreateValues?.nombreNiveaux || 2} Niveaux)
                        </Descriptions.Item>
                        <Descriptions.Item label="Horaires">
                          {watchedCreateValues?.horairesOuverture || "24h / 24, 7j / 7"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Agent / Superviseur Référent" span={2}>
                          {assignedAgent ? (
                            <div className="flex items-center gap-2">
                              <Tag color={assignedAgent.role === "SUPERVISEUR" ? "gold" : "blue"} className="font-black m-0">
                                {assignedAgent.role}
                              </Tag>
                              <strong className="text-slate-900">{assignedAgent.prenom} {assignedAgent.nom}</strong>
                              <span className="text-slate-500">({assignedAgent.email})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Non affecté</span>
                          )}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Tarifs Summary Table */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center justify-between">
                          <span>Grille Tarifaire Validée ({createPlans.length} Formules Prêtes)</span>
                          <span className="text-[11px] text-[#006398] font-bold">Tarifs Mensuels TTC</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {createPlans.map((plan) => (
                            <div key={plan.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                              <div className="truncate pr-2">
                                <span className="font-bold text-slate-800 truncate block">{plan.libelle}</span>
                                <span className="text-[10px] text-slate-500">{plan.categorie} • {plan.plageHoraire}</span>
                              </div>
                              <Tag color="blue" className="font-black m-0 shrink-0">
                                {plan.tarifTTC} MAD / m
                              </Tag>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2 mt-3">
                  <SafetyCertificateOutlined className="text-emerald-600 text-base" />
                  <span>
                    <strong>Déploiement Clé en Main</strong> : Le parking sera créé avec le statut <strong>En Exploitation</strong>, le compte agent sera immédiatement affecté, et l'ensemble de ses grilles tarifaires sera instantanément actif pour la souscription d'abonnements.
                  </span>
                </div>
              </div>
            )}
          </Form>
        </div>
      </Modal>

      {/* Modal 2: Modifier les Informations d'un Parking */}
      <Modal
        title={
          <div className="flex items-center justify-between gap-2 pr-6">
            <span>
              <EditOutlined style={{ color: "#0284c7" }} /> Caractéristiques & Paramètres : {selectedParking?.nom}
            </span>
            {isEditModeActive ? (
              <Tag color="orange" icon={<UnlockOutlined />} className="font-bold text-xs m-0">
                Mode Révision Actif
              </Tag>
            ) : (
              <Tag color="default" icon={<LockOutlined />} className="font-bold text-xs m-0">
                Lecture Seule (Grisé)
              </Tag>
            )}
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={
          !isEditModeActive ? (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditModalOpen(false)}>Fermer</Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditModeActive(true)}
                style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
              >
                Débloquer la modification
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditModeActive(false)}>Annuler</Button>
              <Button
                type="primary"
                onClick={() => editForm.submit()}
                loading={editMutation.isPending}
                icon={<SaveOutlined />}
                style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
              >
                Enregistrer & Valider avec Motif
              </Button>
            </div>
          )
        }
        width={680}
      >
        <Form form={editForm} layout="vertical" onFinish={(v) => editMutation.mutate(v)}>
          {!isEditModeActive ? (
            <Alert
              type="warning"
              showIcon
              icon={<LockOutlined style={{ color: "#d97706" }} />}
              message="Informations Verrouillées en Lecture Seule"
              description="Toutes les caractéristiques sont grisées et protégées contre toute modification accidentelle. Pour modifier, cliquez sur 'Débloquer la modification' ci-dessous, renseignez le motif officiel et joignez le PV (optionnel)."
              className="rounded-xl border-amber-200 bg-amber-50/70"
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              type="info"
              showIcon
              icon={<UnlockOutlined style={{ color: "#006398" }} />}
              message="Mode Modification Débloqué"
              description="Les champs sont modifiables. Vous devez renseigner le motif officiel justifiant cette modification (obligatoire) avant de valider."
              className="rounded-xl border-blue-200 bg-blue-50/70"
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider titlePlacement="left" style={{ margin: "4px 0 16px" }}>
            <EnvironmentOutlined style={{ color: "#0284c7" }} /> 1. Identification & Localisation GPS
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Code Identifiant Unique" rules={[{ required: true }]}>
                <Input disabled={!isEditModeActive} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nom" label="Nom Officiel du Parking" rules={[{ required: true }]}>
                <Input disabled={!isEditModeActive} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse" label="Adresse Physique Complète" rules={[{ required: true }]}>
            <Input disabled={!isEditModeActive} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude GPS (Google Maps)">
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} step={0.0001} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude GPS (Google Maps)">
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} step={0.0001} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: "16px 0 16px" }}>
            <PieChartOutlined style={{ color: "#0284c7" }} /> 2. Capacité Globale & Quotas d'Attribution
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="capaciteTotale" label="Capacité Globale (Places)" rules={[{ required: true }]}>
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} min={10} max={5000} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageTickets" label="% Reserve Tickets (Rotation Passagers)" rules={[{ required: true }]}>
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageAbonnements" label="% Réservé Abonnements Total" rules={[{ required: true }]}>
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pourcentageCorporate" label="% Quota Abonnements Corporate (Flottes)" rules={[{ required: true }]}>
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pourcentageParticulier" label="% Quota Abonnements Particuliers" rules={[{ required: true }]}>
                <InputNumber disabled={!isEditModeActive} style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          {isEditModeActive && (
            <>
              <Divider titlePlacement="left" style={{ margin: "16px 0 16px" }}>
                <FileProtectOutlined style={{ color: "#006398" }} /> 3. Justification Réglementaire & PV Officiel
              </Divider>

              <Form.Item
                name="motifModification"
                label={
                  <span className="font-bold text-xs text-slate-800">
                    Motif officiel de la modification <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Le motif officiel est obligatoire pour enregistrer une modification" }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ex: Décision du Conseil d'Administration du 15/08/2026, arrêté communal d'extension de capacité..."
                  className="rounded-xl font-medium"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-bold text-xs text-slate-800">
                    Pièce jointe du PV de délibération (Optionnel)
                  </span>
                }
              >
                <Upload
                  beforeUpload={(file) => {
                    message.success(`Document PV joint : ${file.name}`);
                    setAttachedPvName(file.name);
                    return false;
                  }}
                  maxCount={1}
                  onRemove={() => setAttachedPvName(null)}
                >
                  <Button icon={<UploadOutlined />} className="rounded-xl font-semibold">
                    {attachedPvName ? `PV Attaché : ${attachedPvName}` : "Joindre le document PV (PDF / Image - Optionnel)"}
                  </Button>
                </Upload>
                {attachedPvName && (
                  <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <FileProtectOutlined /> Fichier prêt pour enregistrement : {attachedPvName}
                  </div>
                )}
              </Form.Item>
            </>
          )}
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

      {/* Modal 6: Plans Tarifaires par Parking (Responsable) */}
      <ParkingPlansTarifairesModal
        open={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        parking={selectedParkingForPlans}
      />
    </Card>
  );
}