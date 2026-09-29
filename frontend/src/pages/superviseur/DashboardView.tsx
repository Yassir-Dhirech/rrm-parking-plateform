import { useMemo, useState } from "react";
import { Alert, Button, DatePicker, Empty, Progress, Select, Skeleton, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarOutlined, CheckCircleOutlined, CreditCardOutlined,
  EnvironmentOutlined, FileDoneOutlined, ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { getSuperviseurDashboard } from "../../api/superviseurDashboard";
import type { SuperviseurAction, SuperviseurArrete } from "../../api/superviseurDashboard";
import { SuperviseurMap } from "./SuperviseurMap";
import "./DashboardView.css";

type Periode = "7j" | "aujourdhui" | "mois" | "personnalisee";

const dateTexte = (value: string) => dayjs(value).format("DD/MM/YYYY");
const dateHeure = (value: string | null) => value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "Date indisponible";

function aujourdHuiRrm() {
  const parties = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const valeur = (type: string) => parties.find(partie => partie.type === type)?.value ?? "";
  return dayjs(`${valeur("year")}-${valeur("month")}-${valeur("day")}`);
}

function calculerPeriode(mode: Periode, personnalisee: [string, string] | null): [string, string] {
  const aujourdHui = aujourdHuiRrm();
  if (mode === "aujourdhui") return [aujourdHui.format("YYYY-MM-DD"), aujourdHui.format("YYYY-MM-DD")];
  if (mode === "mois") return [aujourdHui.startOf("month").format("YYYY-MM-DD"), aujourdHui.format("YYYY-MM-DD")];
  if (mode === "personnalisee" && personnalisee) return personnalisee;
  return [aujourdHui.subtract(6, "day").format("YYYY-MM-DD"), aujourdHui.format("YYYY-MM-DD")];
}

export function SuperviseurDashboardView() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Periode>("7j");
  const [personnalisee, setPersonnalisee] = useState<[string, string] | null>(null);
  const [parkingId, setParkingId] = useState<number | null>(null);
  const [debut, fin] = calculerPeriode(mode, personnalisee);
  const query = useQuery({
    queryKey: ["superviseur-dashboard", debut, fin],
    queryFn: () => getSuperviseurDashboard(debut, fin),
    refetchInterval: 60_000,
  });

  const data = query.data;
  const parkingSelectionne = data?.parkings.find(p => p.id === parkingId);
  const arretes = useMemo(() => data?.arretes.filter(a => parkingId === null || a.parkingId === parkingId) ?? [], [data, parkingId]);
  const actions = useMemo(() => data?.actions.filter(a => parkingId === null || a.parkingId === parkingId) ?? [], [data, parkingId]);
  const stats = useMemo(() => {
    const resultat = new Map<string, number>();
    for (const arrete of arretes) {
      const cle = dayjs(arrete.dateArret).diff(dayjs(debut), "day") <= 30
        && dayjs(fin).diff(dayjs(debut), "day") <= 30
        ? arrete.dateArret : dayjs(arrete.dateArret).format("YYYY-MM");
      resultat.set(cle, (resultat.get(cle) ?? 0) + 1);
    }
    const jours = dayjs(fin).diff(dayjs(debut), "day");
    const cles = [];
    if (jours <= 30) {
      for (let date = dayjs(debut); !date.isAfter(dayjs(fin)); date = date.add(1, "day")) cles.push(date.format("YYYY-MM-DD"));
    } else {
      for (let date = dayjs(debut).startOf("month"); !date.isAfter(dayjs(fin)); date = date.add(1, "month")) cles.push(date.format("YYYY-MM"));
    }
    return cles.map(cle => ({ cle, nombre: resultat.get(cle) ?? 0 }));
  }, [arretes, debut, fin]);

  if (query.isLoading) return <div className="superviseur-dashboard"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  if (query.isError || !data) return (
    <div className="superviseur-dashboard"><Alert type="error" showIcon
      message="Impossible de charger le tableau de bord superviseur"
      action={<Button onClick={() => query.refetch()}>Réessayer</Button>} /></div>
  );

  const reguliers = parkingSelectionne?.abonnementsReguliersActifs ?? data.abonnementsReguliersActifs;
  const corporate = parkingSelectionne?.contratsCorporateActifs ?? data.contratsCorporateActifs;
  const totalAbonnements = reguliers + corporate;
  const cartesFiltrees = parkingSelectionne?.actionsCartesEnAttente ?? data.actionsCartesEnAttente;
  const demandesFiltrees = parkingSelectionne?.demandesAValider ?? data.demandesAValider;

  return (
    <section className="superviseur-dashboard">
      <header className="superviseur-dashboard__header">
        <div><span className="superviseur-dashboard__eyebrow">Espace superviseur · Vue opérationnelle</span>
          <h1>Tableau de bord</h1>
          <p>Vos parkings affectés, vos décisions et vos arrêtés de recettes.</p></div>
        <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Actualiser</Button>
      </header>

      {data.parkingsAffectes === 0 && <Alert type="info" showIcon message="Aucun parking ne vous est actuellement affecté." />}

      <div className="superviseur-dashboard__kpis">
        {[
          { label: "Actions cartes en attente", value: cartesFiltrees, icon: <CreditCardOutlined />, path: "/superviseur/activations-cartes", tone: "violet" },
          { label: "Arrêtés effectués", value: arretes.length, icon: <FileDoneOutlined />, path: "/superviseur/recettes", tone: "cyan", note: `${dateTexte(debut)} – ${dateTexte(fin)}` },
          { label: "Demandes à valider", value: demandesFiltrees, icon: <CheckCircleOutlined />, path: "/superviseur/demandes", tone: "orange" },
          { label: "Parkings affectés", value: data.parkingsAffectes, icon: <EnvironmentOutlined />, path: "#mes-parkings", tone: "blue" },
        ].map(kpi => <button key={kpi.label} type="button" className={`superviseur-dashboard__kpi ${kpi.tone}`}
          onClick={() => kpi.path.startsWith("#") ? document.getElementById("mes-parkings")?.scrollIntoView({ behavior: "smooth" }) : navigate(kpi.path)}>
          <span className="superviseur-dashboard__kpi-icon">{kpi.icon}</span>
          <span className="superviseur-dashboard__kpi-value">{kpi.value}</span>
          <span className="superviseur-dashboard__kpi-label">{kpi.label}</span>
          {kpi.note && <small>{kpi.note}</small>}
        </button>)}
      </div>

      <div className="superviseur-dashboard__main">
        <article className="superviseur-dashboard__panel" id="mes-parkings">
          <div className="superviseur-dashboard__panel-head"><div><span className="superviseur-dashboard__eyebrow">Périmètre autorisé</span><h2>Mes parkings</h2></div>
            {parkingId !== null && <Button size="small" onClick={() => setParkingId(null)}>Tous les parkings</Button>}</div>
          {data.parkings.length ? <><SuperviseurMap parkings={data.parkings} selectedId={parkingId} onSelect={setParkingId} />
            <div className="superviseur-dashboard__parking-list">{data.parkings.map(p =>
              <button key={p.id} type="button" className={parkingId === p.id ? "is-selected" : ""}
                onClick={() => setParkingId(parkingId === p.id ? null : p.id)}>
                <span>{p.nom}</span><strong>{p.placesLibres} libres</strong>
              </button>)}</div></> : <Empty description="Aucun parking affecté" />}
        </article>

        <article className="superviseur-dashboard__panel">
          <div className="superviseur-dashboard__panel-head"><div><span className="superviseur-dashboard__eyebrow">À traiter</span><h2>Mes actions à faire</h2></div><Tag color="cyan">{actions.length} affichée(s)</Tag></div>
          {actions.length ? <div className="superviseur-dashboard__actions">{actions.slice(0, 12).map((action: SuperviseurAction) =>
            <button type="button" key={`${action.type}-${action.id}`} onClick={() => navigate(action.chemin)}>
              <span className={`superviseur-dashboard__action-dot ${action.type.toLowerCase()}`} />
              <span><strong>{action.libelle}</strong><small>{action.reference} · {action.parkingNom} · {dateHeure(action.depuis)}</small></span>
              <span aria-hidden="true">→</span>
            </button>)}</div> : <Empty description="Aucune action en attente" />}
        </article>
      </div>

      <div className="superviseur-dashboard__period-head">
        <div><span className="superviseur-dashboard__eyebrow">Historique réel</span><h2>Arrêtés de recettes</h2></div>
        <div className="superviseur-dashboard__period-controls">
          <Select<Periode> value={mode} style={{ minWidth: 170 }} onChange={setMode} options={[
            { value: "7j", label: "7 derniers jours" }, { value: "aujourdhui", label: "Aujourd'hui" },
            { value: "mois", label: "Ce mois" }, { value: "personnalisee", label: "Dates personnalisées" },
          ]} />
          {mode === "personnalisee" && <DatePicker.RangePicker
            value={personnalisee ? [dayjs(personnalisee[0]), dayjs(personnalisee[1])] : null}
            disabledDate={date => date.isAfter(aujourdHuiRrm(), "day")}
            onChange={dates => setPersonnalisee(dates?.[0] && dates?.[1]
              ? [dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")] : null)} />}
        </div>
      </div>

      <div className="superviseur-dashboard__analytics">
        <article className="superviseur-dashboard__panel">
          <div className="superviseur-dashboard__panel-head"><div><span className="superviseur-dashboard__eyebrow">{dateTexte(debut)} – {dateTexte(fin)}</span><h2>Arrêtés sur la période</h2></div><Tag color="blue">{arretes.length} arrêté(s)</Tag></div>
          <div className="superviseur-dashboard__chart">{stats.map(item =>
            <div key={item.cle} className="superviseur-dashboard__bar" title={`${item.cle} : ${item.nombre} arrêté(s)`}>
              <span>{item.nombre || ""}</span><i style={{ height: `${Math.max(3, item.nombre / Math.max(1, ...stats.map(s => s.nombre)) * 100)}%` }} />
              <small>{item.cle.length === 7 ? dayjs(`${item.cle}-01`).format("MMM YY") : dayjs(item.cle).format("DD/MM")}</small>
            </div>)}</div>
          <div className="superviseur-dashboard__arretes">{arretes.length ? arretes.slice(0, 8).map((arrete: SuperviseurArrete) =>
            <button type="button" key={arrete.id} onClick={() => navigate(`/superviseur/recettes/${arrete.id}`)}>
              <span><strong>{arrete.reference}</strong><small>{arrete.parkingNom} · {dateTexte(arrete.dateArret)} · {arrete.nombrePaiements} paiement(s)</small></span>
              <Tag color={arrete.statut === "BROUILLON" ? "gold" : arrete.statut === "TRANSMISE" ? "blue" : "green"}>{arrete.statut.replaceAll("_", " ")}</Tag>
            </button>) : <Empty description="Aucun arrêté sur cette période" />}</div>
        </article>

        <article className="superviseur-dashboard__panel">
          <div className="superviseur-dashboard__panel-head"><div><span className="superviseur-dashboard__eyebrow">Abonnements suivis</span><h2>Distribution des abonnements supervisés</h2></div></div>
          <div className="superviseur-dashboard__distribution-total">{totalAbonnements}<small>abonnements / contrats actifs</small></div>
          <div className="superviseur-dashboard__distribution-line"><span>Réguliers actifs</span><strong>{reguliers}</strong></div>
          <Progress percent={totalAbonnements ? Math.round(reguliers / totalAbonnements * 100) : 0} showInfo={false} strokeColor="#0c92bf" trailColor="#e5edf2" />
          <div className="superviseur-dashboard__distribution-line"><span>Contrats corporate finalisés</span><strong>{corporate}</strong></div>
          <Progress percent={totalAbonnements ? Math.round(corporate / totalAbonnements * 100) : 0} showInfo={false} strokeColor="#9050c5" trailColor="#e5edf2" />
          <p className="superviseur-dashboard__hint">Calculé à partir des abonnements et contrats des parkings affectés.</p>
        </article>
      </div>

      <article className="superviseur-dashboard__panel">
        <div className="superviseur-dashboard__panel-head"><div><span className="superviseur-dashboard__eyebrow">Disponibilité des abonnements</span><h2>Places libres par parking</h2></div>
          <small><CalendarOutlined /> Actualisé le {dateHeure(data.actualiseLe)}</small></div>
        <div className="superviseur-dashboard__availability">{data.parkings.filter(p => parkingId === null || p.id === parkingId).map(p =>
          <div key={p.id} className="superviseur-dashboard__availability-row">
            <div><strong>{p.nom}</strong><small>{p.code} · {p.statut.replaceAll("_", " ")}</small></div>
            <div><strong>{p.placesLibres} / {p.quotaAbonnements}</strong><small>places libres / quota abonnements</small></div>
            <Progress percent={p.quotaAbonnements ? Math.min(100, Math.round(p.placesOccupees / p.quotaAbonnements * 100)) : 0}
              showInfo={false} strokeColor="#0c92bf" trailColor="#e5edf2" />
          </div>)}{data.parkings.length === 0 && <Empty description="Aucune donnée de parking" />}</div>
        <p className="superviseur-dashboard__hint">Disponibilité des abonnements enregistrés dans la plateforme, actualisée chaque minute. Elle ne mesure pas l’occupation physique des barrières.</p>
      </article>
    </section>
  );
}
