import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Space, Modal, Input, message } from "antd";
import {
  getDemandeByIdMock,
  validerDemandeMock,
  rejeterDemandeMock,
} from "../../../api/demandesMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";

export function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const demandeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [raison, setRaison] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["demande", demandeId],
    queryFn: () => getDemandeByIdMock(demandeId),
  });

  const validerMutation = useMutation({
    mutationFn: () => validerDemandeMock(demandeId),
    onSuccess: () => {
      message.success("Demande validée");
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
      navigate("/agent/demandes");
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: () => rejeterDemandeMock(demandeId, raison),
    onSuccess: () => {
      message.success("Demande rejetée");
      setRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["demande", demandeId] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
      navigate("/agent/demandes");
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canAct = role === "AGENT" && data.statut === "SOUMISE";

  return (
    <Card title={`Demande ${data.reference}`}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Statut">
          <StatusBadge statut={data.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          {data.typeDemande === "NOUVEL_ABONNEMENT" ? "Nouvel abonnement" : "Renouvellement"}
        </Descriptions.Item>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Parking">{data.parkingNom}</Descriptions.Item>
        <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
        <Descriptions.Item label="Téléphone">{data.telephone}</Descriptions.Item>
        <Descriptions.Item label="Immatriculation">{data.immatriculation}</Descriptions.Item>
        <Descriptions.Item label="Type véhicule">{data.typeVehicule}</Descriptions.Item>
        <Descriptions.Item label="Date de création">{data.dateCreation}</Descriptions.Item>
      </Descriptions>

      {canAct && (
        <Space style={{ marginTop: 24 }}>
          <Button
            type="primary"
            onClick={() => validerMutation.mutate()}
            loading={validerMutation.isPending}
          >
            Valider
          </Button>
          <Button danger onClick={() => setRejectModalOpen(true)}>
            Rejeter
          </Button>
        </Space>
      )}

      <Modal
        title="Rejeter la demande"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => rejeterMutation.mutate()}
        confirmLoading={rejeterMutation.isPending}
        okText="Confirmer le rejet"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          placeholder="Raison du rejet"
          value={raison}
          onChange={(e) => setRaison(e.target.value)}
          rows={3}
        />
      </Modal>
    </Card>
  );
}