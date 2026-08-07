import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Descriptions } from "antd";
import { getAbonnementByIdMock } from "../../../api/abonnementsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";

export function AbonnementDetail() {
  const { id } = useParams<{ id: string }>();
  const abonnementId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ["abonnement", abonnementId],
    queryFn: () => getAbonnementByIdMock(abonnementId),
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  return (
    <Card title={`Abonnement ${data.reference}`}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Statut">
          <StatusBadge statut={data.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          {data.type === "REGULIER" ? "Régulier" : "Entreprise"}
        </Descriptions.Item>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Parking">{data.parkingNom}</Descriptions.Item>
        <Descriptions.Item label="Date début">{data.dateDebut}</Descriptions.Item>
        <Descriptions.Item label="Date fin">{data.dateFin}</Descriptions.Item>
        {data.vehiculeImmatriculation && (
          <Descriptions.Item label="Véhicule">{data.vehiculeImmatriculation}</Descriptions.Item>
        )}
        {data.planTarifaireNom && (
          <Descriptions.Item label="Plan tarifaire">{data.planTarifaireNom}</Descriptions.Item>
        )}
        <Descriptions.Item label="Montant total">{data.montantTotal} MAD</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}