import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Descriptions } from "antd";
import { getPaiementByIdMock } from "../../../api/paiementsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { modePaiementLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";

export function PaiementDetail() {
  const { id } = useParams<{ id: string }>();
  const paiementId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ["paiement", paiementId],
    queryFn: () => getPaiementByIdMock(paiementId),
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  return (
    <Card title={`Paiement ${data.reference}`}>
      <Descriptions column={2} bordered>
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
        {data.referenceVirement && (
          <Descriptions.Item label="Réf. virement">{data.referenceVirement}</Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}
