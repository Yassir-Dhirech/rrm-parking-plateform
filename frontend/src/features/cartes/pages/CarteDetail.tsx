import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Modal, Input, message } from "antd";
import { getCarteByIdMock, activerCarteMock } from "../../../api/cartesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";

export function CarteDetail() {
  const { id } = useParams<{ id: string }>();
  const carteId = Number(id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = role ? roleConfig[role].homePath : "";

  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["carte", carteId],
    queryFn: () => getCarteByIdMock(carteId),
  });

  const activerMutation = useMutation({
    mutationFn: () => activerCarteMock(carteId, note),
    onSuccess: () => {
      message.success("Carte activée");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["carte", carteId] });
      queryClient.invalidateQueries({ queryKey: ["cartes"] });
      navigate(`${basePath}/cartes`);
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canActiver = role === "SUPERVISEUR" && data.statut === "A_ACTIVER";

  return (
    <Card title={`Carte ${data.numeroCarte}`}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Statut">
          <StatusBadge statut={data.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Abonnement">{data.abonnementReference}</Descriptions.Item>
        {data.datePreparation && (
          <Descriptions.Item label="Préparée le">{data.datePreparation}</Descriptions.Item>
        )}
        {data.preparePar && (
          <Descriptions.Item label="Préparée par">{data.preparePar}</Descriptions.Item>
        )}
        {data.dateActivation && (
          <Descriptions.Item label="Activée le">{data.dateActivation}</Descriptions.Item>
        )}
        {data.activePar && (
          <Descriptions.Item label="Activée par">{data.activePar}</Descriptions.Item>
        )}
        {data.noteActivation && (
          <Descriptions.Item label="Note" span={2}>{data.noteActivation}</Descriptions.Item>
        )}
      </Descriptions>

      {canActiver && (
        <Button
          type="primary"
          style={{ marginTop: 24 }}
          onClick={() => setModalOpen(true)}
        >
          Activer la carte
        </Button>
      )}

      <Modal
        title="Activer la carte"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => activerMutation.mutate()}
        confirmLoading={activerMutation.isPending}
        okText="Confirmer l'activation"
      >
        <Input.TextArea
          placeholder="Note (référence externe, remarque...)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </Modal>
    </Card>
  );
}