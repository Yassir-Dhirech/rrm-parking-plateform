import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Modal, Form, Input, Select, Alert, Tag, message, Breadcrumb, Typography, Checkbox } from "antd";
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import {
  getAbonnementByIdMock,
  suspendAbonnementMock,
  reactivateAbonnementMock,
  activerAbonnementMock,
} from "../../../api/abonnementsMock";
import { sendClientNotificationMock } from "../../../api/clientNotificationsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

const { Option } = Select;
const { Text } = Typography;

export function AbonnementDetail() {
  const { id } = useParams<{ id: string }>();
  const abonnementId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, userName } = useAuth();
  const basePath = role ? roleConfig[role].homePath : "";

  const isAuthorizedToSuspend = role === "SUPERVISEUR" || role === "RESPONSABLE" || role === "ADMIN_SI";

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendForm] = Form.useForm();
  const [isActiverModalOpen, setIsActiverModalOpen] = useState(false);
  const [activerForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["abonnement", abonnementId],
    queryFn: () => getAbonnementByIdMock(abonnementId),
  });

  const activerMutation = useMutation({
    mutationFn: (values: { numeroCarteRfid?: string }) =>
      activerAbonnementMock({
        id: abonnementId,
        operateurNom: userName || (role === "SUPERVISEUR" ? "Superviseur RRM" : "Agent Guichet RRM"),
        roleOperateur: role || "AGENT",
        numeroCarteRfid: values.numeroCarteRfid,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["abonnement", abonnementId], updated);
      queryClient.invalidateQueries({ queryKey: ["abonnements"] });
      message.success(`Abonnement ${updated.reference} instruit et activé avec succès par ${userName || role} !`);
      setIsActiverModalOpen(false);
      activerForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err.message || "Erreur lors de l'activation de l'abonnement");
    },
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
    sendClientNotificationMock({
      channel: "BOTH",
      typeEvenement: "SUSPENSION",
      destinataireNom: data?.clientNom || "Client Souscripteur",
      destinataireEmail: data?.clientNom ? `${data.clientNom.toLowerCase().replace(/\s+/g, ".")}@example.com` : "client.rrm@example.com",
      destinataireTelephone: "0612345678",
      sujet: `RRM - Suspension de l'abonnement de ${data?.clientNom || "Client"}`,
      contenu: `Bonjour ${data?.clientNom || "Client"}, votre abonnement ${data?.reference} et badge RFID ont été suspendus. Motif : ${finalMotif}.`,
    });
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`${basePath}/abonnements`)} style={{ fontWeight: 500 }}>
                Retour
              </Button>
              
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#003566" }}>
                Abonnement {data.reference}
              </span>
              <StatusBadge statut={data.statut} />
              {data.type === "STAFF" && (
                <Tag color="gold" style={{ fontWeight: 600 }}>
                  <SafetyCertificateOutlined style={{ marginRight: 4 }} /> Staff RRM
                </Tag>
              )}
              {data.statut === "EN_ATTENTE" && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setIsActiverModalOpen(true)}
                  style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700, borderRadius: 8 }}
                >
                  Traiter & Activer l'Abonnement
                </Button>
              )}
              {isAuthorizedToSuspend && data.statut !== "EN_ATTENTE" && (
                !isSuspended ? (
                  <Button
                    type="primary"
                    danger
                    icon={<PauseCircleOutlined />}
                    onClick={() => setIsSuspendModalOpen(true)}
                    style={{ fontWeight: 600, borderRadius: 8 }}
                  >
                    Suspendre l'Abonnement
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={reactivateMutation.isPending}
                    onClick={() => reactivateMutation.mutate()}
                    style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 600, borderRadius: 8 }}
                  >
                    Réactiver l'Abonnement
                  </Button>
                )
              )}
            </div>
          </div>
        }
      >
        {data.statut === "EN_ATTENTE" && (
          <Alert
            message="Abonnement Non Traité — En Attente d'Instruction & Validation par un Agent ou Superviseur"
            description={
              <div>
                <p style={{ margin: "4px 0" }}>
                  <strong>Règle RRM :</strong> Un abonnement ne peut pas être <strong>ACTIF</strong> tant qu'il n'a pas été formellement instruit et validé par un <strong>Agent de guichet</strong> ou un <strong>Superviseur</strong>.
                </p>
                <div style={{ fontSize: 12, color: "#92400e" }}>
                  L'accès aux barrières automatiques et la reconnaissance de plaque (LPR) restent verrouillés tant que l'attribution physique de la carte RFID n'a pas été enregistrée.
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => setIsActiverModalOpen(true)}
                    style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700, borderRadius: 6 }}
                  >
                    Instruire et Activer Maintenant
                  </Button>
                </div>
              </div>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 20, borderRadius: 10, border: "1px solid #fcd34d", backgroundColor: "#fffbeb" }}
          />
        )}

        {isSuspended && (
          <Alert
            message="Attention : Abonnement Actuellement Suspendu"
            description={
              <div>
                <div><strong>Motif de suspension :</strong> {data.motifSuspension || "Suspension administrative"}</div>
                <div style={{ fontSize: 12, marginTop: 4, color: "#b45309" }}>
                  L'abonnement et la carte RFID sont marqués comme suspendus dans le registre d'information RRM.
                </div>
              </div>
            }
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 20, borderRadius: 10, border: "1px solid #fcd34d", backgroundColor: "#fef3c7" }}
          />
        )}

        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="middle">
          <Descriptions.Item label="Statut d'Activation">
            {data.statut === "ACTIF" ? (
              <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontWeight: 700 }}>
                Actif (Barrières Débloquées)
              </Tag>
            ) : data.statut === "EN_ATTENTE" ? (
              <Tag color="volcano" icon={<ExclamationCircleOutlined />} style={{ fontWeight: 700 }}>
                Inactif (En attente de traitement)
              </Tag>
            ) : (
              <StatusBadge statut={data.statut} />
            )}
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

          <Descriptions.Item label="Intervenant Traitant">
            {data.traiteParNom ? (
              <Tag color="cyan" style={{ fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {data.traiteParNom}
              </Tag>
            ) : (
              <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ fontWeight: 700 }}>
                Non Traité — Aucun Opérateur
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Date de Début">{formatDate(data.dateDebut)}</Descriptions.Item>
          <Descriptions.Item label="Date d'Expiration">{formatDate(data.dateFin)}</Descriptions.Item>

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
              <Text type="danger"><StopOutlined style={{ marginRight: 4 }} /> {data.motifSuspension}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Dynamic Payment Details & Settlement Card */}
      <Card
        style={{ marginTop: 20 }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarOutlined style={{ color: "#16a34a", fontSize: 20 }} />
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#003566" }}>
              Détails du Règlement & Encaissement Associé
            </span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => navigate(`${basePath}/factures/${data.id}`)}
            style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700, borderRadius: 8 }}
          >
            Consulter la Facture Officielle
          </Button>
        }
    >
      <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
        <Descriptions.Item label="Facture Rattachée">
          <Button
            type="link"
            icon={<FileDoneOutlined />}
            onClick={() => navigate(`${basePath}/factures/${data.id}`)}
            style={{ padding: 0, fontWeight: 700, color: "#006398" }}
          >
            {`FACT-${data.parkingNom?.includes("Agdal") ? "AGD" : "BEH"}-2026-${String(data.id).padStart(6, "0")}`}
          </Button>
        </Descriptions.Item>

        <Descriptions.Item label="Règlement Encaissé">
          <Button
            type="link"
            icon={<DollarOutlined />}
            onClick={() => navigate(`${basePath}/paiements/${data.id}`)}
            style={{ padding: 0, fontWeight: 700, color: "#16a34a" }}
          >
            {`PAY-2026-${String(data.id).padStart(6, "0")}`}
          </Button>
        </Descriptions.Item>

        <Descriptions.Item label="Mode de Règlement">
          <Tag color={data.type === "ENTREPRISE" ? "purple" : "green"} style={{ fontWeight: 700 }}>
            {data.type === "ENTREPRISE" ? "Chèque Bancaire (Certifié)" : "Espèces (Guichet RRM)"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Statut du Paiement">
          <Tag color="green" style={{ fontWeight: 700 }}>
            <CheckCircleOutlined style={{ marginRight: 4 }} />
            Règlement Encaissé & Quittancé
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Frais de Carte RFID">
          {data.type === "ENTREPRISE" ? (
            <span style={{ fontWeight: 700, color: "#d97706" }}>
              +500 MAD (10 Badges RFID x 50 DH)
            </span>
          ) : data.statut === "EXPIRE" ? (
            <span style={{ fontWeight: 700, color: "#16a34a" }}>
              0 MAD (Badge physique conservé)
            </span>
          ) : (
            <span style={{ fontWeight: 700, color: "#d97706" }}>
              +50 MAD (Nouvelle Carte RFID)
            </span>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Montant Total Réglé (TTC)">
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: data.type === "STAFF" ? "#0284c7" : "#16a34a" }}>
            {data.type === "ENTREPRISE" ? "54 500 MAD TTC" : data.statut === "EXPIRE" ? "3 600 MAD TTC" : "1 490 MAD TTC"}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Date d'Encaissement">
          {formatDate(data.dateDebut)}
        </Descriptions.Item>

          {data.type === "ENTREPRISE" && (
            <>
              <Descriptions.Item label="Numéro de Chèque">
                <Tag color="purple" style={{ fontFamily: "monospace", fontWeight: 700 }}>
                  CHQ-998877
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Banque Émettrice">
                Attijariwafa Bank (Agence Agdal)
              </Descriptions.Item>
              <Descriptions.Item label="Engagement Contractuel" span={2}>
                <Tag color="purple" style={{ fontWeight: 700 }}>
                  <FileTextOutlined style={{ marginRight: 4 }} />
                  Contrat Corporate 20 Ans Signé & Légalisé (Obligatoire)
                </Tag>
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="Paiement Encaissé Par (Agent Guichet)">
            <Tag color="cyan" style={{ fontWeight: 600 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {data.traiteParNom || "Agent Rachid (Guichet Agdal)"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Paiement Confirme Par (Validation Recette)">
            <Tag color="blue" style={{ fontWeight: 600 }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              {data.type === "ENTREPRISE"
                ? "Mme. Leila Benali (Responsable RRM)"
                : "M. Samir El Amrani (Superviseur RRM)"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Reçu / Quittance de Caisse" span={2}>
            <span style={{ fontFamily: "monospace", fontWeight: 600 }}>QUIT-2026-ABN-{data.id}</span> (Encaissement guichet confirmé par la caisse RRM)
          </Descriptions.Item>
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

      {/* Modal Instruction & Activation par Agent ou Superviseur */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: "#16a34a", fontSize: 20 }} />
            <span>Instruction & Activation de l'Abonnement {data.reference}</span>
          </div>
        }
        open={isActiverModalOpen}
        onCancel={() => setIsActiverModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form
          form={activerForm}
          layout="vertical"
          onFinish={(values) => activerMutation.mutate(values)}
          initialValues={{
            numeroCarteRfid: `CRT-${String(Math.floor(100000 + Math.random() * 900000))}`,
            conformePieces: true,
          }}
        >
          <Alert
            message="Condition Stricte de Traitement RRM"
            description="Un abonnement ne peut pas être actif sans validation formelle par un Agent ou un Superviseur. En confirmant cette action, vous attestez avoir instruit le dossier et délivré le badge d'accès."
            type="info"
            showIcon
            style={{ marginBottom: 16, marginTop: 10 }}
          />

          <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Bénéficiaire">
              <strong>{data.clientNom}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Parking d'Attache">
              {data.parkingNom}
            </Descriptions.Item>
            <Descriptions.Item label="Opérateur Traitant">
              <Tag color="blue" style={{ fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {userName || "Agent Guichet"} ({role})
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Form.Item
            name="numeroCarteRfid"
            label="Numéro de la Carte RFID Attribuée"
            rules={[{ required: true, message: "Veuillez renseigner le numéro du badge RFID" }]}
          >
            <Input placeholder="Ex: CRT-882910" />
          </Form.Item>

          <Form.Item
            name="conformePieces"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error("Veuillez certifier la conformité du dossier")),
              },
            ]}
          >
            <Checkbox>
              Je certifie avoir instruit le dossier, vérifié les pièces (CIN / Carte Grise) et activé le badge d'accès pour ce bénéficiaire.
            </Checkbox>
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button onClick={() => setIsActiverModalOpen(false)}>Annuler</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={activerMutation.isPending}
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 700 }}
            >
              Valider le Traitement & Activer
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}