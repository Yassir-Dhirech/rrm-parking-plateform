import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Space, Table, Modal, message, Spin, Typography, Tag, Row, Col, Alert, Input, Tooltip, Select } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleOutlined, PrinterOutlined, SendOutlined, BankOutlined, FileTextOutlined, DollarOutlined, StopOutlined, LinkOutlined, UserOutlined } from "@ant-design/icons";
import { getRecetteByIdMock, markRecetteAsCompletedMock, markRecetteAsReceivedMock, rejeterChequeEtSuspendreCarteMock } from "../../../api/recettesMock";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDate } from "../../../lib/dateUtils";
import type { RecetteJournee, ChequeRemiseDetail } from "../types";

const { Title, Text } = Typography;

const MOTIFS_REJET_CHEQUE = [
  { value: "Chèque sans provision (défaut de provision suffisante)", label: "Chèque sans provision suffisante" },
  { value: "Signature non conforme au spécimen déposé en banque", label: "Signature non conforme au spécimen bancaire" },
  { value: "Compte bancaire émetteur clôturé ou bloqué", label: "Compte bancaire clôturé ou bloqué" },
  { value: "Opposition bancaire formelle pour perte ou vol de chéquier", label: "Opposition bancaire (perte / vol)" },
  { value: "Montant ou ordre raturé sans mention approbative", label: "Montant ou ordre raturé / altéré" },
  { value: "Chèque prescrit (délai légal de présentation dépassé)", label: "Chèque prescrit (délai légal dépassé)" },
  { value: "AUTRE", label: "Autre motif bancaire (préciser ci-dessous)" },
];

