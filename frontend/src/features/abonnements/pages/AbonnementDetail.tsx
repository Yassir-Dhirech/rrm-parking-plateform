import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Modal, Form, Input, Select, Alert, Tag, Space, message, Breadcrumb, Typography } from "antd";
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { getAbonnementByIdMock, suspendAbonnementMock, reactivateAbonnementMock } from "../../../api/abonnementsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

const { Option } = Select;
const { Text } = Typography;

export function AbonnementDetail() {
  const { id } = useParams<{ id: string }>();
  const abonnementId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const isAuthorizedToSuspend = role === "SUPERVISEUR" || role === "RESPONSABLE" || role === "ADMIN_SI";

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["abonnement", abonnementId],
    queryFn: () => getAbonnementByIdMock(abonnementId),
  });

  const suspendMutation = useMutation({
    mutationFn: (motif: string) => suspendAbonnementMock({ id: abonnementId, motif }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["abonnement", abonnementId], updated);
      queryClient.invalidateQueries({ queryKey: ["abonnements"] });
      message.warning(`Abonnement ${updated.reference} suspendu avec succès.`);
      setIsSuspendModalOpen(false);
      suspendForm.resetFields();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateAbonnementMock(abonnementId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["abonnement", abonnementId], updated);
      queryClient.invalidateQueries({ queryKey: ["abonnements"] });
      message.success(`Abonnement ${updated.reference} réactivé avec succès !`);
    },
  });

  const handleSuspendSubmit = (values: { motif: string; motifAutre?: string }) => {
    const finalMotif = values.motif === "AUTRE" ? values.motifAutre || "Autre motif administratif" : values.motif;
    suspendMutation.mutate(finalMotif);
  };

  if (isLoading || !data) {
    return <Card loading />;
  }

  const isSuspended = data.statut === "SUSPENDU";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate(`${basePath}/dashboard`)}><HomeOutlined /> Tableau de bord</a> },
          { title: <a onClick={() => navigate(`${basePath}/abonnements`)}>Abonnements</a> },
          { title: data.reference },
        ]}
      />

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`${basePath}/abonnements`)}>
                Retour
              </Button>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#003566" }}>
                Abonnement {data.reference}
              </span>
              <StatusBadge statut={data.statut} />
              {data.type === "STAFF" && (
                <Tag color="gold" style={{ fontWeight: 600 }}>
                  <SafetyCertificateOutlined style={{ marginRight: 4 }} /> Staff RRM
                </Tag>
              )}
            </div>

            {/* Supervisor & Responsable Action Buttons */}
            {isAuthorizedToSuspend && (
              <Space>
                {!isSuspended ? (
                  <Button
                    type="primary"
                    danger
                    icon={<PauseCircleOutlined />}
                    onClick={() => setIsSuspendModalOpen(true)}
                    style={{ fontWeight: 600 }}
                  >
                    Suspendre l'Abonnement
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={reactivateMutation.isPending}
                    onClick={() => reactivateMutation.mutate()}
                    style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 600 }}
                  >
                    Réactiver l'Abonnement
                  </Button>
                )}
              </Space>
            )}
          </div>
        }
      >
        {isSuspended && (
          <Alert
            message="Attention : Abonnement Actuellement Suspendu"
            description={
              <div>
                <div><strong>Motif de suspension :</strong> {data.motifSuspension || "Suspension administrative"}</div>
                <div style={{ fontSize: 12, marginTop: 4, color: "#b45309" }}>
                  ⚠️ L'accès aux barrières automatiques RFID / LPR de tous les parkings est temporairement bloqué pour cet abonné.
                </div>
              </div>
            }
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 20, borderRadius: 10, border: "1px solid #fcd34d", backgroundColor: "#fef3c7" }}
          />
        )}

        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="Statut">
            <StatusBadge statut={data.statut} />
          </Descriptions.Item>

          <Descriptions.Item label="Type d'Abonnement">
            {data.type === "STAFF" ? (
              <Tag color="gold">Staff RRM / Personnel</Tag>
            ) : data.type === "REGULIER" ? (
              <Tag color="blue">Régulier (Particulier)</Tag>
            ) : (
              <Tag color="purple">Entreprise</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Client / Bénéficiaire">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="Parking d'Attache">
            {data.parkingNom}
          </Descriptions.Item>

          <Descriptions.Item label="Date de Début">{data.dateDebut}</Descriptions.Item>
          <Descriptions.Item label="Date d'Expiration">{data.dateFin}</Descriptions.Item>

          {data.vehiculeImmatriculation && (
            <Descriptions.Item label="Immatriculation Véhicule (LPR)">
              <Tag color="geekblue">{data.vehiculeImmatriculation}</Tag>
            </Descriptions.Item>
          )}

          {data.planTarifaireNom && (
            <Descriptions.Item label="Formule Tarifaire">{data.planTarifaireNom}</Descriptions.Item>
          )}

          <Descriptions.Item label="Montant Total TTC">
            <strong style={{ fontSize: "1.1rem", color: data.type === "STAFF" ? "#0284c7" : "#16a34a" }}>
              {data.montantTotal} MAD TTC
            </strong>
          </Descriptions.Item>

          {data.motifSuspension && (
            <Descriptions.Item label="Historique Suspension" span={2}>
              <Text type="danger">⛔ {data.motifSuspension}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Modal de Confirmation de Suspension */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
            <PauseCircleOutlined style={{ fontSize: 22 }} />
            <span>Suspendre l'Abonnement {data.reference}</span>
          </div>
        }
        open={isSuspendModalOpen}
        onCancel={() => setIsSuspendModalOpen(false)}
        footer={null}
      >
        <Alert
          message="Action de Suspension (Accès Superviseur / Responsable)"
          description="La suspension désactivera immédiatement l'accès RFID et la lecture de plaque LPR aux barrières des parkings."
          type="error"
          showIcon
          style={{ marginBottom: 20, marginTop: 10 }}
        />

        <Form form={suspendForm} layout="vertical" onFinish={handleSuspendSubmit}>
          <Form.Item
            name="motif"
            label="Motif de la suspension"
            rules={[{ required: true, message: "Sélectionnez ou précisez un motif" }]}
            initialValue="Impayé / Défaut de paiement"
          >
            <Select size="large">
              <Option value="Impayé / Défaut de paiement">Impayé / Défaut de paiement</Option>
              <Option value="Non-respect du règlement intérieur du parking">Non-respect du règlement intérieur du parking</Option>
              <Option value="Perte ou vol du badge RFID">Perte ou vol du badge RFID</Option>
              <Option value="Demande expresse de l'abonné">Demande expresse de l'abonné</Option>
              <Option value="Vérification administrative / Fraude suspicion">Vérification administrative / Suspicion de fraude</Option>
              <Option value="AUTRE">Autre motif (préciser ci-dessous)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.motif !== currentValues.motif}
          >
            {({ getFieldValue }) =>
              getFieldValue("motif") === "AUTRE" ? (
                <Form.Item name="motifAutre" label="Détail du motif" rules={[{ required: true, message: "Précisez le motif" }]}>
                  <Input.TextArea rows={3} placeholder="Saisir la raison détaillée de la suspension..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsSuspendModalOpen(false)}>Annuler</Button>
            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={suspendMutation.isPending}
              icon={<PauseCircleOutlined />}
            >
              Confirmer la Suspension
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}