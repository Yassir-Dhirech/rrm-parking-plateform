import { useState } from "react";
import { Table, Card, Typography, Tag, Button, Modal, Form, Input, Select, Radio, Checkbox, message, Segmented, Row, Col, Alert } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, SafetyCertificateOutlined, UserOutlined, CarOutlined } from "@ant-design/icons";
import { getAbonnementsMock, createStaffAbonnementMock, type CreateStaffAbonnementInput } from "../../../api/abonnementsMock";
import type { AbonnementListItem, TypeAbonnement } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

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
      immatriculation: values.immatriculation || "STF-123",
      numeroMatriculeStaff: values.numeroMatriculeStaff,
      dureeMois: values.dureeMois || 12,
      exonereStaff: values.type === "STAFF" ? true : values.exonereStaff,
    });
  };

  const filteredData = data.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => <strong>{ref}</strong>,
    },
    {
      title: "Type d'Abonnement",
      dataIndex: "type",
      key: "type",
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
    { title: "Client / Bénéficiaire", dataIndex: "clientNom", key: "clientNom" },
    { title: "Parking d'Attache", dataIndex: "parkingNom", key: "parkingNom" },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: AbonnementListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Date Début", dataIndex: "dateDebut", key: "dateDebut" },
    { title: "Date Expiration", dataIndex: "dateFin", key: "dateFin" },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion des Abonnements</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Consulter les abonnements actifs, renouvelés et créer des abonnements Staff RRM / Admin.
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
            { label: `⭐ Staff RRM (${data.filter((i) => i.type === "STAFF").length})`, value: "STAFF" },
            { label: `Réguliers (${data.filter((i) => i.type === "REGULIER").length})`, value: "REGULIER" },
            { label: `Entreprises (${data.filter((i) => i.type === "ENTREPRISE").length})`, value: "ENTREPRISE" },
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
            <span>Création d'un Abonnement Back-Office (Staff / Admin)</span>
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
              <Radio.Button value="STAFF">⭐ Staff RRM (Personnel)</Radio.Button>
              <Radio.Button value="REGULIER">Régulier (Particulier)</Radio.Button>
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parkingNom" label="Parking d'Attache" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner le parking">
                  <Option value="Parking Agdal Gare">Parking Agdal Gare</Option>
                  <Option value="Parking Bab El Had">Parking Bab El Had</Option>
                  <Option value="Parking Hassan II">Parking Hassan II</Option>
                  <Option value="Parking Chellah">Parking Chellah</Option>
                  <Option value="Tous Parkings (Pass Staff Régional)">Tous Parkings (Pass Régional)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="immatriculation" label="Plaque Véhicule (LPR)" rules={[{ required: true, message: "Plaque requise" }]}>
                <Input prefix={<CarOutlined style={{ color: "#94a3b8" }} />} placeholder="Ex: 12345-A-6" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dureeMois" label="Durée de Validité" rules={[{ required: true }]}>
                <Select>
                  <Option value={1}>1 Mois</Option>
                  <Option value={3}>3 Mois</Option>
                  <Option value={6}>6 Mois</Option>
                  <Option value={12}>12 Mois (1 An)</Option>
                  <Option value={24}>24 Mois (2 Ans)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="exonereStaff" valuePropName="checked" label="Facturation / Exonération">
                <Checkbox defaultChecked style={{ marginTop: 6 }}>
                  Exonération Staff 100% (0 MAD TTC)
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