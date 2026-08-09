import { useState } from "react";
import { Table, Card, Typography, Button, Tag, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import { getTarifsMock, mockTarifs } from "../../../api/adminMock";
import type{ PlanTarifaire } from "../types";

const { Title } = Typography;

export function PlansTarifairesList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["admin_tarifs"],
    queryFn: getTarifsMock,
  });

  const createMutation = useMutation({
    mutationFn: async (values: Partial<PlanTarifaire>) => {
      const tarifHT = values.tarifHT || 0;
      const tarifTTC = tarifHT * 1.2; // Calcul automatique TVA 20%

      mockTarifs.push({
        id: Date.now(),
        libelle: values.libelle!,
        typeAbonnement: values.typeAbonnement!,
        dureeMois: values.dureeMois!,
        tarifHT,
        tarifTTC,
        actif: true,
      });
    },
    onSuccess: () => {
      message.success("Plan tarifaire créé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_tarifs"] });
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const columns = [
    { title: "Libellé de l'offre", dataIndex: "libelle", key: "libelle" },
    {
      title: "Type",
      dataIndex: "typeAbonnement",
      key: "typeAbonnement",
      render: (type: PlanTarifaire["typeAbonnement"]) => (
        <Tag color={type === "CORPORATE" ? "purple" : "blue"}>{type}</Tag>
      ),
    },
    { title: "Durée", dataIndex: "dureeMois", key: "dureeMois", render: (m: number) => `${m} mois` },
    {
      title: "Tarif HT",
      dataIndex: "tarifHT",
      key: "tarifHT",
      render: (v: number) => `${v.toLocaleString("fr-FR")} MAD`,
    },
    {
      title: "Tarif TTC (20%)",
      dataIndex: "tarifTTC",
      key: "tarifTTC",
      render: (v: number) => <strong>{v.toLocaleString("fr-FR")} MAD</strong>,
    },
    {
      title: "Statut",
      dataIndex: "actif",
      key: "actif",
      render: (actif: boolean) => (
        <Tag color={actif ? "green" : "red"}>{actif ? "Actif" : "Inactif"}</Tag>
      ),
    },
  ];

  return (
    <Card
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Nouveau Plan Tarifaire
        </Button>
      }
    >
      <Title level={4}>Grille des Plans Tarifaires</Title>
      <Table columns={columns} dataSource={tarifs} loading={isLoading} rowKey="id" />

      <Modal
        title="Créer un Plan Tarifaire"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="libelle" label="Libellé de l'offre" rules={[{ required: true }]}>
            <Input placeholder="Ex: Pass Mensuel Agdal Gare" />
          </Form.Item>
          <Form.Item name="typeAbonnement" label="Type d'abonnement" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "PARTICULIER", label: "Particulier (Individuel)" },
                { value: "CORPORATE", label: "Corporate (Entreprise)" },
              ]}
            />
          </Form.Item>
          <Form.Item name="dureeMois" label="Durée (en mois)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} max={36} placeholder="Ex: 1, 3, 6, 12" />
          </Form.Item>
          <Form.Item name="tarifHT" label="Tarif Hors Taxe (MAD)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={50} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}