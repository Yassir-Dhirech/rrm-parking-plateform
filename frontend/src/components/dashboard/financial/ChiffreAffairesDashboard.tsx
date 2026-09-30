import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";

import {
  getChiffreAffairesDashboard,
  type ChiffreAffairesDashboardResponse,
  type ChiffreAffairesFilters,
  type TypeAbonnementReporting,
} from "../../../api/chiffreAffairesReporting";
import {
  getParkingsDisponiblesAbonnement,
  type Parking,
} from "../../../api/parkings";
import "./ChiffreAffairesDashboard.css";
import "./ChiffreAffairesResponsableLight.css";

type FilterMode = "PERIODE" | "ANNEE" | "MOIS";

interface Props {
  audience: "COMPTABLE" | "RESPONSABLE";
}

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(value: number): string {
  return `${moneyFormatter.format(value)} DH`;
}

function formatDate(value?: string | Date): string {
  if (!value) return "";
  const d = typeof value === "string" 
    ? new Date(`${value.includes("T") ? value : value + "T12:00:00"}`) 
    : value;
  if (isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}



function formatPeriod(start?: string, end?: string): string {
  if (!start || !end) return "Période sélectionnée";
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function EvolutionBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="ca-evolution ca-evolution--neutral">
        <ArrowRightOutlined /> Sans base comparable
      </span>
    );
  }

  const improving = value > 0;
  const stable = value === 0;
  return (
    <span
      className={`ca-evolution ${
        stable
          ? "ca-evolution--neutral"
          : improving
            ? "ca-evolution--positive"
            : "ca-evolution--negative"
      }`}
    >
      {stable ? (
        <ArrowRightOutlined />
      ) : improving ? (
        <ArrowUpOutlined />
      ) : (
        <ArrowDownOutlined />
      )}
      {Math.abs(value).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %
    </span>
  );
}

