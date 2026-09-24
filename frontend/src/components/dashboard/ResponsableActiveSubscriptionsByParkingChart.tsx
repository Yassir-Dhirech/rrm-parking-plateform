import { useQuery } from "@tanstack/react-query";
import { BarChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Skeleton, Tooltip } from "antd";
import { getActiveSubscriptionsByParking } from "../../api/responsableDashboard";
import "./ResponsableActiveSubscriptionsByParkingChart.css";

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00`));
}

function abbreviateParkingName(name: string): string {
  const nettoye = name
    .replace(/^parking\s+/i, "")
    .trim();

  if (nettoye.length <= 8) {
    return nettoye;
  }

  const mots = nettoye.split(/\s+/);

  if (mots.length === 1) {
    return `${mots[0].slice(0, 7)}.`;
  }

  return mots
    .map((mot, index) =>
      index === 0
        ? mot.slice(0, 5)
        : `${mot.charAt(0).toUpperCase()}.`,
    )
    .join(" ");
}

export function ResponsableActiveSubscriptionsByParkingChart() {
  const query = useQuery({
    queryKey: ["responsable-dashboard-active-subscriptions-by-parking"],
    queryFn: getActiveSubscriptionsByParking,
    staleTime: 60_000,
  });

  if (query.isLoading) {
    return (
      <section className="responsable-chart-card glass-effect">
        <Skeleton active paragraph={{ rows: 7 }} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="responsable-chart-card glass-effect responsable-chart-state">
        <strong>Abonnements par parking</strong>
        <span>Données momentanément indisponibles.</span>
      </section>
    );
  }

  const data = query.data;
  const maximum = Math.max(
    1,
    ...data.parkings.map((parking) => parking.nombreAbonnements),
  );

  return (
    <section
      className="responsable-chart-card glass-effect"
      aria-label="Abonnements actifs par parking"
    >
      <header className="responsable-chart-header">
        <div>
          <div className="responsable-chart-heading">
            <span className="responsable-chart-icon">
              <BarChartOutlined />
            </span>
            <div>
              <h3>Abonnements actifs par parking</h3>
              <p>Situation au {formatDate(data.dateReference)}</p>
            </div>
          </div>
        </div>

        <Tooltip title="Nombre d’abonnements disposant d’une période ACTIVE aujourd’hui, regroupés selon leur parking courant.">
          <InfoCircleOutlined className="responsable-chart-info" />
        </Tooltip>
      </header>

      <div className="responsable-chart-summary">
        <span>Total réseau</span>
        <strong>{data.totalAbonnements.toLocaleString("fr-FR")}</strong>
      </div>

      {data.parkings.length === 0 ? (
        <div className="responsable-chart-state">
          Aucun parking actif à afficher.
        </div>
      ) : (
        <div className="responsable-bar-chart">
          {data.parkings.map((parking) => {
            const hauteur = Math.max(
              parking.nombreAbonnements > 0 ? 8 : 2,
              (parking.nombreAbonnements / maximum) * 100,
            );

            return (
              <div className="responsable-bar-column" key={parking.parkingId}>
                <div className="responsable-bar-value">
                  {parking.nombreAbonnements.toLocaleString("fr-FR")}
                </div>

                <Tooltip
                  title={`${parking.parkingNom} : ${parking.nombreAbonnements.toLocaleString(
                    "fr-FR",
                  )} abonnement${parking.nombreAbonnements > 1 ? "s" : ""} actif${
                    parking.nombreAbonnements > 1 ? "s" : ""
                  }`}
                >
                  <div className="responsable-bar-track">
                    <div
                      className="responsable-bar-fill"
                      style={{ height: `${hauteur}%` }}
                    />
                  </div>
                </Tooltip>

                <div className="responsable-bar-label" title={parking.parkingNom}>
                  {abbreviateParkingName(parking.parkingNom)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
