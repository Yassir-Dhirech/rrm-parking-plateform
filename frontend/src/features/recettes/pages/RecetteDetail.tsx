import { useParams } from "react-router-dom";
import { Card, Descriptions, Button, Space, Table, Modal, message, Spin, Typography, Tag, Row, Col, Alert } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleOutlined, PrinterOutlined, SendOutlined, BankOutlined, FileTextOutlined, AuditOutlined, DollarOutlined } from "@ant-design/icons";
import { getRecetteByIdMock, validerRecetteMock, transmettreComptabiliteMock, validerEncaissementComptableMock } from "../../../api/recettesMock";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDate } from "../../../lib/dateUtils";
import type { RecetteJournee, ChequeRemiseDetail } from "../types";

const { Title, Text } = Typography;

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

  const validerMutation = useMutation({
    mutationFn: validerRecetteMock,
    onSuccess: () => {
      message.success("Recette hebdomadaire validée par le superviseur !");
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  const transmettreMutation = useMutation({
    mutationFn: transmettreComptabiliteMock,
    onSuccess: () => {
      message.success("Bordereau de recette et fonds transmis au Service Financier & Comptabilité !");
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  const encaissementComptableMutation = useMutation({
    mutationFn: validerEncaissementComptableMock,
    onSuccess: (data) => {
      message.success(`Encaissement comptable clôturé ! Quittance d'encaissement N° ${data.quittanceNumero} générée.`);
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (!recette) return <Card>Recette introuvable</Card>;

  const handleValider = () => {
    Modal.confirm({
      title: "Validation Superviseur — Arrêté de Caisse",
      content: `Valider l'arrêté de caisse pour ${recette.parkingNom} (${recette.semaineAnnee}) au montant de ${recette.totalHebdo.toLocaleString("fr-FR")} DH ?`,
      okText: "Valider l'Arrêté",
      cancelText: "Annuler",
      onOk: () => validerMutation.mutateAsync(recette.id),
    });
  };

  const handleTransmettre = () => {
    Modal.confirm({
      title: "Transmission des Fonds au Service Financier / Comptable",
      content: (
        <div>
          <p>Confirmer la remise physique du bordereau de caisse au service comptabilité :</p>
          <ul>
            <li><strong>Total Liquide (Espèces) :</strong> {(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH</li>
            <li><strong>Total Chèques ({recette.nombreCheques || 0}) :</strong> {(recette.totalCheques || 0).toLocaleString("fr-FR")} DH</li>
          </ul>
        </div>
      ),
      okText: "Transmettre à la Comptabilité",
      cancelText: "Annuler",
      onOk: () => transmettreMutation.mutateAsync(recette.id),
    });
  };

  const handleValiderEncaissement = () => {
    Modal.confirm({
      title: "Validation & Encaissement Comptable (Service Financier)",
      content: `Certifier la réception des fonds (Espèces & Chèques) pour la ${recette.semaineAnnee} et émettre la Quittance d'Encaissement ?`,
      okText: "Valider l'Encaissement",
      cancelText: "Annuler",
      onOk: () => encaissementComptableMutation.mutateAsync(recette.id),
    });
  };

  const columnsDetail = [
    { title: "Date", dataIndex: "date", key: "date", render: (d: string) => formatDate(d) },
    { title: "Transactions", dataIndex: "nombreTransactions", key: "nombreTransactions" },
    {
      title: "Espèces Liquide (DH)",
      dataIndex: "montantEspeces",
      key: "montantEspeces",
      render: (v: number) => <span style={{ color: "#16a34a", fontWeight: 600 }}>{(v || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "Chèques Physiques (DH)",
      dataIndex: "montantCheque",
      key: "montantCheque",
      render: (v: number) => <span style={{ color: "#9333ea", fontWeight: 600 }}>{(v || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "TPE / Carte (DH)",
      dataIndex: "montantCarte",
      key: "montantCarte",
      render: (v: number) => (v || 0).toLocaleString("fr-FR"),
    },
    {
      title: "Virement (DH)",
      dataIndex: "montantVirement",
      key: "montantVirement",
      render: (v: number) => (v || 0).toLocaleString("fr-FR"),
    },
    {
      title: "Total Journée (DH)",
      dataIndex: "totalJournee",
      key: "totalJournee",
      render: (v: number) => <strong style={{ color: "#0369a1" }}>{v.toLocaleString("fr-FR")} DH</strong>,
    },
  ];

  const columnsCheques = [
    { title: "N° Paiement", dataIndex: "referencePaiement", key: "referencePaiement", render: (r: string) => <Tag color="blue">{r}</Tag> },
    { title: "N° Chèque Physique", dataIndex: "numeroCheque", key: "numeroCheque", render: (c: string) => <strong>{c}</strong> },
    { title: "Banque Émettrice", dataIndex: "banque", key: "banque" },
    { title: "Tireur / Émetteur", dataIndex: "emetteur", key: "emetteur" },
    { title: "Date Recouvrement", dataIndex: "datePaiement", key: "datePaiement", render: (d: string) => formatDate(d) },
    {
      title: "Montant du Chèque",
      dataIndex: "montant",
      key: "montant",
      render: (v: number) => <strong style={{ color: "#7e22ce" }}>{v.toLocaleString("fr-FR")} DH TTC</strong>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card extra={<StatusBadge statut={recette.statut} />}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Arrêté & Bordereau de Recette Hebdomadaire : {recette.reference}</Title>
            <Text type="secondary">Parking : {recette.parkingNom} — Période : {recette.semaineAnnee}</Text>
          </div>
          <Tag color="geekblue" style={{ fontSize: 16, padding: "6px 14px", borderRadius: 8 }}>
            Total Hebdo : {recette.totalHebdo.toLocaleString("fr-FR")} DH TTC
          </Tag>
        </div>

        {recette.statut === "VALIDEE_COMPTABILITE" && (
          <Alert
            type="success"
            showIcon
            message={`Recette Encaissée & Clôturée par la Comptabilité (Quittance N° ${recette.quittanceNumero || "QUIT-2026-00481"})`}
            description={`Les fonds en espèces (${(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH) et les ${recette.nombreCheques || 0} chèques physiques (${(recette.totalCheques || 0).toLocaleString("fr-FR")} DH) ont été réceptionnés et visés par la comptabilité.`}
            style={{ marginBottom: 20 }}
          />
        )}

        {recette.statut === "TRANSMIS_COMPTABILITE" && (
          <Alert
            type="info"
            showIcon
            message="Transmis au Service Financier & Comptabilité"
            description="Le bordereau de remise de caisse et les chèques physiques ont été déposés au service financier. En attente de visé comptable."
            style={{ marginBottom: 20 }}
          />
        )}

        <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Parking">{recette.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Période Hebdomadaire">{recette.semaineAnnee}</Descriptions.Item>
          <Descriptions.Item label="Date de Début">{formatDate(recette.dateDebut)}</Descriptions.Item>
          <Descriptions.Item label="Date de Fin">{formatDate(recette.dateFin)}</Descriptions.Item>
          <Descriptions.Item label="Superviseur Référent">{recette.superviseurNom || "M. Samir El Amrani"}</Descriptions.Item>
          <Descriptions.Item label="Transmission Comptable">{recette.transmisPar || "En attente"}</Descriptions.Item>
          {recette.validePar && (
            <Descriptions.Item label="Validé par Superviseur">
              {recette.validePar} (le {formatDate(recette.dateValidation)})
            </Descriptions.Item>
          )}
          {recette.comptableNom && (
            <Descriptions.Item label="Encaissement Comptabilité">
              {recette.comptableNom} (le {formatDate(recette.dateEncaissementComptable)})
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Breakdown of Payment Methods */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card size="small" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <div style={{ fontSize: 12, color: "#166534" }}><BankOutlined /> Espèces Liquide :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#15803d" }}>{(recette.totalEspeces || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
              <div style={{ fontSize: 12, color: "#6b21a8" }}><FileTextOutlined /> Chèques Physiques ({recette.nombreCheques || 0}) :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#7e22ce" }}>{(recette.totalCheques || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
              <div style={{ fontSize: 12, color: "#075985" }}><DollarOutlined /> TPE / Cartes :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0369a1" }}>{(recette.totalCarte || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }}>
              <div style={{ fontSize: 12, color: "#475569" }}><AuditOutlined /> Virements Bancaires :</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#334155" }}>{(recette.totalVirement || 0).toLocaleString("fr-FR")} DH</div>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Button icon={<PrinterOutlined />} size="large" onClick={() => window.print()}>
            Imprimer le Bordereau de Caisse & Remise
          </Button>

          <Space size="middle">
            {role === "SUPERVISEUR" && recette.statut === "EN_COURS" && (
              <Button
                icon={<CheckCircleOutlined />}
                size="large"
                loading={validerMutation.isPending}
                onClick={handleValider}
              >
                Viser l'Arrêté Hebdo
              </Button>
            )}

            {(role === "SUPERVISEUR" || role === "RESPONSABLE") && (recette.statut === "EN_COURS" || recette.statut === "VALIDEE_SUPERVISEUR") && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                loading={transmettreMutation.isPending}
                onClick={handleTransmettre}
                style={{ backgroundColor: "#0284c7" }}
              >
                Transmettre les Fonds au Service Financier (Comptabilité)
              </Button>
            )}

            {(role === "RESPONSABLE" || role === "SUPERVISEUR") && recette.statut === "TRANSMIS_COMPTABILITE" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="large"
                loading={encaissementComptableMutation.isPending}
                onClick={handleValiderEncaissement}
                style={{ backgroundColor: "#16a34a" }}
              >
                Valider l'Encaissement Comptable & Émettre Quittance
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
          />
        </Card>
      )}

      {/* Daily Collections Detail */}
      <Card title="Détail des Encaissements Quotidiens de la Semaine">
        <Table<RecetteJournee>
          columns={columnsDetail}
          dataSource={recette.detailJours}
          rowKey="date"
          pagination={false}
        />
      </Card>
    </Space>
  );
}