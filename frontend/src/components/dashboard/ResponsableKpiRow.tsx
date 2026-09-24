import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Progress, Skeleton, Tooltip } from "antd";
import {
  getResponsableDashboardKpis,
  type ResponsableDashboardKpis,
} from "../../api/responsableDashboard";
import "./ResponsableKpiRow.css";

interface ResponsableKpiRowProps {
  parkingId?: number | null;
  dateDebut?: string;
  dateFin?: string;
}

type EvolutionMode = "normal" | "inverse";

function formatDh(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} DH`;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";

  const heures = Math.floor(minutes / 60);
  const resteMinutes = minutes % 60;

  return heures === 0
    ? `${resteMinutes} min`
    : `${heures} h ${resteMinutes
        .toString()
        .padStart(2, "0")} min`;
}

function Evolution({
  value,
  mode = "normal",
}: {
  value: number | null;
  mode?: EvolutionMode;
}) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className="responsable-kpi-evolution responsable-kpi-evolution--none">
        —
      </span>
    );
  }

  const stable = value >= -1 && value <= 1;
  const hausse = value > 1;
  const favorable =
    mode === "inverse" ? !hausse : hausse;

  const classe = stable
    ? "responsable-kpi-evolution--stable"
    : favorable
      ? "responsable-kpi-evolution--positive"
      : "responsable-kpi-evolution--negative";

  const fleche = stable ? "→" : hausse ? "↑" : "↓";

  return (
    <span className={`responsable-kpi-evolution ${classe}`}>
      {fleche}{" "}
      {Math.abs(value).toLocaleString("fr-FR", {
        maximumFractionDigits: 1,
      })} %
    </span>
  );
}

function KpiShell({ children }: { children: ReactNode }) {
  return (
    <div className="responsable-kpi-card glass-effect">
      {children}
    </div>
  );
}

function KpiHeader({
  icon,
  title,
  tooltip,
}: {
  icon: ReactNode;
  title: string;
  tooltip: string;
}) {
  return (
    <div className="responsable-kpi-header">
      <div className="responsable-kpi-title-wrap">
        <span className="responsable-kpi-icon">
          {icon}
        </span>
        <span className="responsable-kpi-title">
          {title}
        </span>
      </div>

      <Tooltip title={tooltip}>
        <InfoCircleOutlined className="responsable-kpi-info" />
      </Tooltip>
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="responsable-kpi-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <KpiShell key={index}>
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={{ width: "60%" }}
          />
        </KpiShell>
      ))}
    </div>
  );
}

function ErrorCards() {
  return (
    <div className="responsable-kpi-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <KpiShell key={index}>
          <div className="responsable-kpi-error">
            <span>Indicateur indisponible</span>
            <small>Les données n’ont pas pu être chargées.</small>
          </div>
        </KpiShell>
      ))}
    </div>
  );
}

function RevenueCard({ data }: { data: ResponsableDashboardKpis }) {
  return (
    <KpiShell>
      <KpiHeader
        icon={<DollarOutlined />}
        title="Chiffre d’affaires HT"
        tooltip="Prix HT des périodes d’abonnement reconnu au prorata des jours couverts sur la période. Les frais RFID sont exclus."
      />
      <div className="responsable-kpi-value-row">
        <span className="responsable-kpi-value">
          {data.chiffreAffairesDisponible
            ? formatDh(data.chiffreAffairesHt)
            : "—"}
        </span>
        <Evolution
          value={
            data.chiffreAffairesDisponible
              ? data.evolutionChiffreAffairesPct
              : null
          }
        />
      </div>
      <div className="responsable-kpi-description">
        Revenus HT des abonnements reconnus sur la période
      </div>
    </KpiShell>
  );
}

function OccupancyCard({ data }: { data: ResponsableDashboardKpis }) {
  const taux = data.occupationDisponible
    ? data.tauxOccupationPct
    : 0;

  const progressColor =
    taux > 90
      ? "#d13438"
      : taux >= 70
        ? "#f59e0b"
        : "#107c10";

  return (
    <KpiShell>
      <KpiHeader
        icon={<CarOutlined />}
        title="Taux d’occupation global"
        tooltip="Places occupées par les abonnements divisées par les places réservées aux abonnements, multiplié par 100."
      />
      <div className="responsable-kpi-value-row">
        <span className="responsable-kpi-value">
          {data.occupationDisponible
            ? `${data.tauxOccupationPct.toLocaleString(
                "fr-FR",
                { maximumFractionDigits: 1 },
              )} %`
            : "—"}
        </span>
      </div>
      <Progress
        percent={Math.max(0, Math.min(100, taux))}
        showInfo={false}
        strokeColor={progressColor}
        trailColor="rgba(255,255,255,0.14)"
        size="small"
        className="responsable-kpi-progress"
      />
      <div className="responsable-kpi-description">
        {data.occupationDisponible
          ? `${data.placesOccupees.toLocaleString(
              "fr-FR",
            )} places occupées sur ${data.placesReservees.toLocaleString(
              "fr-FR",
            )} places réservées aux abonnements`
          : "Aucune capacité réservée aux abonnements"}
      </div>
    </KpiShell>
  );
}

function ActiveSubscriptionsCard({
  data,
}: {
  data: ResponsableDashboardKpis;
}) {
  return (
    <KpiShell>
      <KpiHeader
        icon={<FileTextOutlined />}
        title="Abonnements actifs"
        tooltip="Nombre distinct d’abonnements possédant une période ACTIVE à la date de référence. PLANIFIEE n’est pas comptée."
      />
      <div className="responsable-kpi-value-row">
        <span className="responsable-kpi-value">
          {data.abonnementsActifs.toLocaleString("fr-FR")}
        </span>
        <Evolution value={data.evolutionAbonnementsActifsPct} />
      </div>
      <div className="responsable-kpi-description">
        Nombre d’abonnements actuellement actifs
      </div>
    </KpiShell>
  );
}

function ProcessingDelayCard({
  data,
}: {
  data: ResponsableDashboardKpis;
}) {
  return (
    <KpiShell>
      <KpiHeader
        icon={<ClockCircleOutlined />}
        title="Délai moyen de traitement"
        tooltip="Moyenne entre PAYEE et la décision finale VALIDEE ou REFUSEE. Les demandes annulées, expirées, en correction ou en cours sont exclues."
      />
      <div className="responsable-kpi-value-row">
        <span className="responsable-kpi-value">
          {data.delaiDisponible
            ? formatDuration(data.delaiMoyenTraitementMinutes)
            : "—"}
        </span>
        <Evolution
          value={
            data.delaiDisponible
              ? data.evolutionDelaiMoyenPct
              : null
          }
          mode="inverse"
        />
      </div>
      <div className="responsable-kpi-description">
        Objectif : moins de 24 h
      </div>
    </KpiShell>
  );
}

export function ResponsableKpiRow({
  parkingId,
  dateDebut,
  dateFin,
}: ResponsableKpiRowProps) {
  const query = useQuery({
    queryKey: [
      "responsable-dashboard-kpis",
      parkingId ?? null,
      dateDebut ?? null,
      dateFin ?? null,
    ],
    queryFn: () =>
      getResponsableDashboardKpis({
        parkingId,
        dateDebut,
        dateFin,
      }),
    staleTime: 60_000,
  });

  if (query.isLoading) return <LoadingCards />;
  if (query.isError || !query.data) return <ErrorCards />;

  return (
    <section
      className="responsable-kpi-grid"
      aria-label="Indicateurs clés du responsable"
    >
      <RevenueCard data={query.data} />
      <OccupancyCard data={query.data} />
      <ActiveSubscriptionsCard data={query.data} />
      <ProcessingDelayCard data={query.data} />
    </section>
  );
}
