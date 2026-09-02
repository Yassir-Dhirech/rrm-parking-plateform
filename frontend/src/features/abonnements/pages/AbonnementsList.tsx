import { useState } from "react";
import { Table, Card, Typography, Tag, Button, Modal, Form, Input, Select, Radio, Checkbox, message, Segmented, Row, Col, Alert } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, SafetyCertificateOutlined, UserOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { getAbonnementsMock, createStaffAbonnementMock, type CreateStaffAbonnementInput } from "../../../api/abonnementsMock";
import type { AbonnementListItem, TypeAbonnement } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { MoroccanPlateInput } from "../../../components/ui/MoroccanPlateInput";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

const { Title, Text } = Typography;
const { Option } = Select;

export function AbonnementsList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [form] = Form.useForm();
  const selectedType = Form.useWatch("type", form);

  const { data = [], isLoading } = useQuery({
    queryKey: ["abonnements"],
    queryFn: getAbonnementsMock,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateStaffAbonnementInput) => createStaffAbonnementMock(input),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["abonnements"] });
      message.success(`Abonnement ${newItem.type === "STAFF" ? "Staff RRM" : "Client"} créé avec succès (${newItem.reference}) !`);
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const handleCreateSubmit = (values: any) => {
    createMutation.mutate({
      type: values.type as TypeAbonnement,
      clientNom: values.clientNom,
      parkingNom: values.parkingNom || "Parking Agdal Gare",
      immatriculation: values.immatriculation || "12345 | أ (A) | 1",
      numeroMatriculeStaff: values.numeroMatriculeStaff,
      dureeMois: values.dureeMois || 12,
      exonereStaff: values.type === "STAFF" ? true : values.exonereStaff,
    });
  };

  const filteredData = data.filter((item) => {
    if (filterType === "ALL") return true;
    if (filterType === "SUSPENDU") return item.statut === "SUSPENDU";
    if (filterType === "EN_ATTENTE") return item.statut === "EN_ATTENTE";
    if (filterType === "ACTIF") return item.statut === "ACTIF";
    return item.type === filterType;
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      sorter: (a: AbonnementListItem, b: AbonnementListItem) => a.reference.localeCompare(b.reference),
      render: (ref: string) => <strong>{ref}</strong>,
    },
    {
      title: "Type d'Abonnement",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Staff RRM", value: "STAFF" },
        { text: "Régulier", value: "REGULIER" },
        { text: "Entreprise", value: "ENTREPRISE" },
      ],
      onFilter: (value: any, record: AbonnementListItem) => record.type === value,
      render: (value: TypeAbonnement) => {
        if (value === "STAFF") {
          return (
            <Tag color="gold" style={{ fontWeight: 600, padding: "2px 8px" }}>
              <SafetyCertificateOutlined style={{ marginRight: 4 }} /> Staff RRM
            </Tag>
          );
        }
        if (value === "ENTREPRISE") {
          return <Tag color="purple">Entreprise</Tag>;
        }
        return <Tag color="blue">Régulier</Tag>;
      },
    },
    {
      title: "Client / Bénéficiaire",
      dataIndex: "clientNom",
      key: "clientNom",
      sorter: (a: AbonnementListItem, b: AbonnementListItem) => a.clientNom.localeCompare(b.clientNom),
    },
    {
      title: "Parking d'Attache",
      dataIndex: "parkingNom",
      key: "parkingNom",
      filters: [
        { text: "Parking Agdal Gare", value: "Parking Agdal Gare" },
        { text: "Parking Bab El Had", value: "Parking Bab El Had" },
        { text: "Parking Hassan II", value: "Parking Hassan II" },
        { text: "Parking Chellah", value: "Parking Chellah" },
      ],
      onFilter: (value: any, record: AbonnementListItem) => record.parkingNom.includes(value as string),
      filterSearch: true,
      sorter: (a: AbonnementListItem, b: AbonnementListItem) => a.parkingNom.localeCompare(b.parkingNom),
    },
    {
      title: "Créé / Traité Par",
      dataIndex: "traiteParNom",
      key: "traiteParNom",
      filters: [
        { text: "Traité", value: "TRAITE" },
        { text: "Non Traité", value: "NON_TRAITE" },
      ],
      onFilter: (value: any, record: AbonnementListItem) => {
        if (value === "NON_TRAITE") return !record.traiteParNom;
        return !!record.traiteParNom;
      },
      render: (agentNom?: string) => {
        if (!agentNom) {
          return (
            <Tag color="volcano" icon={<ExclamationCircleOutlined />} style={{ fontWeight: 600 }}>
              Non Traité (Inactif)
            </Tag>
          );
        }
        return (
          <Tag color="cyan" style={{ fontWeight: 600 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {agentNom}
          </Tag>
        );
      },
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      filters: [
        { text: "Actif", value: "ACTIF" },
        { text: "En Attente de Traitement", value: "EN_ATTENTE" },
        { text: "Expiré", value: "EXPIRE" },
        { text: "Suspendu", value: "SUSPENDU" },
      ],
      onFilter: (value: any, record: AbonnementListItem) => record.statut === value,
      render: (statut: AbonnementListItem["statut"]) => {
        if (statut === "EN_ATTENTE") {
          return (
            <Tag color="gold" icon={<ClockCircleOutlined />} style={{ fontWeight: 600 }}>
              En attente traitement opérateur
            </Tag>
          );
        }
        return <StatusBadge statut={statut} />;
      },
    },
    {
      title: "Date Début",
      dataIndex: "dateDebut",
      key: "dateDebut",
      sorter: (a: AbonnementListItem, b: AbonnementListItem) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime(),
      render: (d: string) => formatDate(d),
    },
    {
      title: "Date Expiration",
      dataIndex: "dateFin",
      key: "dateFin",
      sorter: (a: AbonnementListItem, b: AbonnementListItem) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime(),
      render: (d: string) => formatDate(d),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: AbonnementListItem) => {
        if (record.statut === "EN_ATTENTE") {
          return (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${basePath}/abonnements/${record.id}`);
              }}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700 }}
              className="rounded-lg"
            >
              Traiter & Activer
            </Button>
          );
        }
        return (
          <Button
            size="small"
            type="default"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${basePath}/abonnements/${record.id}`);
            }}
            className="rounded-lg font-semibold"
          >
            Consulter
          </Button>
        );
      },
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion des Abonnements</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Consulter les abonnements actifs, en attente de traitement et créer des abonnements Staff RRM / Admin.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.setFieldsValue({ type: "STAFF", dureeMois: 12, exonereStaff: true, parkingNom: "Parking Agdal Gare" });
            setIsModalOpen(true);
          }}
          style={{ backgroundColor: "#003566", borderColor: "#003566" }}
        >
          Créer un Abonnement Staff / Admin
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Segmented
          options={[
            { label: `Tous (${data.length})`, value: "ALL" },
            { label: `En Attente (${data.filter((i) => i.statut === "EN_ATTENTE").length})`, value: "EN_ATTENTE" },
            { label: `Actifs (${data.filter((i) => i.statut === "ACTIF").length})`, value: "ACTIF" },
            { label: `Staff RRM (${data.filter((i) => i.type === "STAFF").length})`, value: "STAFF" },
            { label: `Réguliers (${data.filter((i) => i.type === "REGULIER").length})`, value: "REGULIER" },
            { label: `Entreprises (${data.filter((i) => i.type === "ENTREPRISE").length})`, value: "ENTREPRISE" },
            { label: `Suspendus (${data.filter((i) => i.statut === "SUSPENDU").length})`, value: "SUSPENDU" },
          ]}
          value={filterType}
          onChange={(val) => setFilterType(val as string)}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        scroll={{ x: 1300 }}
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/abonnements/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      {/* Creation Modal for Admin / Staff */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: "#d97706", fontSize: 20 }} />
            <span>Création d'un Abonnement Back-Office</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
      >
        <Alert
          message="Accès Admin / Superviseur RRM"
          description="Ce formulaire est réservé à la création interne des abonnements Staff RRM exonérés ou des abonnements souscrits au guichet."
          type="warning"
          showIcon
          style={{ marginBottom: 20, marginTop: 12 }}
        />

        <Form form={form} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item name="type" label="Type d'Abonnement" rules={[{ required: true }]}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="STAFF">Staff RRM</Radio.Button>
              <Radio.Button value="REGULIER">Régulier</Radio.Button>
              <Radio.Button value="ENTREPRISE">Entreprise</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clientNom" label="Nom du Bénéficiaire / Agent" rules={[{ required: true, message: "Saisissez le nom" }]}>
                <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="Ex: Youssef Tazi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="numeroMatriculeStaff" label="N° Matricule / CIN">
                <Input placeholder="Ex: STF-2026-889" />
              </Form.Item>
            </Col>
          </Row>

          {/* Parking Selection Row */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="parkingNom" label="Parking d'Attache" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner le parking">
                  <Option value="Parking Agdal Gare">Parking Agdal Gare</Option>
                  <Option value="Parking Bab El Had">Parking Bab El Had</Option>
                  <Option value="Parking Hassan II">Parking Hassan II</Option>
                  <Option value="Parking Chellah">Parking Chellah</Option>
                  <Option value="Tous Parkings — Pass Staff Régional">Tous Parkings — Pass Régional</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Independent Full-Width Row for Moroccan Plate Input */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="immatriculation" label="Matricule du Véhicule LPR" rules={[{ required: true, message: "L'immatriculation est requise." }]}>
                <MoroccanPlateInput />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {selectedType === "ENTREPRISE" ? (
                <Form.Item name="dureeMois" label="Durée de Contrat Entreprise" initialValue={240}>
                  <Input
                    readOnly
                    value="20 Ans — Longue Durée"
                    style={{ fontWeight: "bold", color: "#7e22ce", backgroundColor: "#f3e8ff", borderColor: "#d8b4fe" }}
                  />
                </Form.Item>
              ) : (
                <Form.Item name="dureeMois" label="Durée de Validité" rules={[{ required: true }]}>
                  <Select>
                    <Option value={3}>3 Mois</Option>
                    <Option value={6}>6 Mois</Option>
                    <Option value={9}>9 Mois</Option>
                    <Option value={12}>12 Mois / 1 An</Option>
                  </Select>
                </Form.Item>
              )}
            </Col>
            <Col span={12}>
              <Form.Item name="exonereStaff" valuePropName="checked" label="Facturation / Exonération">
                <Checkbox defaultChecked style={{ marginTop: 6 }}>
                  Exonération Staff 100% — 0 MAD TTC
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
            <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              style={{ backgroundColor: "#003566", borderColor: "#003566" }}
            >
              Enregistrer l'Abonnement
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}