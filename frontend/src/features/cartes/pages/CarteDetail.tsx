import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, Modal, Input, message, Tag, Space, Alert, Divider } from "antd";
import { PrinterOutlined, SafetyCertificateOutlined, PoweroffOutlined, ArrowLeftOutlined, IdcardOutlined } from "@ant-design/icons";
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
      message.success("Carte d'accès activée et transmise au système externe de barrières !");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["carte", carteId] });
      queryClient.invalidateQueries({ queryKey: ["cartes"] });
    },
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const canManage = role === "AGENT" || role === "SUPERVISEUR";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`${basePath}/cartes`)} style={{ alignSelf: "flex-start" }}>
        Retour à la liste des cartes
      </Button>

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              <IdcardOutlined /> Gestion Carte d'Accès RFID: {data.numeroCarte}
            </span>
            <StatusBadge statut={data.statut} />
          </div>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="N° Badge RFID">
            <Tag color="blue" style={{ fontSize: 13, fontWeight: 600 }}>{data.numeroCarte}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Statut Carte">
            <StatusBadge statut={data.statut} />
          </Descriptions.Item>
          <Descriptions.Item label="Nom du Titulaire">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Référence Abonnement">{data.abonnementReference}</Descriptions.Item>
          {data.datePreparation && (
            <Descriptions.Item label="Préparée / Imprimée le">{data.datePreparation}</Descriptions.Item>
          )}
          {data.preparePar && (
            <Descriptions.Item label="Opérateur">{data.preparePar}</Descriptions.Item>
          )}
          {data.dateActivation && (
            <Descriptions.Item label="Activée le">{data.dateActivation}</Descriptions.Item>
          )}
          {data.activePar && (
            <Descriptions.Item label="Activée par">{data.activePar}</Descriptions.Item>
          )}
          {data.noteActivation && (
            <Descriptions.Item label="Remarques Activation" span={2}>{data.noteActivation}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider titlePlacement="left">Système Externe de Gestion des Barrières d'Accès</Divider>

        <Alert
          message={
            data.statut === "ACTIVE"
              ? "Carte d'accès synchronisée et ACTIVE sur le système de barrières du parking."
              : "Carte d'accès en attente d'activation sur les barrières du parking."
          }
          type={data.statut === "ACTIVE" ? "success" : "warning"}
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 16 }}
        />

        {canManage && (
          <Space wrap style={{ marginTop: 12 }}>
            {data.statut === "A_ACTIVER" && (
              <Button
                type="primary"
                icon={<SafetyCertificateOutlined />}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                onClick={() => setModalOpen(true)}
              >
                Activer sur le Système de Barrières
              </Button>
            )}

            <Button
              icon={<PrinterOutlined />}
              onClick={() => {
                message.info("Lancement de l'impression physique de la carte RFID...");
                window.print();
              }}
            >
              Imprimer la Carte RFID
            </Button>

            {data.statut === "ACTIVE" && (
              <Button
                danger
                icon={<PoweroffOutlined />}
                onClick={() => message.warning("Demande de désactivation transmise aux barrières.")}
              >
                Désactiver la Carte sur les Barrières
              </Button>
            )}
          </Space>
        )}

        <Modal
          title="Activation de la Carte sur Système Externe de Barrières"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => activerMutation.mutate()}
          confirmLoading={activerMutation.isPending}
          okText="Confirmer & Synchroniser Barrières"
          cancelText="Annuler"
        >
          <p>
            Veuillez saisir une remarque ou le code de programmation RFID avant de valider l'activation sur les barrières du parking.
          </p>
          <Input.TextArea
            placeholder="Note d'activation (ex: Badge physique remis au guichet client...)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </Modal>
      </Card>
    </div>
  );
}