import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Select,
  InputNumber,
  message,
  Tag,
  Divider,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ArrowLeftOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  getDemandeByIdMock,
  validerDemandeMock,
  rejeterDemandeMock,
} from "../../../api/demandesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { type PaymentInfoInput } from "../types";

const BANK_OPTIONS = [
  { label: "CIH Bank", value: "CIH" },
  { label: "Attijariwafa Bank", value: "ATTIJARI" },
  { label: "BMCE Bank of Africa", value: "BMCE" },
  { label: "Société Générale", value: "SOCIETE GENERALE" },
  { label: "Banque Populaire", value: "BANQUE POPULAIRE" },
  { label: "Al Barid Bank", value: "AL BARID" },
  { label: "Autre", value: "Autre" },
];

export function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const demandeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, userName } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectType, setRejectType] = useState<"DOSSIER" | "PAIEMENT">("DOSSIER");
  const [raison, setRaison] = useState("");
  
  const [paymentForm] = Form.useForm<PaymentInfoInput>();
  // Form.useWatch reactively tracks the selected payment mode without state desync!
  const currentPaymentMode = Form.useWatch("modePaiement", paymentForm) ?? "ESPECES";

  const { data, isLoading } = useQuery({
    queryKey: ["demande", demandeId],
    queryFn: () => getDemandeByIdMock(demandeId),
    enabled: !isNaN(demandeId),
  });

  const validerMutation = useMutation<void, Error, PaymentInfoInput | undefined>({
    mutationFn: (payInput?: PaymentInfoInput) =>
      validerDemandeMock(demandeId, payInput, `${userName ?? "Utilisateur"} (${role})`),
    onSuccess: () => {
      message.success("Demande et traitement de dossier validés avec succès");
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: () => rejeterDemandeMock(demandeId, `[Refus ${rejectType}] ${raison}`),
    onSuccess: () => {
      message.success(`Demande rejetée (${rejectType === "PAIEMENT" ? "Paiement non conforme" : "Dossier non conforme"})`);
      setRejectModalOpen(false);
      setRaison("");
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canAct = (role === "AGENT" || role === "SUPERVISEUR") && (data.statut === "SOUMISE" || data.statut === "EN_COURS");

  const handleOpenPaymentModal = () => {
    paymentForm.resetFields();
    setPaymentModalOpen(true);
  };

  const handleOpenRejectModal = (type: "DOSSIER" | "PAIEMENT") => {
    setRejectType(type);
    setRejectModalOpen(true);
  };

  const handlePaymentSubmit = (values: PaymentInfoInput) => {
    validerMutation.mutate(values);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`${basePath}/demandes`)}
        style={{ marginBottom: 16 }}
      >
        Retour à la liste des demandes
      </Button>

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Traitement de la Demande: {data.reference}</span>
            <StatusBadge statut={data.statut} />
          </div>
        }
      >
        {data.statut === "REJETEE" && data.raisonRejet && (
          <Alert
            type="error"
            message="Motif du rejet"
            description={data.raisonRejet}
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Descriptions title="Informations de la Demande Client" column={2} bordered size="small">
          <Descriptions.Item label="Type de Demande">
            <Tag color="purple">
              {data.typeDemande === "NOUVEL_ABONNEMENT" ? "Nouvel Abonnement" : "Renouvellement"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nom du Client">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Parking Concerné">{data.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Email de Contact">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Téléphone">{data.telephone}</Descriptions.Item>
          <Descriptions.Item label="Immatriculation Véhicule">
            <Tag color="cyan">{data.immatriculation}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type de Véhicule">{data.typeVehicule}</Descriptions.Item>
          <Descriptions.Item label="Date Soumission">{data.dateCreation}</Descriptions.Item>
        </Descriptions>

        {/* Display Payment Information if Recorded */}
        {data.paiementInfo && (
          <>
            <Divider titlePlacement="left" style={{ borderColor: "#cbd5e1" }}>
              <DollarOutlined style={{ color: "#16a34a" }} /> Information de Paiement Enregistrée
            </Divider>
            <Descriptions column={2} bordered size="small" style={{ backgroundColor: "#f8fafc" }}>
              <Descriptions.Item label="Mode de Paiement">
                <Tag color="green">{data.paiementInfo.modePaiement}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Réglé">
                <strong style={{ color: "#15803d" }}>
                  {data.paiementInfo.montant?.toLocaleString("fr-FR")} MAD
                </strong>
              </Descriptions.Item>
              {data.paiementInfo.numeroCheque && (
                <Descriptions.Item label="N° Chèque">
                  {data.paiementInfo.numeroCheque}
                </Descriptions.Item>
              )}
              {data.paiementInfo.banque && (
                <Descriptions.Item label="Banque">{data.paiementInfo.banque}</Descriptions.Item>
              )}
              {data.paiementInfo.referenceVirement && (
                <Descriptions.Item label="Réf. Virement">
                  {data.paiementInfo.referenceVirement}
                </Descriptions.Item>
              )}
              {data.paiementInfo.datePaiement && (
                <Descriptions.Item label="Date de Validation">
                  {data.paiementInfo.datePaiement}
                </Descriptions.Item>
              )}
              {data.paiementInfo.validePar && (
                <Descriptions.Item label="Validé Par">
                  {data.paiementInfo.validePar}
                </Descriptions.Item>
              )}
              {data.paiementInfo.remarques && (
                <Descriptions.Item label="Remarques">
                  {data.paiementInfo.remarques}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Action Section matching Use Case Diagram */}
        {canAct && (
          <div style={{ marginTop: 24, padding: "20px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: 15, fontWeight: 600 }}>
              Traitement des Demandes (Agent & Superviseur)
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Option 1: Validation Paiement */}
              <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <h5 style={{ margin: "0 0 8px 0", color: "#16a34a", fontSize: 13, fontWeight: 600 }}>
                  <DollarOutlined /> Workflow 1: Validation Paiement
                </h5>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Saisir les détails de paiement (Chèque, Virement, Espèces) pour valider la demande.
                </p>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<DollarOutlined />}
                    style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                    onClick={handleOpenPaymentModal}
                  >
                    Accepter & Saisir Paiement
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleOpenRejectModal("PAIEMENT")}
                  >
                    Refuser Paiement
                  </Button>
                </Space>
              </div>

              {/* Option 2: Validation de Dossier */}
              <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <h5 style={{ margin: "0 0 8px 0", color: "#2563eb", fontSize: 13, fontWeight: 600 }}>
                  <FolderOutlined /> Workflow 2: Validation du Dossier
                </h5>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Valider directement la conformité des pièces et du dossier sans enregistrer de règlement guichet.
                </p>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => validerMutation.mutate(undefined)}
                    loading={validerMutation.isPending}
                  >
                    Accepter le Dossier
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleOpenRejectModal("DOSSIER")}
                  >
                    Refuser le Dossier
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Saisir les infos de paiement (Validation Paiement) */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarOutlined style={{ color: "#16a34a" }} />
            <span>Saisir les informations de paiement</span>
          </div>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={paymentForm}
          layout="vertical"
          initialValues={{ modePaiement: "ESPECES", montant: 450 }}
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="modePaiement"
            label="Mode de Paiement"
            rules={[{ required: true, message: "Veuillez choisir un mode de paiement" }]}
          >
            <Select
              options={[
                { label: "Espèces (Guichet)", value: "ESPECES" },
                { label: "Chèque Bancaire", value: "CHEQUE" },
                { label: "Virement Bancaire", value: "VIREMENT" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="montant"
            label="Montant (MAD)"
            rules={[{ required: true, message: "Veuillez entrer le montant" }]}
            tooltip="Le montant de l'abonnement est fixe et non modifiable"
          >
            <InputNumber disabled style={{ width: "100%" }} addonAfter="MAD" min={0} />
          </Form.Item>

          {currentPaymentMode === "CHEQUE" && (
            <>
              <Form.Item
                name="numeroCheque"
                label="Numéro de Chèque"
                rules={[{ required: true, message: "Numéro de chèque requis" }]}
              >
                <Input placeholder="Ex: CHQ-987654" />
              </Form.Item>
              <Form.Item
                name="banque"
                label="Banque Émettrice"
                rules={[{ required: true, message: "Nom de la banque requis" }]}
              >
                <Select
                  placeholder="Sélectionner la banque..."
                  options={BANK_OPTIONS}
                />
              </Form.Item>
            </>
          )}

          {currentPaymentMode === "VIREMENT" && (
            <>
              <Form.Item
                name="referenceVirement"
                label="Référence du Virement"
                rules={[{ required: true, message: "Référence de virement requise" }]}
              >
                <Input placeholder="Ex: VIR-2026-00123" />
              </Form.Item>
              <Form.Item
                name="banque"
                label="Banque d'origine"
                rules={[{ required: true, message: "Nom de la banque requis" }]}
              >
                <Select
                  placeholder="Sélectionner la banque..."
                  options={BANK_OPTIONS}
                />
              </Form.Item>
            </>
          )}

          <Form.Item name="remarques" label="Remarques / Observations">
            <Input.TextArea rows={2} placeholder="Observations éventuelles sur le paiement..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setPaymentModalOpen(false)}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={validerMutation.isPending}
                icon={<FileDoneOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Valider le Paiement & la Demande
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Refuser la demande */}
      <Modal
        title={`Refuser la demande (${rejectType === "PAIEMENT" ? "Non-conformité Paiement" : "Dossier incomplet"})`}
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => rejeterMutation.mutate()}
        confirmLoading={rejeterMutation.isPending}
        okText="Confirmer le Refus"
        okButtonProps={{ danger: true }}
      >
        <p style={{ color: "#64748b", fontSize: 13 }}>
          Veuillez justifier la raison du refus ({rejectType === "PAIEMENT" ? "erreur montant, chèque en bois, virement non reçu..." : "pièces manquantes, immatriculation incorrecte, non-conformité..."}).
        </p>
        <Input.TextArea
          placeholder="Motif du refus..."
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}