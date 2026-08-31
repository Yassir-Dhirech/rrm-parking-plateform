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
} from "@ant-design/icons";
import { getParkingsMock, mockParkings, recalculerQuotasParking } from "../../../api/adminMock";
import type { Parking } from "../types";
import { ParkingPlansTarifairesModal } from "../../../components/parkings/ParkingPlansTarifairesModal";

const { Title, Text } = Typography;

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

      <Table columns={columns} dataSource={parkings} loading={isLoading} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />

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