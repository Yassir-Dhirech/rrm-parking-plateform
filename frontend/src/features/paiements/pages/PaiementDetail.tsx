import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Descriptions, Button, Space } from "antd";
import {
  ArrowLeftOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { getPaiementByIdMock } from "../../../api/paiementsMock";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { modePaiementLabels } from "../../../lib/enums";
import { formatDate } from "../../../lib/dateUtils";
import { useAuth } from "../../../context/AuthContext";
import { roleConfig } from "../../../lib/roleConfig";
import { RecuPaiementModal, type RecuPaiementData } from "../../../components/recu/RecuPaiementModal";

export function PaiementDetail() {
  const { id } = useParams<{ id: string }>();
  const paiementId = Number(id);
  const { role } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? roleConfig[role].homePath : "";

  const [recuModalOpen, setRecuModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["paiement", paiementId],
    queryFn: () => getPaiementByIdMock(paiementId),
  });

  if (isLoading || !data) {
    return <Card loading />;
  }

  const recuData: RecuPaiementData = {
    referenceQuittance: data.reference,
    abonnementReference: data.abonnementReference,
    datePaiement: data.datePaiement,
    clientNom: data.clientNom,
    clientEmail: "client.rrm@example.com",
    montantAbonnement: data.montantAbonnement || data.montant - (data.fraisCarteRfid || 0),
    fraisCarteRfid: data.fraisCarteRfid,
    montantTotal: data.montant,
    modePaiement: data.modePaiement as any,
    numeroCheque: data.numeroCheque,
    banque: data.banque,
    caissierNom: data.enregistrePar,
  };

  return (
    <>
      <Card
        title={`Paiement ${data.reference}`}
        extra={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`${basePath}/paiements`)}
            >
              Retour
            </Button>
            <Button
              icon={<FileDoneOutlined style={{ color: "#16a34a" }} />}
              onClick={() => setRecuModalOpen(true)}
              style={{ fontWeight: 600, color: "#16a34a", borderColor: "#86efac" }}
            >
              Reçu de Paiement
            </Button>
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => navigate(`${basePath}/factures/${data.factureId || data.id}`)}
              style={{ backgroundColor: "#006398", borderColor: "#006398", fontWeight: 700 }}
            >
              Consulter la Facture Officielle
            </Button>
          </Space>
        }
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
          <Descriptions.Item label="Statut du Règlement">
            <StatusBadge statut={data.statut} />
          </Descriptions.Item>
          <Descriptions.Item label="Facture Associée">
            <Button
              type="link"
              icon={<FileDoneOutlined />}
              onClick={() => navigate(`${basePath}/factures/${data.factureId || data.id}`)}
              style={{ padding: 0, fontWeight: 700, color: "#006398" }}
            >
              {data.factureNumero || `FACT-RRM-2026-00000${data.id}`}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Mode de Règlement">
            {modePaiementLabels[data.modePaiement]}
          </Descriptions.Item>
          <Descriptions.Item label="Souscripteur / Client">{data.clientNom}</Descriptions.Item>
          <Descriptions.Item label="Coût Abonnement">
            {(data.montantAbonnement || data.montant - (data.fraisCarteRfid || 0)).toLocaleString("fr-FR")} MAD
          </Descriptions.Item>
          <Descriptions.Item label="Frais de Carte RFID">
            {data.fraisCarteRfid && data.fraisCarteRfid > 0 ? (
              <span style={{ fontWeight: 700, color: "#d97706" }}>
                +{data.fraisCarteRfid.toLocaleString("fr-FR")} MAD TTC (Nouvelle Carte)
              </span>
            ) : (
              <span style={{ fontWeight: 700, color: "#16a34a" }}>
                0 MAD (Carte existante réactivée)
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Total Net Quittancé (TTC)">
            <strong style={{ color: "#16a34a", fontSize: 16 }}>
              {data.montant.toLocaleString("fr-FR")} MAD TTC
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="Abonnement Rattaché">
            <span style={{ fontWeight: 700, color: "#006398" }}>{data.abonnementReference}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Date d'Encaissement">{formatDate(data.datePaiement)}</Descriptions.Item>
          <Descriptions.Item label="Enregistré par">{data.enregistrePar}</Descriptions.Item>
          {data.numeroCheque && (
            <Descriptions.Item label="N° chèque">{data.numeroCheque}</Descriptions.Item>
          )}
          {data.banque && <Descriptions.Item label="Banque">{data.banque}</Descriptions.Item>}
        </Descriptions>
      </Card>

      <RecuPaiementModal
        open={recuModalOpen}
        onClose={() => setRecuModalOpen(false)}
        data={recuData}
      />
    </>
  );
}
