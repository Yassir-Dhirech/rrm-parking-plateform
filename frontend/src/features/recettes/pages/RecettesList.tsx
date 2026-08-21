import { useState } from "react";
import { Table, Card, Typography, Row, Col, Statistic, Tag, Button, Modal, Select, message, Alert, Space } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getRecettesMock, getPaiementsAEncasserMock, creerRecetteSupervisorMock, type PaiementAEncasserRecette } from "../../../api/recettesMock";
import type { RecetteHebdoListItem } from "../types";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { DollarOutlined, AuditOutlined, PlusOutlined, BankOutlined, FileTextOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export function RecettesList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState<number>(1);
  const [selectedParkingNom, setSelectedParkingNom] = useState<string>("Parking Agdal Gare");
  const [selectedPaiementIds, setSelectedPaiementIds] = useState<React.Key[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["recettes"],
    queryFn: getRecettesMock,
  });

  const { data: paiementsAEncasser = [], isLoading: isLoadingPaiements } = useQuery({
    queryKey: ["paiementsAEncasser", selectedParkingId],
    queryFn: () => getPaiementsAEncasserMock(selectedParkingId),
    enabled: isModalOpen,
  });

  const createRecetteMutation = useMutation({
    mutationFn: creerRecetteSupervisorMock,
    onSuccess: (newRecette) => {
      message.success(`Recette hebdomadaire ${newRecette.reference} pour ${newRecette.parkingNom} générée avec succès !`);
      setIsModalOpen(false);
      setSelectedPaiementIds([]);
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
      navigate(`${basePath}/recettes/${newRecette.id}`);
    },
  });

  const totalGlobal = data?.reduce((acc, r) => acc + r.totalHebdo, 0) || 0;
  const totalEspeces = data?.reduce((acc, r) => acc + (r.totalEspeces || 0), 0) || 0;
  const totalCheques = data?.reduce((acc, r) => acc + (r.totalCheques || 0), 0) || 0;
  const countCheques = data?.reduce((acc, r) => acc + (r.nombreCheques || 0), 0) || 0;

  // Payments selected calculation
  const paiementsCoches = paiementsAEncasser.filter((p) => selectedPaiementIds.includes(p.id));
  const montantEspecesCoche = paiementsCoches.filter((p) => p.modePaiement === "ESPECES").reduce((a, b) => a + b.montant, 0);
  const mePaiementsChequeCoche = paiementsCoches.filter((p) => p.modePaiement === "CHEQUE");
  const montantChequesCoche = mePaiementsChequeCoche.reduce((a, b) => a + b.montant, 0);
  const totalRecetteCalculee = montantEspecesCoche + montantChequesCoche;

  const handleOpenModal = () => {
    setSelectedPaiementIds([]);
    setIsModalOpen(true);
  };

  const handleGenerateRecetteSubmit = () => {
    if (paiementsCoches.length === 0) {
      message.warning("Veuillez cocher au moins un paiement à inclure dans l'arrêté de recette !");
      return;
    }

    createRecetteMutation.mutate({
      parkingId: selectedParkingId,
      parkingNom: selectedParkingNom,
      semaineAnnee: "Semaine 34 (2026)",
      paiementsChoisis: paiementsCoches,
    });
  };

  const columnsPaiementsSelection = [
    {
      title: "Réf Paiement",
      dataIndex: "referencePaiement",
      key: "referencePaiement",
      render: (r: string) => <Tag color="blue">{r}</Tag>,
    },
    { title: "Client / Titulaire", dataIndex: "clientNom", key: "clientNom" },
    {
      title: "Mode de Règlement",
      dataIndex: "modePaiement",
      key: "modePaiement",
      render: (mode: string) => (
        <Tag color={mode === "ESPECES" ? "green" : "purple"}>
          {mode === "ESPECES" ? "Espèces (Liquide)" : "Chèque"}
        </Tag>
      ),
    },
    {
      title: "Détails Chèque / N°",
      key: "detailsCheque",
      render: (_: unknown, record: PaiementAEncasserRecette) =>
        record.modePaiement === "CHEQUE" ? (
          <span style={{ fontSize: 12, color: "#6b21a8" }}>
            {record.numeroCheque} ({record.banque})
          </span>
        ) : (
          <span style={{ color: "#94a3b8" }}>—</span>
        ),
    },
    {
      title: "Date",
      dataIndex: "datePaiement",
      key: "datePaiement",
    },
    {
      title: "Montant",
      dataIndex: "montant",
      key: "montant",
      render: (val: number) => <strong style={{ color: "#0369a1" }}>{val.toLocaleString("fr-FR")} DH</strong>,
    },
  ];

  const columns = [
    {
      title: "Référence Bordereau",
      dataIndex: "reference",
      key: "reference",
      render: (ref: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{ref}</Tag>,
    },
    { title: "Parking / Gare", dataIndex: "parkingNom", key: "parkingNom" },
    { title: "Période", dataIndex: "semaineAnnee", key: "semaineAnnee" },
    {
      title: "Total Espèces (Liquide)",
      dataIndex: "totalEspeces",
      key: "totalEspeces",
      render: (val: number) => <span style={{ color: "#16a34a", fontWeight: 600 }}>{(val || 0).toLocaleString("fr-FR")} DH</span>,
    },
    {
      title: "Total Chèques",
      dataIndex: "totalCheques",
      key: "totalCheques",
      render: (val: number, record: RecetteHebdoListItem) => (
        <span>
          {(val || 0).toLocaleString("fr-FR")} DH{" "}
          {record.nombreCheques ? <Tag color="purple" style={{ marginLeft: 4 }}>{record.nombreCheques} chèque(s)</Tag> : null}
        </span>
      ),
    },
    {
      title: "Recette Totale Hebdo",
      dataIndex: "totalHebdo",
      key: "totalHebdo",
      render: (val: number) => <strong style={{ color: "#0369a1", fontSize: 14 }}>{val.toLocaleString("fr-FR")} DH TTC</strong>,
    },
    {
      title: "Statut Règlement",
      dataIndex: "statut",
      key: "statut",
      render: (statut: RecetteHebdoListItem["statut"]) => <StatusBadge statut={statut} />,
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion & Remise des Recettes Hebdomadaires</Title>
          <Text type="secondary">Centralisation des encaissements (Espèces & Chèques) par le Superviseur vers la Comptabilité</Text>
        </div>
        {(role === "SUPERVISEUR" || role === "RESPONSABLE") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            style={{ backgroundColor: "#0284c7" }}
          >
            Créer un Arrêté de Recette par Sélection
          </Button>
        )}
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
            <Statistic
              title="Recette Hebdo Cumulée"
              value={totalGlobal}
              suffix="DH"
              prefix={<DollarOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ color: "#0369a1", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
            <Statistic
              title="Espèces à Verser (Liquide)"
              value={totalEspeces}
              suffix="DH"
              prefix={<BankOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ color: "#15803d", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
            <Statistic
              title="Chèques à Remettre"
              value={totalCheques}
              suffix={`DH (${countCheques} chq)`}
              prefix={<FileTextOutlined style={{ color: "#9333ea" }} />}
              valueStyle={{ color: "#7e22ce", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" style={{ backgroundColor: "#fff7ed", borderColor: "#ffedd5" }}>
            <Statistic
              title="Transmissions Comptables"
              value={data?.filter((r) => r.statut === "VALIDEE_COMPTABILITE" || r.statut === "TRANSMIS_COMPTABILITE").length || 0}
              suffix={`/ ${data?.length || 0}`}
              prefix={<AuditOutlined style={{ color: "#ea580c" }} />}
              valueStyle={{ color: "#c2410c", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`${basePath}/recettes/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      {/* MODALE DE GÉNÉRATION PAR LE SUPERVISEUR (SÉLECTION DES PAIEMENTS COCHÉS & CHOIX PARKING) */}
      <Modal
        title="Créer un Arrêté de Recette Hebdomadaire (Superviseur)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={createRecetteMutation.isPending}
            onClick={handleGenerateRecetteSubmit}
            style={{ backgroundColor: "#0284c7" }}
          >
            Générer l'Arrêté de Recette ({totalRecetteCalculee.toLocaleString("fr-FR")} DH)
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            message="Procédure de la Recette Hebdomadaire par le Superviseur"
            description="Sélectionnez le parking/gare de destination, puis cochez dans la liste ci-dessous les paiements (espèces & chèques) que vous avez physiquement récupérés auprès des agents."
            type="info"
            showIcon
          />

          <Row gutter={16} align="middle">
            <Col span={12}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Choisir la Gare / Parking :</label>
              <Select
                size="large"
                style={{ width: "100%" }}
                value={selectedParkingId}
                onChange={(val) => {
                  setSelectedParkingId(val);
                  const nom = val === 1 ? "Parking Agdal Gare" : val === 2 ? "Parking Hassan II" : "Parking Bab El Had";
                  setSelectedParkingNom(nom);
                  setSelectedPaiementIds([]);
                }}
              >
                <Option value={1}>Parking Agdal Gare (Rabat Agdal)</Option>
                <Option value={2}>Parking Hassan II (Rabat Ville)</Option>
                <Option value={3}>Parking Bab El Had</Option>
              </Select>
            </Col>
            <Col span={12}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Période de la Recette :</label>
              <Tag color="geekblue" style={{ fontSize: 14, padding: "6px 12px" }}>Semaine 34 (2026)</Tag>
            </Col>
          </Row>

          <Text style={{ fontWeight: 600, display: "block", marginTop: 8 }}>
            Cochez les encaissements perçus pour ce parking ({paiementsAEncasser.length} paiements en attente) :
          </Text>

          <Table<PaiementAEncasserRecette>
            columns={columnsPaiementsSelection}
            dataSource={paiementsAEncasser}
            loading={isLoadingPaiements}
            rowKey="id"
            pagination={false}
            size="small"
            rowSelection={{
              selectedRowKeys: selectedPaiementIds,
              onChange: (keys) => setSelectedPaiementIds(keys),
            }}
          />

          {/* Synthèse dynamique des paiements cochés */}
          <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 12 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Text type="secondary">Espèces Liquide Cochées :</Text>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>
                  {montantEspecesCoche.toLocaleString("fr-FR")} DH
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Chèques Physiques Cochés :</Text>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#7e22ce" }}>
                  {montantChequesCoche.toLocaleString("fr-FR")} DH ({mePaiementsChequeCoche.length} chq)
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Total Recette Calculée :</Text>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0369a1" }}>
                  {totalRecetteCalculee.toLocaleString("fr-FR")} DH TTC
                </div>
              </Col>
            </Row>
          </div>
        </Space>
      </Modal>
    </Card>
  );
}