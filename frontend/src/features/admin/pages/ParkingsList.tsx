import { useState } from "react";
import { Table, Card, Typography, Button, Tag, Modal, Form, Input, InputNumber, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusOutlined } from "@ant-design/icons";
import { getParkingsMock, mockParkings } from "../../../api/adminMock";
import type { Parking } from "../types";

const { Title } = Typography;

export function ParkingsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: parkings, isLoading } = useQuery({ queryKey: ["admin_parkings"], queryFn: getParkingsMock });

  const createMutation = useMutation({
    mutationFn: async (values: Partial<Parking>) => {
      mockParkings.push({
        id: Date.now(),
        code: values.code!,
        nom: values.nom!,
        adresse: values.adresse!,
        capaciteTotale: values.capaciteTotale!,
        placesReserveesAbonnes: values.placesReserveesAbonnes!,
        actif: true,
      });
    },
    onSuccess: () => {
      message.success("Parking configuré avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_parkings"] });
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const columns = [
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Nom du Parking", dataIndex: "nom", key: "nom" },
    { title: "Adresse", dataIndex: "adresse", key: "adresse" },
    { title: "Capacité Totale", dataIndex: "capaciteTotale", key: "capaciteTotale" },
    { title: "Places Abonnés", dataIndex: "placesReserveesAbonnes", key: "placesReserveesAbonnes" },
    { title: "Statut", dataIndex: "actif", key: "actif", render: (actif: boolean) => <Tag color={actif ? "green" : "red"}>{actif ? "En Exploitation" : "Inactif"}</Tag> },
  ];

  return (
    <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Ajouter un Parking</Button>}>
      <Title level={4}>Référentiel des Parkings RRM</Title>
      <Table columns={columns} dataSource={parkings} loading={isLoading} rowKey="id" />

      <Modal title="Ajouter un Parking" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} confirmLoading={createMutation.isPending}>
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="code" label="Code Parking" rules={[{ required: true }]}>
            <Input placeholder="Ex: PRK-RABAT-01" />
          </Form.Item>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Ex: Parking Bab Rouah" />
          </Form.Item>
          <Form.Item name="adresse" label="Adresse physique" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="capaciteTotale" label="Capacité Totale" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item name="placesReserveesAbonnes" label="Quota Places Abonnés" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}