export function RecetteDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const recetteId = Number(id);

  const { data: recette, isLoading } = useQuery({
    queryKey: ["recette", recetteId],
    queryFn: () => getRecetteByIdMock(recetteId),
    enabled: !!recetteId,
  });

  const markCompletedMutation = useMutation({
    mutationFn: markRecetteAsCompletedMock,
    onSuccess: () => {
      message.success("Recette finalisée et marquée comme COMPLETED par le Superviseur !");
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  const markReceivedMutation = useMutation({
    mutationFn: markRecetteAsReceivedMock,
    onSuccess: (data) => {
      message.success(`Recette marquée comme RECEIVED (Reçue par la Comptabilité) ! Quittance N° ${data.quittanceNumero}.`);
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (!recette) return <Card>Recette introuvable</Card>;

  const handleMarkAsCompleted = () => {
    Modal.confirm({
      title: "Finaliser l'Arrêté de Recette",
      content: `Clôturer la collecte pour ${recette.parkingNom} — ${recette.dateRecette || formatDate(recette.dateDebut)} et transmettre l'arrêté de caisse de ${recette.totalHebdo.toLocaleString("fr-FR")} DH au statut Complété ?`,
      okText: "Finaliser la Recette",
      cancelText: "Annuler",
      onOk: () => markCompletedMutation.mutateAsync(recette.id),
    });
  };

  const handleMarkAsReceived = () => {
    Modal.confirm({
      title: "Confirmer la Réception des Fonds",
      content: `Certifier la réception physique des espèces de ${(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH et des ${recette.nombreCheques || 0} chèques par le service comptabilité ?`,
      okText: "Confirmer la Réception",
      cancelText: "Annuler",
      onOk: () => markReceivedMutation.mutateAsync(recette.id),
    });
  };

  const columnsDetail = [
    { title: "Date", dataIndex: "date", key: "date", render: (d: string) => formatDate(d) },
    { title: "Transactions", dataIndex: "nombreTransactions", key: "nombreTransactions" },
    {
      title: "Espèces",
      dataIndex: "montantEspeces",
      key: "montantEspeces",
      render: (v: number) => <span style={{ color: "#16a34a", fontWeight: 600 }}>{(v || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "Chèques",
      dataIndex: "montantCheque",
      key: "montantCheque",
      render: (v: number) => <span style={{ color: "#9333ea", fontWeight: 600 }}>{(v || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "TPE / Carte",
      dataIndex: "montantCarte",
      key: "montantCarte",
      render: (v: number) => (v || 0).toLocaleString("fr-FR"),
    },
    {
      title: "Total Journée",
      dataIndex: "totalJournee",
      key: "totalJournee",
      render: (v: number) => <strong style={{ color: "#0369a1" }}>{v.toLocaleString("fr-FR")} DH</strong>,
    },
  ];

  const [selectedCheque, setSelectedCheque] = useState<ChequeRemiseDetail | null>(null);
  const [isRejetModalOpen, setIsRejetModalOpen] = useState(false);
  const [selectedMotifCheque, setSelectedMotifCheque] = useState<string>("");
  const [autreMotifCheque, setAutreMotifCheque] = useState<string>("");

  const getFullMotifRejetCheque = () => {
    if (!selectedMotifCheque) return autreMotifCheque.trim();
    if (selectedMotifCheque === "AUTRE") return autreMotifCheque.trim();
    if (autreMotifCheque.trim()) {
      return `${selectedMotifCheque} — Note : ${autreMotifCheque.trim()}`;
    }
    return selectedMotifCheque;
  };

  const rejeterChequeMutation = useMutation({
    mutationFn: (values: { chequeId: number; motifRejet: string }) =>
      rejeterChequeEtSuspendreCarteMock({ recetteId: recette.id, chequeId: values.chequeId, motifRejet: values.motifRejet }),
    onSuccess: () => {
      message.warning("Chèque marqué comme REJETÉ. L'abonnement et la carte d'accès ont été automatiquement suspendus !");
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      setIsRejetModalOpen(false);
      setSelectedMotifCheque("");
      setAutreMotifCheque("");
    },
  });

  const handleOpenRejetModal = (cheque: ChequeRemiseDetail) => {
    setSelectedCheque(cheque);
    setSelectedMotifCheque("");
    setAutreMotifCheque("");
    setIsRejetModalOpen(true);
  };

  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";
  const canAccessAbonnements = role === "SUPERVISEUR" || role === "RESPONSABLE" || role === "ADMIN_SI";

  const columnsCheques = [
    { title: "N° Paiement", dataIndex: "referencePaiement", key: "referencePaiement", width: 130, render: (r: string) => <Tag color="blue">{r}</Tag> },
    { title: "N° Chèque Physique", dataIndex: "numeroCheque", key: "numeroCheque", width: 140, render: (c: string) => <strong>{c}</strong> },
    { title: "Banque Émettrice", dataIndex: "banque", key: "banque", width: 140 },
    {
      title: "Client / Émetteur",
      dataIndex: "emetteur",
      key: "emetteur",
      width: 180,
      render: (e: string, record: ChequeRemiseDetail) =>
        canAccessAbonnements ? (
          <Button
            type="link"
            style={{ padding: 0, fontWeight: 600, height: "auto", color: "#0284c7" }}
            onClick={() => navigate(`${basePath}/abonnements/${record.id || 1}`)}
          >
            <UserOutlined style={{ marginRight: 4 }} />
            {e}
          </Button>
        ) : (
          <span>
            <UserOutlined style={{ marginRight: 4 }} />
            {e}
          </span>
        ),
    },
    { title: "Date Recouvrement", dataIndex: "datePaiement", key: "datePaiement", width: 130, render: (d: string) => formatDate(d) },
    {
      title: "Montant Chèque",
      dataIndex: "montant",
      key: "montant",
      width: 130,
      render: (v: number) => <strong style={{ color: "#7e22ce" }}>{v.toLocaleString("fr-FR")} DH</strong>,
    },
    
    {
      title: "Action",
      key: "actionsNavigation",
      width: 190,
      render: (_: unknown, record: ChequeRemiseDetail) => (
        <Space wrap>
          {canAccessAbonnements && (
            <Tooltip title="Consulter la fiche de l'abonné et sa carte d'accès RFID">
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={() => navigate(`${basePath}/abonnements/${record.id || 1}`)}
              >
                Fiche Abonné
              </Button>
            </Tooltip>
          )}

          {role === "COMPTABLE" && (
            record.statut === "REJETE" ? (
              <Tag color="volcano" style={{ fontSize: 11 }}>Carte Suspendue</Tag>
            ) : (
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleOpenRejetModal(record)}
              >
                Rejeter & Suspendre Carte
              </Button>
            )
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card extra={<StatusBadge statut={recette.statut} />}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Arrêté & Bordereau de Recette : {recette.reference}</Title>
            <Text type="secondary">Parking : {recette.parkingNom} — Date de Recette : {recette.dateRecette || formatDate(recette.dateDebut)}</Text>
          </div>
          <Tag color="geekblue" style={{ fontSize: 16, padding: "6px 14px", borderRadius: 8 }}>
            Total Recette : {recette.totalHebdo.toLocaleString("fr-FR")} DH TTC
          </Tag>
        </div>

        {recette.statut === "RECEIVED" && (
          <Alert
            type="success"
            showIcon
            message={`Statut : RECEIVED — Recette Reçue & Validée par la Comptabilité — Quittance N° ${recette.quittanceNumero || "QUIT-2026-00481"}`}
            description={`La somme en espèces de ${(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH et les ${recette.nombreCheques || 0} chèques pour un montant de ${(recette.totalCheques || 0).toLocaleString("fr-FR")} DH ont été réceptionnés et confirmés par le service comptable.`}
            style={{ marginBottom: 20 }}
          />
        )}

        {recette.statut === "COMPLETED" && (
          <Alert
            type="info"
            showIcon
            message="Statut : COMPLETED — Recette Complétée par le Superviseur"
            description="Le superviseur a complété cette recette et déposé le bordereau. Le comptable peut maintenant la faire passer au statut RECEIVED après vérification des fonds."
            style={{ marginBottom: 20 }}
          />
        )}

        {recette.statut === "EN_COURS" && (
          <Alert
            type="warning"
            showIcon
            message="Statut : EN_COURS — Collecte Active en Cours"
            description="Les encaissements quotidiens s'accumulent au niveau du guichet. Le superviseur peut finaliser et clôturer cet arrêté de caisse pour le passer au statut COMPLETED."
            style={{ marginBottom: 20 }}
          />
        )}

        <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Parking">{recette.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Date de Recette">{recette.dateRecette || formatDate(recette.dateDebut)}</Descriptions.Item>
          <Descriptions.Item label="Date d'Arrêté">{recette.dateRecette || formatDate(recette.dateDebut)}</Descriptions.Item>
          <Descriptions.Item label="Date de Saisie">{formatDate(recette.dateDebut)}</Descriptions.Item>
          <Descriptions.Item label="Superviseur Référent">{recette.superviseurNom || "M. Samir El Amrani"}</Descriptions.Item>
          <Descriptions.Item label="Transmission Comptable">{recette.transmisPar || "En attente"}</Descriptions.Item>
          {recette.validePar && (
            <Descriptions.Item label="Complété par Superviseur">
              {recette.validePar} — le {formatDate(recette.dateValidation)}
            </Descriptions.Item>
          )}
          {recette.comptableNom && (
            <Descriptions.Item label="Reçu par Comptabilité">
              {recette.comptableNom} — le {formatDate(recette.dateEncaissementComptable)}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Breakdown of Payment Methods */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Card size="small" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div style={{ fontSize: 12, color: "#166534" }}><BankOutlined /> Espèces :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#15803d" }}>{(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
              <div style={{ fontSize: 12, color: "#6b21a8" }}><FileTextOutlined /> Chèques : {recette.nombreCheques || 0}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#7e22ce" }}>{(recette.totalCheques || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
              <div style={{ fontSize: 12, color: "#075985" }}><DollarOutlined /> TPE / Cartes :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0369a1" }}>{(recette.totalCarte || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Button icon={<PrinterOutlined />} size="large" onClick={() => window.print()}>
            Imprimer le Bordereau de Caisse & Remise
          </Button>

          <Space size="middle">
            {(role === "SUPERVISEUR" || role === "RESPONSABLE") && recette.statut === "EN_COURS" && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                loading={markCompletedMutation.isPending}
                onClick={handleMarkAsCompleted}
                style={{ backgroundColor: "#0284c7" }}
              >
                Finaliser l'Arrêté & Passer à COMPLETED
              </Button>
            )}

            {role === "COMPTABLE" && recette.statut === "COMPLETED" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="large"
                loading={markReceivedMutation.isPending}
                onClick={handleMarkAsReceived}
                style={{ backgroundColor: "#16a34a" }}
              >
                Valider la Réception des Fonds (Set to RECEIVED)
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Detail of Physical Cheques Handed Over */}
      {recette.chequesRemis && recette.chequesRemis.length > 0 && (
        <Card title={`Bordereau de Remise des Chèques Physiques (${recette.chequesRemis.length} Chèque(s))`}>
          <Table<ChequeRemiseDetail>
            columns={columnsCheques}
            dataSource={recette.chequesRemis}
            rowKey="id"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}

      {/* Daily Collections Detail */}
      <Card title="Détail des Encaissements Quotidiens">
        <Table<RecetteJournee>
          columns={columnsDetail}
          dataSource={recette.detailJours}
          rowKey="date"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal Rejet Chèque & Suspension Carte (Comptabilité) */}
      <Modal
        title={
          <Space>
            <StopOutlined style={{ color: "#ef4444" }} />
            <span>Signalement Chèque Impayé & Suspension de la Carte d'Accès</span>
          </Space>
        }
        open={isRejetModalOpen}
        onCancel={() => setIsRejetModalOpen(false)}
        onOk={() => {
          const finalMotif = getFullMotifRejetCheque();
          if (!finalMotif) {
            message.error("Veuillez sélectionner un motif de rejet ou préciser la raison.");
            return;
          }
          if (selectedCheque) {
            rejeterChequeMutation.mutate({ chequeId: selectedCheque.id, motifRejet: finalMotif });
          }
        }}
        confirmLoading={rejeterChequeMutation.isPending}
        okText="Confirmer le Rejet & Suspendre la Carte"
        okButtonProps={{ danger: true, style: { fontWeight: 700 } }}
        cancelText="Annuler"
        width={580}
      >
        <Alert
          type="error"
          showIcon
          message="Présomption de Validité Levée — Procédure d'Impayé"
          description="Les chèques sont présumés valides à la remise pour délivrer la carte d'accès. La confirmation du rejet par la banque entraînera la SUSPENSION IMMÉDIATE de la carte et de l'abonnement associé, et transmettra une alerte d'urgence à l'Agent et au Superviseur."
          style={{ marginBottom: 16 }}
        />

        {selectedCheque && (
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="N° Chèque">{selectedCheque.numeroCheque}</Descriptions.Item>
            <Descriptions.Item label="Banque Émettrice">{selectedCheque.banque}</Descriptions.Item>
            <Descriptions.Item label="Tireur / Émetteur">{selectedCheque.emetteur}</Descriptions.Item>
            <Descriptions.Item label="Montant du Chèque">
              <strong style={{ color: "#ef4444" }}>{selectedCheque.montant.toLocaleString("fr-FR")} DH TTC</strong>
            </Descriptions.Item>
          </Descriptions>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, display: "block", marginBottom: 6, color: "#334155" }}>
            Motif de rejet bancaire (menu déroulant) :
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Sélectionner le motif bancaire..."
            value={selectedMotifCheque || undefined}
            onChange={(val) => setSelectedMotifCheque(val)}
            options={MOTIFS_REJET_CHEQUE}
            size="large"
          />
        </div>

        {(selectedMotifCheque === "AUTRE" || selectedMotifCheque) && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6, color: "#334155" }}>
              {selectedMotifCheque === "AUTRE" ? (
                <>
                  <span style={{ color: "#ef4444", marginRight: 4 }}>*</span>
                  Préciser le motif spécifique (Obligatoire) :
                </>
              ) : (
                "Précisions ou références bancaires complémentaires (Facultatif) :"
              )}
            </label>
            <Input.TextArea
              rows={3}
              placeholder={
                selectedMotifCheque === "AUTRE"
                  ? "Saisir le motif bancaire exact..."
                  : "N° d'avis d'impayé, agence ou remarques complémentaires..."
              }
              value={autreMotifCheque}
              onChange={(e) => setAutreMotifCheque(e.target.value)}
            />
          </div>
        )}

        {getFullMotifRejetCheque() && (
          <div style={{ padding: 12, backgroundColor: "#fff1f2", borderRadius: 8, border: "1px solid #fecdd3" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
              Motif de rejet enregistré pour ce chèque :
            </div>
            <div style={{ fontSize: 12, color: "#881337", fontWeight: 500 }}>
              « {getFullMotifRejetCheque()} »
            </div>
          </div>
        )}
      </Modal>
    </Space>
  );
}