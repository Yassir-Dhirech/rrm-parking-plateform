import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Descriptions, Space, Table, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  consulterFactureComptable,
  telechargerFactureComptablePdf,
} from "../../../api/facturationApi";
import { useAuth } from "../../../context/AuthContext";
import type { FactureLigneResponse } from "../facturationTypes";

const montant = (valeur: number) =>
  `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valeur)} DH`;

export function FactureComptableDetailPage() {
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const portee = role === "SUPERVISEUR" ? "superviseur"
    : role === "RESPONSABLE" ? "responsable" : "comptable";
  const { id } = useParams<{ id: string }>();
  const factureId = Number(id);
  const [erreurPdf, setErreurPdf] = useState(false);
  const facture = useQuery({
    queryKey: ["facture-registre", portee, token, factureId],
    queryFn: () => consulterFactureComptable(factureId, portee),
    enabled: Number.isSafeInteger(factureId) && factureId > 0,
  });

  async function telechargerPdf() {
    setErreurPdf(false);
    try {
      const blob = await telechargerFactureComptablePdf(factureId, portee);
      const url = URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `${facture.data?.numero ?? "facture"}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setErreurPdf(true);
    }
  }

  if (!Number.isSafeInteger(factureId) || factureId < 1) {
    return <Alert type="error" showIcon message="Identifiant de facture invalide" />;
  }

  if (facture.isPending) return <Card loading />;
  if (facture.isError || !facture.data) {
    return <Alert type="error" showIcon message="Facture introuvable ou inaccessible" />;
  }

  const data = facture.data;
  return (
    <Card
      className={portee === "superviseur" ? "supervisor-screen supervisor-detail" : undefined}
      title={`Facture ${data.numero}`}
      extra={<Space>
        <Button onClick={() => navigate(`/${portee}/factures`)}>Retour</Button>
        <Button type="primary" disabled={data.statut !== "EMISE"} onClick={telechargerPdf}>
          Télécharger le PDF
        </Button>
      </Space>}
    >
      {erreurPdf && <Alert type="error" showIcon message="Téléchargement du PDF impossible" />}
      <Descriptions bordered column={2} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Client">{data.clientNom}</Descriptions.Item>
        <Descriptions.Item label="Parking">{data.parkingNom ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Demande">{data.referenceDemande}</Descriptions.Item>
        <Descriptions.Item label="Paiement">{data.paiementReference}</Descriptions.Item>
        <Descriptions.Item label="Mode">{data.modePaiement}</Descriptions.Item>
        <Descriptions.Item label="Statut">{data.statut}</Descriptions.Item>
      </Descriptions>
      <Typography.Title level={5} style={{ marginTop: 24 }}>Lignes de la facture</Typography.Title>
      <Table<FactureLigneResponse>
        rowKey={(ligne) => ligne.id ?? ligne.description}
        pagination={false}
        dataSource={data.lignes}
        columns={[
          { title: "Description", dataIndex: "description" },
          { title: "Quantité", dataIndex: "quantite" },
          { title: "Montant HT", dataIndex: "montantHt", render: montant },
          { title: "TVA", dataIndex: "montantTva", render: montant },
          { title: "Montant TTC", dataIndex: "montantTtc", render: montant },
        ]}
      />
      <Typography.Title level={4} style={{ textAlign: "right" }}>
        Total TTC : {montant(data.totalTtc)}
      </Typography.Title>
    </Card>
  );
}
