import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Select, Skeleton, Tooltip } from "antd";
import { getMonthlyRevenue } from "../../api/responsableDashboard";
import "./ResponsableMonthlyRevenueAreaChart.css";

const WIDTH = 720;
const HEIGHT = 250;
const LEFT = 46;
const RIGHT = 18;
const TOP = 18;
const BOTTOM = 38;

function formatDh(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} DH`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    })} M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    })} k`;
  }

  return Math.round(value).toLocaleString("fr-FR");
}

export function ResponsableMonthlyRevenueAreaChart() {
  const currentYear = new Date().getFullYear();
  const [annee, setAnnee] = useState(currentYear);

  const years = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const value = currentYear - index;
        return { value, label: String(value) };
      }),
    [currentYear],
  );

  const query = useQuery({
    queryKey: ["responsable-dashboard-monthly-revenue", annee],
    queryFn: () => getMonthlyRevenue(annee),
    staleTime: 60_000,
  });

  if (query.isLoading) {
    return (
      <section className="responsable-area-card glass-effect">
        <Skeleton active paragraph={{ rows: 7 }} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="responsable-area-card glass-effect responsable-area-state">
        <strong>Chiffre d’affaires HT</strong>
        <span>Données momentanément indisponibles.</span>
      </section>
    );
  }

  const data = query.data;
  const maximum = Math.max(
    1,
    ...data.mois.map((item) => item.chiffreAffairesHt),
  );

  const chartWidth = WIDTH - LEFT - RIGHT;
  const chartHeight = HEIGHT - TOP - BOTTOM;
  const stepX = chartWidth / Math.max(1, data.mois.length - 1);

  const points = data.mois.map((item, index) => {
    const x = LEFT + index * stepX;
    const y =
      TOP +
      chartHeight -
      (item.chiffreAffairesHt / maximum) * chartHeight;

    return { ...item, x, y };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");

  const baseline = TOP + chartHeight;

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(
          2,
        )} ${baseline.toFixed(2)} L ${points[0].x.toFixed(
          2,
        )} ${baseline.toFixed(2)} Z`
      : "";

  const gridValues = [1, 0.75, 0.5, 0.25, 0];

  return (
    <section
      className="responsable-area-card glass-effect"
      aria-label={`Chiffre d’affaires HT mensuel ${data.annee}`}
    >
      <header className="responsable-area-header">
        <div className="responsable-area-heading">
          <span className="responsable-area-icon">
            <AreaChartOutlined />
          </span>

          <div>
            <h3>Chiffre d’affaires HT</h3>
            <p>Répartition mensuelle de janvier à décembre</p>
          </div>
        </div>

        <div className="responsable-area-actions">
          <Select
            value={annee}
            onChange={setAnnee}
            options={years}
            size="small"
            className="responsable-area-year-select"
            aria-label="Sélectionner l’année"
          />

          <Tooltip title="CA HT reconnu au prorata des jours couverts par les périodes d’abonnement. Les frais RFID sont exclus.">
            <InfoCircleOutlined className="responsable-area-info" />
          </Tooltip>
        </div>
      </header>

      <div className="responsable-area-summary">
        <span>Total {data.annee}</span>
        <strong>{formatDh(data.totalAnnuelHt)}</strong>
      </div>

      <div className="responsable-area-chart-wrap">
        <svg
          className="responsable-area-chart"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Évolution mensuelle du chiffre d’affaires HT en ${data.annee}`}
        >
          <defs>
            <linearGradient
              id="responsable-ca-area-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#46a6ff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#46a6ff" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {gridValues.map((ratio) => {
            const y = TOP + chartHeight * (1 - ratio);
            const label = maximum * ratio;

            return (
              <g key={ratio}>
                <line
                  x1={LEFT}
                  y1={y}
                  x2={WIDTH - RIGHT}
                  y2={y}
                  className="responsable-area-grid-line"
                />
                <text
                  x={LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="responsable-area-axis-value"
                >
                  {formatCompact(label)}
                </text>
              </g>
            );
          })}

          <path
            d={areaPath}
            fill="url(#responsable-ca-area-gradient)"
            className="responsable-area-fill"
          />

          <path
            d={linePath}
            className="responsable-area-line"
            fill="none"
          />

          {points.map((point) => (
            <g key={point.mois}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="responsable-area-point"
              >
                <title>
                  {`${point.libelle} ${data.annee} : ${formatDh(
                    point.chiffreAffairesHt,
                  )} HT`}
                </title>
              </circle>

              <text
                x={point.x}
                y={HEIGHT - 12}
                textAnchor="middle"
                className="responsable-area-month"
              >
                {point.libelle}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
