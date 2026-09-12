import { useState } from "react";
import { Modal, Form, Input, Select, Button, Alert, Tag, Space, Typography, Result, Divider } from "antd";
import { AlertOutlined, SendOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getParkingsMock } from "../../../api/adminMock";
import { creerReclamationMock } from "../../../api/reclamationsMock";
import { CATEGORIES_RECLAMATION_LABELS, type CategorieReclamation, type PublicReclamationInput, type ReclamationItem } from "../types";

const { Paragraph } = Typography;
const { Option } = Select;

interface PublicReclamationModalProps {
  open: boolean;
  onClose: () => void;
}

export function PublicReclamationModal({ open, onClose }: PublicReclamationModalProps) {
  const [form] = Form.useForm();
  const [createdReclamation, setCreatedReclamation] = useState<ReclamationItem | null>(null);

  const { data: parkings = [] } = useQuery({
    queryKey: ["admin_parkings"],
    queryFn: getParkingsMock,
    enabled: open,
  });

  const submitMutation = useMutation({
    mutationFn: (values: PublicReclamationInput) => creerReclamationMock(values),
    onSuccess: (data) => {
      setCreatedReclamation(data);
      form.resetFields();
    },
  });

  const handleSubmit = (values: any) => {
    const selectedParking = parkings.find((p) => p.id === values.parkingId);
    submitMutation.mutate({
      nomPrenom: values.nomPrenom,
      email: values.email,
      telephone: values.telephone,
      parkingId: values.parkingId,
      parkingNom: selectedParking?.nom || "Parking Agdal Gare",
      typeReclamation: values.typeReclamation as CategorieReclamation,
      numeroTicketOuCarte: values.numeroTicketOuCarte,
      immatriculation: values.immatriculation,
      descriptionDetaillee: values.descriptionDetaillee,
    });
  };

  const handleCloseModal = () => {
    setCreatedReclamation(null);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <AlertOutlined style={{ color: "#ef4444" }} />
          <span>Espace Réclamation & Incident Client — Rabat Région Mobilité</span>
        </Space>
      }
      open={open}
      onCancel={handleCloseModal}
      footer={null}
      width={720}
      destroyOnClose
    >
      {createdReclamation ? (
        <Result
          status="success"
          title="Réclamation Déposée avec Succès !"
          subTitle={
            <div>
              <Paragraph style={{ fontSize: 15 }}>
                Votre demande d'assistance / réclamation a été enregistrée sous la référence officielle :
              </Paragraph>
              <Tag color="red" style={{ fontSize: 18, padding: "6px 16px", borderRadius: 8, fontWeight: 700, margin: "10px 0" }}>
                N° Suivi : {createdReclamation.reference}
              </Tag>
              <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 12 }}>
                Un accusé de réception a été transmis à l'adresse <strong>{createdReclamation.email}</strong>. Les agents d'exploitation du {createdReclamation.parkingNom} traitent votre dossier prioritairement.
              </Paragraph>
            </div>
          }
          extra={[
            <Button type="primary" key="ok" onClick={handleCloseModal} style={{ backgroundColor: "#003566", borderRadius: 8 }}>
              Fermer et Retourner à l'Accueil
            </Button>,
          ]}
        />
      ) : (
        <>
          <Alert
            type="info"
            showIcon
            message="Assistance Usagers 24/7 — Rabat Région Mobilité"
            description="Sélectionnez le motif exact de votre réclamation. Votre signalement sera transmis directement au chef de gare et aux agents du parking concerné pour résolution."
            style={{ marginBottom: 20, borderRadius: 8 }}
          />

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="typeReclamation"
              label={<span style={{ fontWeight: 600 }}>Motif / Cas de la Réclamation :</span>}
              rules={[{ required: true, message: "Veuillez sélectionner le cas de votre réclamation." }]}
            >
              <Select placeholder="Choisissez le type d'incident ou de contestation..." size="large">
                {Object.entries(CATEGORIES_RECLAMATION_LABELS).map(([key, item]) => (
                  <Option key={key} value={key}>
                    <div style={{ padding: "4px 0" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{item.description}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider style={{ margin: "16px 0" }} />

            <Form.Item
              name="parkingId"
              label={<span style={{ fontWeight: 600 }}>Parking Concerné par l'Incident :</span>}
              rules={[{ required: true, message: "Veuillez sélectionner le parking." }]}
            >
              <Select placeholder="Sélectionnez le parking de stationnement..." size="large">
                {parkings.map((p) => (
                  <Option key={p.id} value={p.id}>
                    <strong>{p.nom}</strong> ({p.code}) — {p.adresse}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="nomPrenom"
              label={<span style={{ fontWeight: 600 }}>Nom & Prénom du Client :</span>}
              rules={[{ required: true, message: "Veuillez indiquer votre nom complet." }]}
            >
              <Input placeholder="Ex: M. Karim El Amrani" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600 }}>Adresse Email de Contact :</span>}
              rules={[
                { required: true, message: "Veuillez saisir votre email." },
                { type: "email", message: "Email invalide." },
              ]}
            >
              <Input placeholder="Ex: exemple@domaine.ma" size="large" />
            </Form.Item>

            <Form.Item
              name="telephone"
              label={<span style={{ fontWeight: 600 }}>Numéro de Téléphone (GSM) :</span>}
              rules={[{ required: true, message: "Veuillez indiquer votre numéro de téléphone." }]}
            >
              <Input placeholder="Ex: 06 12 34 56 78" size="large" />
            </Form.Item>

            <Form.Item
              name="immatriculation"
              label={<span style={{ fontWeight: 600 }}>Plaque d'Immatriculation du Véhicule (Facultatif) :</span>}
            >
              <Input placeholder="Ex: 12345-A-6" size="large" />
            </Form.Item>

            <Form.Item
              name="numeroTicketOuCarte"
              label={<span style={{ fontWeight: 600 }}>N° Ticket de Caisse / N° Carte Abonné (Facultatif) :</span>}
            >
              <Input placeholder="Ex: TCK-9912019 ou ABO-2026-000001" size="large" />
            </Form.Item>

            <Form.Item
              name="descriptionDetaillee"
              label={<span style={{ fontWeight: 600 }}>Description Détaillée de l'Incident :</span>}
              rules={[{ required: true, message: "Veuillez décrire le problème rencontré." }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Explicitez les circonstances de l'incident (heure exacte, borne concernée, montant prélevé, barrière bloquée...)"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <Button onClick={handleCloseModal} size="large">
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  size="large"
                  loading={submitMutation.isPending}
                  style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", fontWeight: 600 }}
                >
                  Transmettre la Réclamation en Ligne
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
