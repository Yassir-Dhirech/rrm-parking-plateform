import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Descriptions, Button, message, Tag, Space, Alert, Divider, Steps } from "antd";
import { PrinterOutlined, SafetyCertificateOutlined, ArrowLeftOutlined, IdcardOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { getCarteByIdMock, toggleCarteStepMock } from "../../../api/cartesMock";
import { sendClientNotificationMock } from "../../../api/clientNotificationsMock";
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

  const { data, isLoading } = useQuery({
    queryKey: ["carte", carteId],
    queryFn: () => getCarteByIdMock(carteId),
  });

  const toggleStepMutation = useMutation({
    mutationFn: (step: "IMPRESSION" | "TEST" | "DELIVRANCE") => toggleCarteStepMock(carteId, step),
    onSuccess: (updatedCard, step) => {
      queryClient.setQueryData(["carte", carteId], updatedCard);
      queryClient.invalidateQueries({ queryKey: ["cartes"] });
      message.success(`Étape mise à jour : Statut "${updatedCard.statut}"`);

      // Trigger automatic SMS & Email notification when card is confirmed ready for pickup
      if (step === "TEST" && updatedCard.estTestee) {
        sendClientNotificationMock({
          channel: "BOTH",
          typeEvenement: "CARTE_PRETE",
          destinataireNom: updatedCard.clientNom,
          destinataireEmail: `${updatedCard.clientNom.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          destinataireTelephone: "0612345678",
          sujet: `RRM - Carte RFID disponible pour ${updatedCard.clientNom}`,
          contenu: `Bonjour ${updatedCard.clientNom}, votre carte RFID pour l'abonnement ${updatedCard.abonnementReference} est testée et disponible au guichet RRM.`,
        });
      }
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
              <IdcardOutlined /> Registre Carte d'Accès RFID : {data.numeroCarte}
            </span>
            <StatusBadge statut={data.statut} />
          </div>
        }
      >
        {/* Sequential Status Chain Visual Stepper */}
        <div style={{ marginBottom: 24, padding: "16px 20px", backgroundColor: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <Steps
            current={
              data.estDelivree ? 3 : data.estTestee ? 2 : data.estImprimee ? 1 : 0
            }
            items={[
              {
                title: "1. Abonnement Payé",
                description: "En attente d'impression",
              },
              {
                title: "2. Carte Imprimée",
                description: data.estImprimee ? `Imprimée (${data.dateImpression || "Oui"})` : "Non imprimée",
              },
              {
                title: "3. Testée & Validée",
                description: data.estTestee ? "Prête à récupérer" : "Non testée",
              },
              {
                title: "4. Délivrée au Client",
                description: data.estDelivree ? `Délivrée (${data.dateDelivrance || "Oui"})` : "Au guichet",
              },
            ]}
          />
        </div>

        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="N° Badge RFID">
            <Tag color="blue" style={{ fontSize: 13, fontWeight: 600 }}>{data.numeroCarte}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Statut Global Registre">
            <StatusBadge statut={data.statut} />
          </Descriptions.Item>

          <Descriptions.Item label="Impression Physique Badge">
            {data.estImprimee ? (
              <Tag color="green" style={{ fontWeight: 600 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                Imprimée le {data.dateImpression || "17/08/2026"}
              </Tag>
            ) : (
              <Tag color="orange" style={{ fontWeight: 600 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Non Imprimée (En Attente)
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Test & Confirmation RFID">
            {data.estTestee ? (
              <Tag color="green" style={{ fontWeight: 600 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                Testée & Validée par {data.testePar || "Agent Rachid"}
              </Tag>
            ) : (
              <Tag color="volcano" style={{ fontWeight: 600 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Non Testée
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Délivrance à l'Abonné">
            {data.estDelivree ? (
              <Tag color="purple" style={{ fontWeight: 600 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                Délivrée au guichet le {data.dateDelivrance || "19/08/2026"}
              </Tag>
            ) : (
              <Tag color="gold" style={{ fontWeight: 600 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Non Délivrée (À récupérer au guichet)
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Nom du Titulaire">
            <strong>{data.clientNom}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Référence Abonnement">{data.abonnementReference}</Descriptions.Item>
          {data.datePreparation && (
            <Descriptions.Item label="Préparée le">{data.datePreparation}</Descriptions.Item>
          )}
          {data.preparePar && (
            <Descriptions.Item label="Opérateur">{data.preparePar}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider titlePlacement="left">Information & Suivi Administratif de la Carte</Divider>

        <Alert
          message={
            data.estDelivree
              ? "Carte d'accès RFID imprimée, testée et délivrée à l'abonné au guichet RRM."
              : data.estTestee
              ? "Carte RFID imprimée et testée avec succès, prête pour délivrance au guichet."
              : data.estImprimee
              ? "Carte RFID imprimée, en attente de test de fonctionnement."
              : "Carte d'accès enregistrée en attente d'impression physique."
          }
          type={data.estDelivree ? "success" : "info"}
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 16 }}
        />

        {canManage && (
          <Space wrap size="middle" style={{ marginTop: 16 }}>
            <Button
              type={!data.estImprimee ? "primary" : "default"}
              icon={<PrinterOutlined />}
              loading={toggleStepMutation.isPending}
              onClick={() => toggleStepMutation.mutate("IMPRESSION")}
              style={{ fontWeight: 600, borderRadius: 8, padding: "6px 16px" }}
            >
              {!data.estImprimee ? "Étape 2 : Confirmer Impression physique" : "Annuler statut Impression"}
            </Button>

            <Button
              type={data.estImprimee && !data.estTestee ? "primary" : "default"}
              icon={<CheckCircleOutlined />}
              style={data.estImprimee && !data.estTestee ? { backgroundColor: "#d97706", borderColor: "#d97706", fontWeight: 600, borderRadius: 8, padding: "6px 16px" } : { fontWeight: 600, borderRadius: 8, padding: "6px 16px" }}
              loading={toggleStepMutation.isPending}
              onClick={() => toggleStepMutation.mutate("TEST")}
            >
              {!data.estTestee ? "Étape 3 : Confirmer Test RFID (Notifier Client)" : "Annuler statut Test"}
            </Button>

            <Button
              type={data.estTestee && !data.estDelivree ? "primary" : "default"}
              icon={<SafetyCertificateOutlined />}
              style={data.estTestee && !data.estDelivree ? { backgroundColor: "#16a34a", borderColor: "#16a34a", fontWeight: 600, borderRadius: 8, padding: "6px 16px" } : { fontWeight: 600, borderRadius: 8, padding: "6px 16px" }}
              loading={toggleStepMutation.isPending}
              onClick={() => toggleStepMutation.mutate("DELIVRANCE")}
            >
              {!data.estDelivree ? "Étape 4 : Confirmer Remise Client" : "Annuler statut Délivrance"}
            </Button>
          </Space>
        )}
      </Card>
    </div>
  );
}