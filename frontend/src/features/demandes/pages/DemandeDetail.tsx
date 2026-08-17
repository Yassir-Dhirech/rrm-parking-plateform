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
  Steps,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  DollarOutlined,
  FileDoneOutlined,
  ArrowLeftOutlined,
  FolderOutlined,
  LockOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  getDemandeByIdMock,
  validerDemandeMock,
  enregistrerPaiementAgentMock,
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
  const currentPaymentMode = Form.useWatch("modePaiement", paymentForm) ?? "ESPECES";

  const { data, isLoading } = useQuery({
    queryKey: ["demande", demandeId],
    queryFn: () => getDemandeByIdMock(demandeId),
    enabled: !isNaN(demandeId),
  });

  // Action 1: Encaisser / Enregistrer le paiement (Agent & Superviseur) -> statut = PAIEMENT_ENREGISTRE
  const enregistrerPaiementMutation = useMutation<void, Error, PaymentInfoInput>({
    mutationFn: (payInput: PaymentInfoInput) =>
      enregistrerPaiementAgentMock(demandeId, payInput, `${userName ?? "Utilisateur"} (${role})`),
    onSuccess: () => {
      message.success("Paiement encaissé et confirmé avec succès. Le dossier est prêt pour validation.");
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });

  // Action 2: Valider la conformité du dossier (Superviseur UNIQUEMENT) -> statut = VALIDEE
  const validerDossierMutation = useMutation<void, Error, void>({
    mutationFn: () =>
      validerDemandeMock(demandeId, undefined, `${userName ?? "Utilisateur"} (${role})`),
    onSuccess: () => {
      message.success("Conformité du dossier validée avec succès par le superviseur !");
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
    onError: (err) => {
      message.error(err.message);
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

  const isPaiementDone = Boolean(data.paiementInfo) || data.statut === "PAIEMENT_ENREGISTRE" || data.statut === "VALIDEE";
  const isDossierValide = data.statut === "VALIDEE";
  const isAgent = role === "AGENT";
  const isSuperviseur = role === "SUPERVISEUR";

  const currentStep = isDossierValide ? 2 : isPaiementDone ? 1 : 0;

  const handleOpenPaymentModal = () => {
    paymentForm.resetFields();
    setPaymentModalOpen(true);
  };

  const handleOpenRejectModal = (type: "DOSSIER" | "PAIEMENT") => {
    setRejectType(type);
    setRejectModalOpen(true);
  };

  const handlePaymentSubmit = (values: PaymentInfoInput) => {
    enregistrerPaiementMutation.mutate(values);
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
        {/* Stepper de Progression du Workflow */}
        <div style={{ marginBottom: 24, padding: "16px 24px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <Steps
            current={currentStep}
            items={[
              {
                title: "1. Soumission Demande",
                description: data.dateCreation,
              },
              {
                title: "2. Enregistrement Paiement",
                description: isPaiementDone ? `Encaissé (${data.paiementInfo?.modePaiement ?? "Oui"})` : "Agent / Guichet",
                icon: <DollarOutlined />,
              },
              {
                title: "3. Validation Dossier",
                description: isDossierValide ? "Validé et Activé" : "Superviseur uniquement",
                icon: <SafetyCertificateOutlined />,
              },
            ]}
          />
        </div>

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

        {/* Enregistrement de Paiement */}
        {data.paiementInfo && (
          <>
            <Divider titlePlacement="left" style={{ borderColor: "#cbd5e1" }}>
              <DollarOutlined style={{ color: "#16a34a" }} /> Informations de Paiement Encaissé
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
                <Descriptions.Item label="Date Enregistrement">
                  {data.paiementInfo.datePaiement}
                </Descriptions.Item>
              )}
              {data.paiementInfo.validePar && (
                <Descriptions.Item label="Enregistré Par">
                  {data.paiementInfo.validePar}
                </Descriptions.Item>
              )}
              {data.paiementInfo.remarques && (
                <Descriptions.Item label="Remarques">
                  {data.paiementInfo.remarques}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                onClick={() => message.info("Génération du reçu de paiement client en cours...")}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Imprimer Reçu de Paiement (Livraison Client)
              </Button>
              {data.paiementInfo.modePaiement === "CHEQUE" && (
                <Tag color="purple" style={{ padding: "6px 12px", fontSize: 12 }}>
                  📌 Chèque enregistré — Transmis au service comptable pour dépôt caisse
                </Tag>
              )}
            </div>
          </>
        )}

        {/* Section Actions Métier & Séparation des Rôles */}
        {!isDossierValide && data.statut !== "REJETEE" && (
          <div style={{ marginTop: 24, padding: "20px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: 15, fontWeight: 600 }}>
              Séparation des Rôles dans le Workflow : Agent & Superviseur
            </h4>

            {/* Banner pour l'Agent */}
            {isAgent && (
              <Alert
                type="info"
                showIcon
                icon={<UserOutlined />}
                message="Rôle Agent (Guichet)"
                description="En tant qu'Agent, votre rôle consiste à encaisser le paiement du client et à le confirmer. Une fois le paiement confirmé, le dossier est transmis au Superviseur pour la validation définitive de la conformité du dossier."
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Banner pour le Superviseur */}
            {isSuperviseur && (
              <Alert
                type="warning"
                showIcon
                icon={<SafetyCertificateOutlined />}
                message="Rôle Superviseur"
                description={
                  isPaiementDone
                    ? "✓ Le règlement a été encaissé. Vous pouvez désormais vérifier les pièces et valider la conformité finale du dossier."
                    : "⚠️ Le règlement n'a pas encore été encaissé. Vous devez d'abord encaisser le paiement avant de pouvoir valider la conformité du dossier."
                }
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* ÉTAPE 1: Encaisser / Valider le Paiement */}
              <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <h5 style={{ margin: "0 0 8px 0", color: "#16a34a", fontSize: 13, fontWeight: 600 }}>
                  <DollarOutlined /> Étape 1: Encaissement du Paiement (Agent / Superviseur)
                </h5>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Encaisser et saisir le règlement (Espèces, Chèque, Virement) au guichet.
                </p>
                {isPaiementDone ? (
                  <Tag color="green" style={{ padding: "6px 12px", fontSize: 12 }}>
                    ✓ Paiement encaissé & confirmé
                  </Tag>
                ) : (
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<DollarOutlined />}
                      style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                      onClick={handleOpenPaymentModal}
                    >
                      Accepter & Encaisser Paiement
                    </Button>
                    <Button
                      danger
                      size="small"
                      onClick={() => handleOpenRejectModal("PAIEMENT")}
                    >
                      Refuser Paiement
                    </Button>
                  </Space>
                )}
              </div>

              {/* ÉTAPE 2: Validation du Dossier (SUPERVISEUR UNIQUEMENT APRÈS PAIEMENT) */}
              <div style={{ padding: 14, background: "#ffffff", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <h5 style={{ margin: "0 0 8px 0", color: "#2563eb", fontSize: 13, fontWeight: 600 }}>
                  <FolderOutlined /> Étape 2: Validation de Conformité du Dossier (Superviseur)
                </h5>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Valider définitivement le dossier et activer l'abonnement (nécessite un paiement préalable).
                </p>
                
                {isAgent && (
                  <Tooltip title="Réservé au Superviseur après encaissement du paiement">
                    <Button disabled icon={<LockOutlined />}>
                      Valider le Dossier (Réservé Superviseur)
                    </Button>
                  </Tooltip>
                )}

                {isSuperviseur && (
                  <Space wrap>
                    {isPaiementDone ? (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => validerDossierMutation.mutate()}
                        loading={validerDossierMutation.isPending}
                        style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                      >
                        Valider la Conformité & Activer le Dossier
                      </Button>
                    ) : (
                      <Tooltip title="Vous devez obligatoirement encaisser et enregistrer le paiement à l'Étape 1 avant de valider le dossier.">
                        <Button disabled icon={<LockOutlined />}>
                          Valider le Dossier (Encaissement Requis)
                        </Button>
                      </Tooltip>
                    )}
                    <Button
                      danger
                      size="small"
                      onClick={() => handleOpenRejectModal("DOSSIER")}
                    >
                      Refuser le Dossier
                    </Button>
                  </Space>
                )}
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
            <span>Saisir les informations de paiement (Guichet)</span>
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
                loading={enregistrerPaiementMutation.isPending}
                icon={<FileDoneOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Confirmer & Enregistrer le Paiement
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