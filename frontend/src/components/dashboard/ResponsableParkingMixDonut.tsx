import { useQuery } from "@tanstack/react-query";
import { PieChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Skeleton, Tooltip } from "antd";
import { getParkingMix } from "../../api/responsableDashboard";
import "./ResponsableParkingMixDonut.css";

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00`));
}

export function ResponsableParkingMixDonut() {
  const query = useQuery({
    queryKey: ["responsable-dashboard-parking-mix"],
    queryFn: getParkingMix,
    staleTime: 60_000,
  });

  if (query.isLoading) {
    return (
      <section className="responsable-mix-card glass-effect">
        <Skeleton active paragraph={{ rows: 5 }} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="responsable-mix-card glass-effect responsable-mix-state">
        <strong>Places Corporate vs Régulier</strong>
        <span>Données momentanément indisponibles.</span>
      </section>
    );
  }

  const data = query.data;
  const corporateAngle = Math.max(
    0,
    Math.min(360, (data.partCorporatePct / 100) * 360),
  );

  return (
    <section className="responsable-mix-card glass-effect">
      <header className="responsable-mix-header">
        <div className="responsable-mix-heading">
          <span className="responsable-mix-icon">
            <PieChartOutlined />
          </span>
          <div>
            <h3>Places Corporate vs Régulier</h3>
            <p>Situation au {formatDate(data.dateReference)}</p>
          </div>
        </div>

        <Tooltip title="Une place par abonnement régulier actif et les places contractuelles des abonnements corporate actifs, à la date actuelle.">
          <InfoCircleOutlined className="responsable-mix-info" />
        </Tooltip>
      </header>

      <div className="responsable-mix-content">
        <div
          className="responsable-mix-donut"
          style={{
            background: `conic-gradient(
              rgba(70, 166, 255, 0.95) 0deg ${corporateAngle}deg,
              rgba(0, 210, 180, 0.92) ${corporateAngle}deg 360deg
            )`,
          }}
        >
          <div className="responsable-mix-donut-center">
            <strong>{data.totalPlacesActives.toLocaleString("fr-FR")}</strong>
            <span>places actives</span>
          </div>
        </div>

        <div className="responsable-mix-legend">
          <div className="responsable-mix-legend-row">
            <span className="responsable-mix-dot responsable-mix-dot--corporate" />
            <div><span>Corporate</span><strong>{data.placesCorporate}</strong></div>
            <b>{data.partCorporatePct.toLocaleString("fr-FR")} %</b>
          </div>

          <div className="responsable-mix-legend-row">
            <span className="responsable-mix-dot responsable-mix-dot--regulier" />
            <div><span>Régulier</span><strong>{data.placesRegulieres}</strong></div>
            <b>{data.partRegulierPct.toLocaleString("fr-FR")} %</b>
          </div>
        </div>
      </div>
    </section>
  );
}
