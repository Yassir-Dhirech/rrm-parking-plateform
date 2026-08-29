import { useParams } from "react-router-dom";
import { Card, Descriptions, Button, Space, Table, Modal, message, Spin, Typography } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContratByIdMock, signerContratMock } from "../../../api/contratsMock";
import { useAuth } from "../../../context/AuthContext";
import { StatusBadge } from "../../../components/ui/StatusBadge";

const { Title } = Typography;

export function ContratDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const contratId = Number(id);

  const { data: contrat, isLoading } = useQuery({
    queryKey: ["contrat", contratId],
    queryFn: () => getContratByIdMock(contratId),
    enabled: !!contratId,
  });

  const signMutation = useMutation({
    mutationFn: signerContratMock,
    onSuccess: () => {
      message.success("Contrat signé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["contrat", contratId] });
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (!contrat) return <Card>Contrat introuvable</Card>;

  const handleSigner = () => {
    Modal.confirm({
      title: "Confirmer la signature du contrat",
      content: `Êtes-vous sûr de vouloir signer le contrat ${contrat.reference} pour l'entreprise ${contrat.entrepriseNom} ?`,
      okText: "Signer",
      cancelText: "Annuler",
      onOk: () => signMutation.mutateAsync(contrat.id),
    });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Card
        extra={<StatusBadge statut={contrat.statut} />}
      >
        <Title level={4}>Contrat : {contrat.reference}</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Entreprise">{contrat.entrepriseNom}</Descriptions.Item>
          <Descriptions.Item label="ICE Entreprise">{contrat.iceEntreprise}</Descriptions.Item>
          <Descriptions.Item label="Parking">{contrat.parkingNom}</Descriptions.Item>
          <Descriptions.Item label="Nombre de places">{contrat.nombrePlaces}</Descriptions.Item>
          <Descriptions.Item label="Période">
            Du {contrat.dateDebut} au {contrat.dateFin}
          </Descriptions.Item>
          <Descriptions.Item label="Montant HT / mois">
            {contrat.montantMensuelHT} MAD
          </Descriptions.Item>
          <Descriptions.Item label="Montant TTC / mois">
            {contrat.montantMensuelTTC} MAD
          </Descriptions.Item>
          {contrat.dateSignature && (
            <Descriptions.Item label="Signé le">{contrat.dateSignature}</Descriptions.Item>
          )}
        </Descriptions>

        {role === "RESPONSABLE" && contrat.statut === "EN_ATTENTE_SIGNATURE" && (
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button
              type="primary"
              size="large"
              loading={signMutation.isPending}
              onClick={handleSigner}
            >
              Signer le contrat
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <Title level={5}>Véhicules rattachés au contrat</Title>
        <Table
          dataSource={contrat.vehicules}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            { title: "Immatriculation", dataIndex: "immatriculation", key: "immatriculation" },
            { title: "Marque", dataIndex: "marque", key: "marque" },
            { title: "Modèle", dataIndex: "modele", key: "modele" },
          ]}
        />
      </Card>
    </Space>
  );
}