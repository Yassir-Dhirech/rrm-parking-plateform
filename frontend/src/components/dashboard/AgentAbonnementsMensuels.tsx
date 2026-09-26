import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Select, Spin, Typography } from "antd";
import { getAbonnementsMensuelsAgent } from "../../api/agentParkingRegistre";

const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export function AgentAbonnementsMensuels() {
  const anneeCourante = new Date().getFullYear();
  const [annee, setAnnee] = useState(anneeCourante);
  const { data, isPending, error } = useQuery({
    queryKey: ["agent", "abonnements-mensuels", annee],
    queryFn: () => getAbonnementsMensuelsAgent(annee),
  });
  const maximum = Math.max(1, ...(data?.mois.map((point) => point.nombreAbonnements) ?? []));

  return (
    <Card
      title="Abonnements du parking par mois"
      extra={
        <Select
          aria-label="Année du graphique"
          value={annee}
          onChange={setAnnee}
          options={Array.from({ length: 5 }, (_, index) => ({
            value: anneeCourante - index,
            label: String(anneeCourante - index),
          }))}
          style={{ width: 110 }}
        />
      }
    >
      <Typography.Text type="secondary">
        {data?.parkingNom || "Votre parking"} · un abonnement est compté une fois par mois, même avec plusieurs cartes.
      </Typography.Text>
      {error && <Alert type="error" showIcon message="Impossible de charger les abonnements mensuels" />}
      {isPending ? <Spin style={{ display: "block", margin: 40 }} /> : (
        <div
          role="img"
          aria-label={`Nombre d'abonnements mensuels à ${data?.parkingNom || "ce parking"} en ${annee}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(34px, 1fr))", gap: 8,
            height: 220, alignItems: "end", overflowX: "auto", marginTop: 24 }}
        >
          {data?.mois.map((point) => (
            <div key={point.numero} title={`${mois[point.numero - 1]} : ${point.nombreAbonnements} abonnement(s)`}
              style={{ minWidth: 34, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", textAlign: "center" }}>
              <span style={{ fontWeight: 700, marginBottom: 4 }}>{point.nombreAbonnements}</span>
              <div style={{ background: "#2563eb", borderRadius: "6px 6px 0 0",
                height: Math.max(point.nombreAbonnements ? 8 : 2,
                  point.nombreAbonnements / maximum * 155) }} />
              <span style={{ marginTop: 7, fontSize: 11 }}>{mois[point.numero - 1]}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
