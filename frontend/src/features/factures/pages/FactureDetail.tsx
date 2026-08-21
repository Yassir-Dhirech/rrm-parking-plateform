import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, message } from "antd";
import { getFactureByIdMock, signerFactureMock } from "../../../api/facturesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { formatDate } from "../../../lib/dateUtils";

export function FactureDetail() {
  const { id } = useParams<{ id: string }>();
  const factureId = Number(id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const { data, isLoading } = useQuery({
    queryKey: ["facture", factureId],
    queryFn: () => getFactureByIdMock(factureId),
  });

  const signerMutation = useMutation({
    mutationFn: () => signerFactureMock(factureId),
    onSuccess: () => {
      message.success("Facture signée");
      queryClient.invalidateQueries({ queryKey: ["facture", factureId] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      navigate(`${basePath}/factures`);
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canSigner = role === "RESPONSABLE" && data.statut === "EMISE";

  return (
    <Card title={`Facture ${data.numero}`}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Statut">
          <StatusBadge statut={data.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Montant HT">{data.montantHt.toLocaleString("fr-FR")} MAD</Descriptions.Item>
        <Descriptions.Item label="TVA">{data.tauxTva}%</Descriptions.Item>
        <Descriptions.Item label="Montant TVA">{data.montantTva.toLocaleString("fr-FR")} MAD</Descriptions.Item>
        <Descriptions.Item label="Montant TTC">{data.montantTtc.toLocaleString("fr-FR")} MAD</Descriptions.Item>
        <Descriptions.Item label="Abonnement">{data.abonnementReference}</Descriptions.Item>
        <Descriptions.Item label="Date émission">{formatDate(data.dateEmission)}</Descriptions.Item>
        <Descriptions.Item label="Générée par">{data.genereePar}</Descriptions.Item>
        {data.signeePar && <Descriptions.Item label="Signée par">{data.signeePar}</Descriptions.Item>}
      </Descriptions>

      {canSigner && (
        <Button
          type="primary"
          style={{ marginTop: 24 }}
          onClick={() => signerMutation.mutate()}
          loading={signerMutation.isPending}
        >
          Signer la facture
        </Button>
      )}
    </Card>
  );
}