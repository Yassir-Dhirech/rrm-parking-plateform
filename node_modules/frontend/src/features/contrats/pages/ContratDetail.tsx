import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Descriptions, Button, Space, Table, Modal, Form, Select, DatePicker, Input, message, Spin, Typography, Tag } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContratByIdMock, updateSituationContratMock } from "../../../api/contratsMock";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import dayjs from "dayjs";
import { formatDate } from "../../../lib/dateUtils";

const { Title, Text } = Typography;

export function ContratDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const contratId = Number(id);

  const [isSituationModalOpen, setIsSituationModalOpen] = useState(false);
  const [situationForm] = Form.useForm();
  const [selectedStatut, setSelectedStatut] = useState<string>("SIGNE");

  const { data: contrat, isLoading } = useQuery({
    queryKey: ["contrat", contratId],
    queryFn: () => getContratByIdMock(contratId),
    enabled: !!contratId,
  });

  const updateSituationMutation = useMutation({
    mutationFn: updateSituationContratMock,
    onSuccess: (updated) => {
      message.success(`Situation du contrat ${updated.reference} mise à jour avec succès !`);
      queryClient.invalidateQueries({ queryKey: ["contrat", contratId] });
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
      setIsSituationModalOpen(false);
    },
    onError: () => {
      message.error("Erreur lors de la mise à jour de la situation du contrat.");
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (!contrat) return <Card>Contrat introuvable</Card>;

  const handleOpenSituationModal = () => {
    setSelectedStatut(contrat.statut);
    situationForm.setFieldsValue({
      nouveauStatut: contrat.statut,
      dateSignaturePhysique: contrat.dateSignature ? dayjs(contrat.dateSignature, "DD/MM/YYYY") : dayjs(),
      signataireNom: contrat.signePar || "Direction RRM & Représentant Entreprise",
      referencePhysique: contrat.referencePhysique || `PARAPH-${contrat.reference}`,
      observations: contrat.observations || "",
    });
    setIsSituationModalOpen(true);
  };

  const handleSaveSituation = async () => {
    try {
      const values = await situationForm.validateFields();
      await updateSituationMutation.mutateAsync({
        id: contrat.id,
        nouveauStatut: values.nouveauStatut,
        dateSignaturePhysique: values.dateSignaturePhysique ? values.dateSignaturePhysique.format("DD/MM/YYYY") : undefined,
        signataireNom: values.signataireNom,
        referencePhysique: values.referencePhysique,
        observations: values.observations,
      });
    } catch {
      // Form validation error
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Card
        extra={
          <Space>
            <StatusBadge statut={contrat.statut} />
            {role === "RESPONSABLE" && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleOpenSituationModal}
                style={{
                  backgroundColor: "#006398",
                  borderColor: "#006398",
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                Mettre à jour la Situation
              </Button>
            )}
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0, color: "#003566" }}>
            <FileTextOutlined style={{ marginRight: 8, color: "#006398" }} />
            Contrat Corporate : {contrat.reference}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Convention d'exploitation et stationnement flotte entreprise — 20 Ans
          </Text>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Entreprise">{contrat.entrepriseNom}</Descriptions.Item>
          <Descriptions.Item label="ICE Entreprise">{contrat.iceEntreprise}</Descriptions.Item>
          <Descriptions.Item label="Parking">{contrat.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Nombre de places">{contrat.nombrePlaces} places réservées</Descriptions.Item>
          <Descriptions.Item label="Période de Validité">
            Du {formatDate(contrat.dateDebut)} au {formatDate(contrat.dateFin)}
          </Descriptions.Item>
          <Descriptions.Item label="Montant HT / mois">
            {contrat.montantMensuelHT?.toLocaleString("fr-FR")} MAD
          </Descriptions.Item>
          <Descriptions.Item label="Montant TTC / mois">
            <strong style={{ color: "#047857" }}>{contrat.montantMensuelTTC?.toLocaleString("fr-FR")} MAD</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Situation Actuelle">
            <StatusBadge statut={contrat.statut} />
          </Descriptions.Item>

          {contrat.dateSignature && (
            <Descriptions.Item label="Signature Physique">
              <Space>
                <CheckCircleOutlined style={{ color: "#16a34a" }} />
                <span>Signé physiquement le <strong>{formatDate(contrat.dateSignature)}</strong></span>
              </Space>
            </Descriptions.Item>
          )}

          {contrat.signePar && (
            <Descriptions.Item label="Signataires Habilités">
              {contrat.signePar}
            </Descriptions.Item>
          )}

          {contrat.referencePhysique && (
            <Descriptions.Item label="Classement / Parapheur Physique">
              <Tag color="purple" style={{ fontWeight: 700 }}>{contrat.referencePhysique}</Tag>
            </Descriptions.Item>
          )}

          {contrat.observations && (
            <Descriptions.Item label="Observations & Situation" span={2}>
              {contrat.observations}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title={<Space><FileTextOutlined style={{ color: "#006398" }} /><span>Véhicules Rattachés à la Flotte</span></Space>}>
        <Table
          dataSource={contrat.vehicules}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Immatriculation",
              dataIndex: "immatriculation",
              key: "immatriculation",
              render: (imm: string) => <Tag color="blue" style={{ fontWeight: 700 }}>{imm}</Tag>,
            },
            { title: "Marque", dataIndex: "marque", key: "marque" },
            { title: "Modèle", dataIndex: "modele", key: "modele" },
          ]}
        />
      </Card>

      {/* Modal: Mettre à jour la Situation du Contrat */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: "#006398", fontSize: 20 }} />
            <span style={{ fontWeight: 800, color: "#003566" }}>
              Mettre à Jour la Situation du Contrat {contrat.reference}
            </span>
          </div>
        }
        open={isSituationModalOpen}
        onCancel={() => setIsSituationModalOpen(false)}
        onOk={handleSaveSituation}
        okText="Enregistrer la Situation"
        cancelText="Annuler"
        confirmLoading={updateSituationMutation.isPending}
        okButtonProps={{ style: { backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Les contrats Corporate 20 Ans font l'objet d'une signature physique manuscrite paraphée. Mettez à jour la situation administrative et contractuelle ci-dessous.
          </Text>
        </div>

        <Form form={situationForm} layout="vertical">
          <Form.Item
            name="nouveauStatut"
            label="Situation / Statut du Contrat"
            rules={[{ required: true, message: "Veuillez sélectionner la situation" }]}
          >
            <Select
              onChange={(val) => setSelectedStatut(val)}
              options={[
                {
                  value: "SIGNE",
                  label: (
                    <Space>
                      <CheckCircleOutlined style={{ color: "#16a34a" }} />
                      <span>Signé Physiquement & En Vigueur</span>
                    </Space>
                  ),
                },
                {
                  value: "EN_ATTENTE_SIGNATURE",
                  label: (
                    <Space>
                      <ClockCircleOutlined style={{ color: "#d97706" }} />
                      <span>En Attente de Signature Physique / Paraphes</span>
                    </Space>
                  ),
                },
                {
                  value: "RESILIE",
                  label: (
                    <Space>
                      <StopOutlined style={{ color: "#dc2626" }} />
                      <span>Résilié</span>
                    </Space>
                  ),
                },
                {
                  value: "EXPIRE",
                  label: (
                    <Space>
                      <ClockCircleOutlined style={{ color: "#64748b" }} />
                      <span>Expiré</span>
                    </Space>
                  ),
                },
              ]}
            />
          </Form.Item>

          {selectedStatut === "SIGNE" && (
            <>
              <Form.Item
                name="dateSignaturePhysique"
                label="Date de Signature Physique"
                rules={[{ required: true, message: "Date requise" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="signataireNom"
                label="Signataires Habilités (Direction RRM & Représentant Entreprise)"
                rules={[{ required: true, message: "Nom des signataires requis" }]}
              >
                <Input placeholder="Ex: Directeur Général RRM & Gérant Entreprise" />
              </Form.Item>

              <Form.Item
                name="referencePhysique"
                label="Référence du Parapheur / Dossier Physique"
              >
                <Input placeholder="Ex: DOSSIER-CORP-2026-042 / ARMOIRE-JUR-B" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="observations"
            label="Observations & Notes sur la Situation"
          >
            <Input.TextArea
              rows={3}
              placeholder="Préciser tout détail pertinent sur la remise des exemplaires papier, avenants ou conformité."
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}