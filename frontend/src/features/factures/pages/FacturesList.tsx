import { useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, Select, InputNumber, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  FileDoneOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getFacturesMock, creerFactureMock } from "../../../api/facturesMock";
import { getAbonnementsMock } from "../../../api/abonnementsMock";
import type { FactureListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

const { Title, Text } = Typography;

export function FacturesList() {
  const { role, userName } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateForm] = Form.useForm();
  const [selectedMontantTtc, setSelectedMontantTtc] = useState<number>(1440);

  const { data, isLoading } = useQuery({
    queryKey: ["factures"],
    queryFn: getFacturesMock,
  });

  const { data: abonnements } = useQuery({
    queryKey: ["abonnements_for_facture"],
    queryFn: getAbonnementsMock,
  });

  const createMutation = useMutation({
    mutationFn: creerFactureMock,
    onSuccess: (newFacture) => {
      message.success(`Facture ${newFacture.numero} générée avec succès !`);
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      setIsGenerateModalOpen(false);
      generateForm.resetFields();
      navigate(`${basePath}/factures/${newFacture.id}`);
    },
    onError: () => {
      message.error("Erreur lors de la génération de la facture.");
    },
  });

  const handleOpenGenerateModal = () => {
    setSelectedMontantTtc(1440);
    generateForm.setFieldsValue({
      abonnementRef: "ABO-2026-000001",
      clientNom: "Karim El Amrani",
      montantTtc: 1440,
      modePaiement: "ESPECES",
    });
    setIsGenerateModalOpen(true);
  };

  const handleAbonnementSelect = (ref: string) => {
    const found = abonnements?.find((a) => a.reference === ref);
    if (found) {
      const montant = found.type === "ENTREPRISE" ? 54000 : 1440;
      setSelectedMontantTtc(montant);
      generateForm.setFieldsValue({
        abonnementRef: found.reference,
        clientNom: found.clientNom,
        montantTtc: montant,
        modePaiement: found.type === "ENTREPRISE" ? "CHEQUE" : "ESPECES",
      });
    }
  };

  const handleFinishGenerate = (values: any) => {
    createMutation.mutate({
      abonnementReference: values.abonnementRef,
      clientNom: values.clientNom,
      montantTtc: values.montantTtc,
      modePaiement: values.modePaiement,
      genereePar: userName ? `${userName} (${role})` : `Agent RRM (${role})`,
    });
  };

  const columns = [
    {
      title: "Numéro",
      dataIndex: "numero",
      key: "numero",
      render: (num: string, record: FactureListItem) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${basePath}/factures/${record.id}`);
          }}
          style={{ fontWeight: 700, color: "#006398" }}
        >
          {num}
        </a>
      ),
    },
    { title: "Client", dataIndex: "clientNom", key: "clientNom" },
    {
      title: "Montant TTC",
      dataIndex: "montantTtc",
      key: "montantTtc",
      render: (value: number) => (
        <strong style={{ color: "#16a34a" }}>
          {value.toLocaleString("fr-FR")} MAD
        </strong>
      ),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: FactureListItem["statut"]) => <StatusBadge statut={statut} />,
    },
    { title: "Date émission", dataIndex: "dateEmission", key: "dateEmission", render: (d: string) => formatDate(d) },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: FactureListItem) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`${basePath}/factures/${record.id}`)}
          >
            Détail
          </Button>
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => {
              navigate(`${basePath}/factures/${record.id}`);
              setTimeout(() => window.print(), 500);
            }}
            title="Imprimer"
          />
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => message.success(`Téléchargement du PDF pour la facture ${record.numero}`)}
            title="Télécharger PDF"
          />
        </Space>
      ),
    },
  ];

  const montantHt = Math.round((selectedMontantTtc / 1.2) * 100) / 100;
  const montantTva = Math.round((selectedMontantTtc - montantHt) * 100) / 100;

  return (
    <div>
      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenGenerateModal}
            style={{
              backgroundColor: "#006398",
              borderColor: "#006398",
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 99, 152, 0.2)",
            }}
          >
            Générer une Facture
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: "#003566" }}>
            <FileDoneOutlined style={{ marginRight: 8, color: "#006398" }} />
            Gestion des Factures Émises
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Consultez, téléchargez ou générez les factures réglementaires conformes aux encaissements RRM.
          </Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={isLoading}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => navigate(`${basePath}/factures/${record.id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Modal: Générer une Facture */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileDoneOutlined style={{ color: "#006398", fontSize: 20 }} />
            <span style={{ fontWeight: 800, color: "#003566" }}>
              Générer une Facture Officielle RRM
            </span>
          </div>
        }
        open={isGenerateModalOpen}
        onCancel={() => setIsGenerateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleFinishGenerate}
          initialValues={{
            abonnementRef: "ABO-2026-000001",
            clientNom: "Karim El Amrani",
            montantTtc: 1440,
            modePaiement: "ESPECES",
          }}
        >
          <Form.Item
            name="abonnementRef"
            label="Sélectionner l'Abonnement Rattaché"
            rules={[{ required: true, message: "Abonnement requis" }]}
          >
            <Select
              placeholder="Sélectionner un abonnement..."
              onChange={handleAbonnementSelect}
              options={
                abonnements?.map((a) => ({
                  value: a.reference,
                  label: `${a.reference} — ${a.clientNom} (${a.parkingNom})`,
                })) || [
                  { value: "ABO-2026-000001", label: "ABO-2026-000001 — Karim El Amrani (Bab El Had)" },
                  { value: "ABO-2026-000002", label: "ABO-2026-000002 — Société Atlas Trans (Agdal Gare)" },
                ]
              }
            />
          </Form.Item>

          <Form.Item
            name="clientNom"
            label="Client / Raison Sociale"
            rules={[{ required: true, message: "Nom du client requis" }]}
          >
            <Select
              showSearch
              placeholder="Nom du client"
              options={[
                { value: "Karim El Amrani", label: "Karim El Amrani (Particulier)" },
                { value: "Société Atlas Trans", label: "Société Atlas Trans (Corporate)" },
                { value: "Sara Bennis", label: "Sara Bennis (Particulier)" },
                { value: "Rabat Digital Hub", label: "Rabat Digital Hub (Corporate)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="modePaiement"
            label="Mode de Règlement Constaté"
            rules={[{ required: true, message: "Mode de paiement requis" }]}
          >
            <Select
              options={[
                { value: "ESPECES", label: "Espèces (Guichet RRM)" },
                { value: "CHEQUE", label: "Chèque Bancaire (Certifié)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="montantTtc"
            label="Montant Total TTC (MAD)"
            rules={[{ required: true, message: "Montant requis" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              addonAfter="MAD"
              min={100}
              onChange={(val) => setSelectedMontantTtc(val || 0)}
            />
          </Form.Item>

          {/* Dynamic Fiscal Breakdown Box */}
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 6 }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              Décomposition Fiscale Automatisée (TVA Maroc 20%) :
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#475569" }}>Montant Hors Taxe (HT) :</span>
              <strong>{montantHt.toLocaleString("fr-FR")} MAD</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#475569" }}>TVA (20%) :</span>
              <strong style={{ color: "#0284c7" }}>{montantTva.toLocaleString("fr-FR")} MAD</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                borderTop: "1px solid #cbd5e1",
                paddingTop: 4,
                marginTop: 4,
              }}
            >
              <span style={{ fontWeight: 700, color: "#0f172a" }}>Net à Payer (TTC) :</span>
              <strong style={{ color: "#16a34a", fontSize: 15 }}>
                {selectedMontantTtc.toLocaleString("fr-FR")} MAD
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={() => setIsGenerateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
            >
              Émettre & Générer Facture
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}