function RevenueTrend({ data, parkingNom }: { data: ChiffreAffairesDashboardResponse; parkingNom?: string }) {
  const points = data.douzeDerniersMois;
  const width = 760;
  const height = 248;
  const left = 18;
  const top = 18;
  const chartWidth = width - 36;
  const chartHeight = height - 58;
  const maximum = Math.max(...points.map((point) => point.chiffreAffairesHt), 1);
  const coordinates = points.map((point, index) => ({
    ...point,
    x: left + (index * chartWidth) / Math.max(points.length - 1, 1),
    y: top + chartHeight - (point.chiffreAffairesHt / maximum) * chartHeight,
  }));
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const area = coordinates.length
    ? `${left},${top + chartHeight} ${line} ${left + chartWidth},${top + chartHeight}`
    : "";

  const totalSerie = points.reduce((sum, item) => sum + item.chiffreAffairesHt, 0);

  return (
    <article className="ca-panel ca-trend-panel">
      <header className="ca-panel__header">
        <div>
          <span className="ca-eyebrow">Tendance Mensuelle</span>
          <h3>
            {parkingNom 
              ? `Chiffre d’affaires HT — ${parkingNom}` 
              : "Chiffre d’affaires HT — 12 derniers mois"}
          </h3>
        </div>
        <span className="ca-panel__total">
          Total série : {formatMoney(totalSerie)}
        </span>
      </header>

      <div className="ca-trend" role="img" aria-label="Évolution du chiffre d’affaires HT">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ca-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f6cbd" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#0f6cbd" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={left}
              y1={top + chartHeight * ratio}
              x2={left + chartWidth}
              y2={top + chartHeight * ratio}
              className="ca-grid-line"
            />
          ))}
          {area && <polygon points={area} fill="url(#ca-area-gradient)" />}
          {line && <polyline points={line} className="ca-line" />}
          {coordinates.map((point) => (
            <g key={`${point.annee}-${point.mois}`}>
              <circle cx={point.x} cy={point.y} r="5" className="ca-point" />
              <title>{`${point.libelle} ${point.annee} (${formatDate(point.dateDebut)} au ${formatDate(point.dateFin)}) : ${formatMoney(point.chiffreAffairesHt)}`}</title>
            </g>
          ))}
        </svg>
        <div className="ca-month-axis">
          {points.map((point) => (
            <span key={`${point.annee}-${point.mois}`}>
              {point.libelle.replace(".", "")}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function SubscriptionMix({ data, parkingNom }: { data: ChiffreAffairesDashboardResponse; parkingNom?: string }) {
  const { synthese } = data;
  const regular = Math.max(0, Math.min(100, synthese.partRegulierPourcentage));

  return (
    <article className="ca-panel ca-mix-panel">
      <header className="ca-panel__header">
        <div>
          <span className="ca-eyebrow">Composition du Portefeuille</span>
          <h3>{parkingNom ? `Mix Abonnements — ${parkingNom}` : "CA régulier / corporate"}</h3>
        </div>
      </header>
      <div className="ca-mix">
        <div
          className="ca-donut"
          style={{ background: `conic-gradient(var(--ca-mix-regular) 0 ${regular}%, var(--ca-mix-corporate) ${regular}% 100%)` }}
          aria-label={`${regular}% régulier et ${synthese.partCorporatePourcentage}% corporate`}
        >
          <div className="ca-donut__center">
            <strong>{formatMoney(synthese.totalGeneralHt)}</strong>
            <span>Total HT</span>
          </div>
        </div>
        <div className="ca-mix__legend">
          <div>
            <span className="ca-legend-dot ca-legend-dot--regular" />
            <p><strong>Particuliers (Régulier)</strong><span>{synthese.partRegulierPourcentage.toFixed(1)} %</span></p>
            <b>{formatMoney(synthese.caRegulierHt)}</b>
          </div>
          <div>
            <span className="ca-legend-dot ca-legend-dot--corporate" />
            <p><strong>Entreprises (Corporate)</strong><span>{synthese.partCorporatePourcentage.toFixed(1)} %</span></p>
            <b>{formatMoney(synthese.caCorporateHt)}</b>
          </div>
        </div>
      </div>
    </article>
  );
}


function ParkingRevenue({ data }: { data: ChiffreAffairesDashboardResponse }) {
  const maximum = Math.max(...data.repartitionParParking.map((item) => item.chiffreAffairesHt), 1);
  return (
    <article className="ca-panel ca-parking-panel">
            <header className="ca-panel__header">
        <div>
          <span className="ca-eyebrow">Répartition par Parking</span>
          <h3>Chiffre d’affaires HT par Parking</h3>
          <small>Abonnements réglés, calculés au prorata du {formatPeriod(data.filtres.dateDebut, data.filtres.dateFin)}.</small>
        </div>
        <span className="ca-panel__hint">
          {data.filtres.parkingId 
            ? "Affichage restreint au parking sélectionné" 
            : "Classement réseau par volume décroissant"}
        </span>
      </header>

      {data.repartitionParParking.length === 0 ? (
        <div className="ca-empty">Aucun chiffre d’affaires sur cette période.</div>
      ) : (
        <div className="ca-parking-list">
          {data.repartitionParParking.map((item, index) => (
            <div className="ca-parking-row" key={item.parkingId}>
              <span className="ca-parking-rank">{String(index + 1).padStart(2, "0")}</span>
              <div className="ca-parking-name">
                <strong>{item.parkingNom}</strong>
                <span>{item.partPourcentage.toFixed(1)} % du total</span>
              </div>
              <div className="ca-parking-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(2, (item.chiffreAffairesHt / maximum) * 100)}%` }} />
              </div>
              <strong className="ca-parking-value">{formatMoney(item.chiffreAffairesHt)}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function DashboardContent({ data, selectedParkingNom, audience }: { data: ChiffreAffairesDashboardResponse; selectedParkingNom?: string; audience: Props["audience"] }) {
  const { synthese, filtres } = data;
  const tvaEstimee = synthese.caActuelHt * 0.20;
  const totalTtc = synthese.caActuelHt + tvaEstimee;

  // Calcul du nombre de jours de la période pour la moyenne journalière
  const nbJours = useMemo(() => {
    if (!filtres.dateDebut || !filtres.dateFin) return 30;
    const dDebut = new Date(`${filtres.dateDebut}T00:00:00`);
    const dFin = new Date(`${filtres.dateFin}T00:00:00`);
    const diffTime = Math.abs(dFin.getTime() - dDebut.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diffDays, 1);
  }, [filtres.dateDebut, filtres.dateFin]);

  const caJournalier = synthese.caActuelHt / nbJours;

  return (
    <>
      {/* 4 KPIs Financiers & Trésorerie réagissant à tous les filtres */}
      <section className="ca-kpi-grid">
        {/* KPI 1 : CA HT de la période avec badge d'évolution */}
        <article className="ca-kpi ca-kpi--primary">
          <span className="ca-kpi__icon"><DollarOutlined /></span>
          <span className="ca-kpi__label">CA HT de la période</span>
          <strong>{formatMoney(synthese.caActuelHt)}</strong>
          <EvolutionBadge value={synthese.evolutionPourcentage} />
          <small>{formatPeriod(filtres.dateDebut, filtres.dateFin)}</small>
        </article>

        {/* KPI 2 : Total Facturé TTC (Trésorerie avec TVA intégrée) */}
        <article className="ca-kpi">
          <span className="ca-kpi__icon"><BankOutlined /></span>
          <span className="ca-kpi__label">Total Facturé TTC</span>
          <strong>{formatMoney(totalTtc)}</strong>
          <small>Dont TVA collectée (20 %) : {formatMoney(tvaEstimee)}</small>
        </article>

        {/* KPI 3 : Cumul Annuel YTD */}
        <article className="ca-kpi">
          <span className="ca-kpi__icon"><RiseOutlined /></span>
          <span className="ca-kpi__label">CA annuel cumulé (YTD)</span>
          <strong>{formatMoney(synthese.caAnnuelHt)}</strong>
          <small>
            Du 01/01/{filtres.annee ?? new Date().getFullYear()} au {formatDate(filtres.dateFin)}
          </small>
        </article>

        {/* KPI 4 : Moyenne Journalière */}
        <article className="ca-kpi">
          <span className="ca-kpi__icon"><CalendarOutlined /></span>
          <span className="ca-kpi__label">Moyenne Journalière</span>
          <strong>{formatMoney(caJournalier)}</strong>
          <small>
            {nbJours > 1 
              ? `Moyenne sur ${nbJours} jours d'exploitation` 
              : "Activité sur 1 jour"}
          </small>
        </article>
      </section>

      {/* Graphiques dynamiques connectés aux filtres */}
      <section className="ca-chart-grid">
        {audience !== "RESPONSABLE" && <RevenueTrend data={data} parkingNom={selectedParkingNom} />}
        <SubscriptionMix data={data} parkingNom={selectedParkingNom} />
      </section>

      {/* Répartition par Parking */}
      <ParkingRevenue data={data} />
    </>
  );
}


export function ChiffreAffairesDashboard({ audience }: Props) {
  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<FilterMode>("PERIODE");
  const [dateDebut, setDateDebut] = useState(
    isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
  const [dateFin, setDateFin] = useState(isoDate(now));
  const [annee, setAnnee] = useState(now.getFullYear());
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [parkingId, setParkingId] = useState<number | undefined>();
  const [typeAbonnement, setTypeAbonnement] =
    useState<TypeAbonnementReporting>("TOUS");

  const filters = useMemo<ChiffreAffairesFilters>(() => {
    const common = { parkingId, typeAbonnement };
    if (mode === "ANNEE") return { ...common, annee };
    if (mode === "MOIS") return { ...common, annee, mois };
    return { ...common, dateDebut, dateFin };
  }, [annee, dateDebut, dateFin, mode, mois, parkingId, typeAbonnement]);

  const dashboardQuery = useQuery({
    queryKey: ["chiffre-affaires-dashboard", filters],
    queryFn: () => getChiffreAffairesDashboard(filters),
    staleTime: 30_000,
  });
  const parkingsQuery = useQuery({
    queryKey: ["parkings-disponibles-abonnement"],
    queryFn: getParkingsDisponiblesAbonnement,
    staleTime: 5 * 60_000,
  });

  const resetFilters = () => {
    setMode("PERIODE");
    setDateDebut(isoDate(new Date(now.getFullYear(), now.getMonth(), 1)));
    setDateFin(isoDate(now));
    setAnnee(now.getFullYear());
    setMois(now.getMonth() + 1);
    setParkingId(undefined);
    setTypeAbonnement("TOUS");
  };

  
      return (
    <div className={`ca-dashboard ca-dashboard--${audience.toLowerCase()}`}>
      


      <section className="ca-filter-panel" aria-label="Filtres du chiffre d’affaires">
        <div className="ca-mode-switch">
          {(["PERIODE", "MOIS", "ANNEE"] as FilterMode[]).map((item) => (
            <button
              type="button"
              key={item}
              className={mode === item ? "is-active" : ""}
              onClick={() => setMode(item)}
            >
              {item === "PERIODE" ? "Entre deux dates" : item === "MOIS" ? "Par mois" : "Par année"}
            </button>
          ))}
        </div>

        <div className="ca-filter-grid">
                    {mode === "PERIODE" && (
            <>
              <label>
                <span>Date de début</span>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={dateDebut ? dayjs(dateDebut) : null}
                  disabledDate={(current) =>
                    dateFin ? current && current.isAfter(dayjs(dateFin), "day") : false
                  }
                  onChange={(date) =>
                    setDateDebut(date ? date.format("YYYY-MM-DD") : "")
                  }
                  style={{ width: "100%", height: 40, borderRadius: 10 }}
                  allowClear={false}
                  placeholder="JJ/MM/AAAA"
                />
              </label>
              <label>
                <span>Date de fin</span>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={dateFin ? dayjs(dateFin) : null}
                  disabledDate={(current) =>
                    dateDebut ? current && current.isBefore(dayjs(dateDebut), "day") : false
                  }
                  onChange={(date) =>
                    setDateFin(date ? date.format("YYYY-MM-DD") : "")
                  }
                  style={{ width: "100%", height: 40, borderRadius: 10 }}
                  allowClear={false}
                  placeholder="JJ/MM/AAAA"
                />
              </label>
            </>
          )}

          {(mode === "MOIS" || mode === "ANNEE") && (
            <label>
              <span>Année</span>
              <select value={annee} onChange={(event) => setAnnee(Number(event.target.value))}>
                {Array.from({ length: 8 }, (_, index) => now.getFullYear() - index).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
          {mode === "MOIS" && (
            <label>
              <span>Mois</span>
              <select value={mois} onChange={(event) => setMois(Number(event.target.value))}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {monthFormatter.format(new Date(2026, value - 1, 1))}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>Parking</span>
            <select
              value={parkingId ?? ""}
              onChange={(event) => setParkingId(event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Tous les parkings</option>
              {(parkingsQuery.data ?? []).map((parking: Parking) => (
                <option key={parking.id} value={parking.id}>{parking.nom}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Type d’abonnement</span>
            <select
              value={typeAbonnement}
              onChange={(event) => setTypeAbonnement(event.target.value as TypeAbonnementReporting)}
            >
              <option value="TOUS">Tous</option>
              <option value="REGULIER">Régulier</option>
              <option value="CORPORATE">Corporate</option>
            </select>
          </label>
          <button type="button" className="ca-reset" onClick={resetFilters}>
            <ReloadOutlined /> Réinitialiser
          </button>
        </div>
      </section>

      {dashboardQuery.isLoading && (
        <div className="ca-loading" aria-live="polite">
          <span />
          <p>Calcul des indicateurs financiers…</p>
        </div>
      )}
      {dashboardQuery.isError && (
        <div className="ca-error" role="alert">
          <strong>Impossible de charger le chiffre d’affaires.</strong>
          <span>Vérifiez votre session puis réessayez.</span>
          <button type="button" onClick={() => dashboardQuery.refetch()}>Réessayer</button>
        </div>
      )}
      {dashboardQuery.data && (
        <DashboardContent 
          data={dashboardQuery.data} 
          audience={audience}
          selectedParkingNom={parkingsQuery.data?.find((p) => p.id === parkingId)?.nom}
        />
      )}
    </div>
  );
}
