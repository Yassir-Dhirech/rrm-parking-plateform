import { useParams } from "react-router-dom";
import { Card, Descriptions, Button, Space, Table, Modal, message, Spin, Typography, Tag } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { getRecetteByIdMock, validerRecetteMock } from "../../../api/recettesMock";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import type { RecetteJournee } from "../types";

const { Title } = Typography;

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
      message.success("Recette hebdomadaire validée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["recette", recetteId] });
      queryClient.invalidateQueries({ queryKey: ["recettes"] });
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (!recette) return <Card>Recette introuvable</Card>;

  const handleValider = () => {
    Modal.confirm({
      title: "Validation de la recette hebdomadaire",
      content: `Valider l'arrêté de caisse pour ${recette.parkingNom} (${recette.semaineAnnee}) au montant de ${recette.totalHebdo.toLocaleString("fr-FR")} MAD ?`,
      okText: "Valider la recette",
      cancelText: "Annuler",
      onOk: () => validerMutation.mutateAsync(recette.id),
    });
  };

  const columnsDetail = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Transactions", dataIndex: "nombreTransactions", key: "nombreTransactions" },
    {
      title: "Espèces (MAD)",
      dataIndex: "montantEspeces",
      key: "montantEspeces",
      render: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      title: "TPE / Carte (MAD)",
      dataIndex: "montantCarte",
      key: "montantCarte",
      render: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      title: "Virement (MAD)",
      dataIndex: "montantVirement",
      key: "montantVirement",
      render: (v: number) => v.toLocaleString("fr-FR"),
    },
    {
      title: "Total Journée (MAD)",
      dataIndex: "totalJournee",
      key: "totalJournee",
      render: (v: number) => <strong>{v.toLocaleString("fr-FR")} MAD</strong>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card extra={<StatusBadge statut={recette.statut} />}>
        <Title level={4}>Arrêté de Caisse : {recette.reference}</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Parking">{recette.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Période">{recette.semaineAnnee}</Descriptions.Item>
          <Descriptions.Item label="Date de début">{recette.dateDebut}</Descriptions.Item>
          <Descriptions.Item label="Date de fin">{recette.dateFin}</Descriptions.Item>
          <Descriptions.Item label="Total Encaissements">
            <Tag color="teal" style={{ fontSize: "14px", padding: "4px 8px" }}>
              {recette.totalHebdo.toLocaleString("fr-FR")} MAD
            </Tag>
          </Descriptions.Item>
          {recette.validePar && (
            <Descriptions.Item label="Validé par">
              {recette.validePar} (le {recette.dateValidation})
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            Imprimer l'arrêté de caisse
          </Button>

          {role === "SUPERVISEUR" && recette.statut === "EN_COURS" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="large"
              loading={validerMutation.isPending}
              onClick={handleValider}
            >
              Valider la recette hebdomadaire
            </Button>
          )}
        </div>
      </Card>

      <Card title="Détail des Encaissements par Journee">
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