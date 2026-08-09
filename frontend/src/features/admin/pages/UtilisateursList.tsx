import { useState } from "react";
import { Table, Card, Typography, Button, Tag, Modal, Form, Input, Select, Switch, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAddOutlined } from "@ant-design/icons";
import { getParkingsMock, getUtilisateursMock, mockUtilisateurs } from "../../../api/adminMock";
import type{ Utilisateur } from "../types";
import type { Role } from "../../../lib/roleConfig";

const { Title } = Typography;

export function UtilisateursList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: utilisateurs, isLoading } = useQuery({ queryKey: ["admin_utilisateurs"], queryFn: getUtilisateursMock });
  const { data: parkings } = useQuery({ queryKey: ["admin_parkings"], queryFn: getParkingsMock });

  const createMutation = useMutation({
    mutationFn: async (values: Partial<Utilisateur>) => {
      mockUtilisateurs.push({
        id: Date.now(),
        nom: values.nom!,
        prenom: values.prenom!,
        email: values.email!,
        role: values.role!,
        parkingAssigneId: values.parkingAssigneId,
        parkingAssigneNom: parkings?.find((p) => p.id === values.parkingAssigneId)?.nom,
        actif: true,
        dateCreation: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      message.success("Utilisateur créé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_utilisateurs"] });
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const columns = [
    { title: "Nom & Prénom", render: (_: unknown, r: Utilisateur) => `${r.nom} ${r.prenom}` },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rôle", dataIndex: "role", key: "role", render: (role: Role) => <Tag color="blue">{role}</Tag> },
    { title: "Parking Assigné", dataIndex: "parkingAssigneNom", key: "parkingAssigneNom", render: (v?: string) => v || "Tous (National)" },
    { title: "Statut", dataIndex: "actif", key: "actif", render: (actif: boolean) => <Tag color={actif ? "green" : "red"}>{actif ? "Actif" : "Inactif"}</Tag> },
  ];

  return (
    <Card extra={<Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>Nouvel Utilisateur</Button>}>
      <Title level={4}>Gestion des Utilisateurs</Title>
      <Table columns={columns} dataSource={utilisateurs} loading={isLoading} rowKey="id" />

      <Modal
        title="Ajouter un Utilisateur"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email professionnel" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Rôle Système" rules={[{ required: true }]}>
            <Select options={[
              { value: "AGENT", label: "Agent de Saisie" },
              { value: "SUPERVISEUR", label: "Superviseur" },
              { value: "RESPONSABLE", label: "Responsable Direction" },
              { value: "COMPTABLE", label: "Comptable" },
              { value: "RESP_REPORTING", label: "Resp. Reporting" },
              { value: "ADMIN_SI", label: "Administrateur SI" },
            ]} />
          </Form.Item>
          <Form.Item name="parkingAssigneId" label="Parking Rattaché (Optionnel)">
            <Select allowClear options={parkings?.map((p) => ({ value: p.id, label: p.nom }))} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}