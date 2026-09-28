import type { CSSProperties } from "react";
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

function formatPercent(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

type MixRingProps = {
  variant: "corporate" | "regulier";
  title: string;
  subtitle: string;
  count: number;
  percent: number;
  centerLabel: string;
};

function MixRing({
  variant,
  title,
  subtitle,
  count,
  percent,
  centerLabel,
}: MixRingProps) {
  return (
    <article className={`responsable-mix-ring-card responsable-mix-ring-card--${variant}`}>
      <div
        className={`responsable-mix-ring responsable-mix-ring--${variant}`}
        style={{ "--progress": `${Math.max(0, Math.min(100, percent))}%` } as CSSProperties & { "--progress": string }}
      >
        <div className="responsable-mix-ring__inner">
          <strong>{count.toLocaleString("fr-FR")}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>

      <div className="responsable-mix-ring-meta">
        <h4>{title}</h4>
        <b>{formatPercent(percent)} %</b>
        <p>{subtitle}</p>
      </div>
    </article>
  );
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
        <Skeleton active paragraph={{ rows: 6 }} />
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

  return (
    <section className="responsable-mix-card glass-effect">
      <header className="responsable-mix-header">
        <div className="responsable-mix-heading">
          <span className="responsable-mix-icon">
            <PieChartOutlined />
          </span>

          <div className="responsable-mix-heading-copy">
            <h3>Places Corporate vs Régulier</h3>
            <p>Répartition actuelle des abonnements actifs par segment au {formatDate(data.dateReference)}.</p>
          </div>
        </div>

        <Tooltip title="Chaque anneau indique la part des places occupées par des abonnements actifs : une place par abonnement régulier et les places contractuelles pour le corporate.">
          <InfoCircleOutlined className="responsable-mix-info" />
        </Tooltip>
      </header>

      <div className="responsable-mix-description">
        <span>Total observé</span>
        <strong>{data.totalPlacesActives.toLocaleString("fr-FR")} places actives</strong>
      </div>

      <div className="responsable-mix-content">
        <MixRing
          variant="corporate"
          title="Corporate"
          subtitle="Part des places contractuelles corporate dans le total actuel"
          count={data.placesCorporate}
          percent={data.partCorporatePct}
          centerLabel="places"
        />

        <MixRing
          variant="regulier"
          title="Régulier"
          subtitle="Part des places régulières dans le total actuel"
          count={data.placesRegulieres}
          percent={data.partRegulierPct}
          centerLabel="places"
        />
      </div>
    </section>
  );
}
