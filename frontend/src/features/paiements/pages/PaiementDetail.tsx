import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Descriptions, Button, Space } from "antd";
import { ArrowLeftOutlined, FileDoneOutlined } from "@ant-design/icons";
import { getPaiementByIdMock } from "../../../api/paiementsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { modePaiementLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

export function PaiementDetail() {
  const { id } = useParams<{ id: string }>();
  const paiementId = Number(id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["paiement", paiementId],
    queryFn: () => getPaiementByIdMock(paiementId),
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  return (
    <Card
      title={`Paiement ${data.reference}`}
      extra={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`${basePath}/paiements`)}
          >
            Retour
          </Button>
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => navigate(`${basePath}/factures/1`)}
            style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
          >
            Consulter / Générer la Facture
          </Button>
        </Space>
      }
    >
      <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
        <Descriptions.Item label="Statut">
          <StatusBadge statut={data.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Mode">
          {modePaiementLabels[data.modePaiement]}
        </Descriptions.Item>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Montant">{data.montant.toLocaleString("fr-FR")} MAD</Descriptions.Item>
        <Descriptions.Item label="Abonnement">{data.abonnementReference}</Descriptions.Item>
        <Descriptions.Item label="Date">{formatDate(data.datePaiement)}</Descriptions.Item>
        <Descriptions.Item label="Enregistré par">{data.enregistrePar}</Descriptions.Item>
        {data.numeroCheque && (
          <Descriptions.Item label="N° chèque">{data.numeroCheque}</Descriptions.Item>
        )}
        {data.banque && <Descriptions.Item label="Banque">{data.banque}</Descriptions.Item>}
      </Descriptions>
    </Card>
  );
}
