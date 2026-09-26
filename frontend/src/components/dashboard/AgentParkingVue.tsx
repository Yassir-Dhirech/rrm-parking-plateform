import { Card } from "antd";
import { RabatParkingsMap } from "../map/RabatParkingsMap";
import { AgentAbonnementsMensuels } from "./AgentAbonnementsMensuels";

/** Bloc à placer sous les KPI existants du dashboard agent. */
export function AgentParkingVue() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <AgentAbonnementsMensuels />
      <Card title="Carte des parkings">
        <RabatParkingsMap height={370} />
      </Card>
    </div>
  );
}
