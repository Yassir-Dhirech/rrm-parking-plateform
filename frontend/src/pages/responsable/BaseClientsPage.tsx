import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BankOutlined, CalendarOutlined, CarOutlined, IdcardOutlined,
  SearchOutlined, TeamOutlined,
} from "@ant-design/icons";
import {
  consulterClientCorporate, consulterClientRegulier,
  listerClientsCorporate, listerClientsReguliers,
  type ClientCorporateDetail, type ClientRegulierDetail,
  type DemandeClient,
  type FiltresBaseClients, type PageClients, type StatutClient,
  type VehiculeClient,
} from "../../api/baseClients";
import "./BaseClientsPage.css";
import { useAuth } from "../../context/AuthContext";

const DATE = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

function date(value?: string | null) {
  if (!value) return "Non renseignée";
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? value : DATE.format(parsed);
}

function argent(value: number) {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
}

function libelleStatut(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (lettre) => lettre.toUpperCase());
}

function useRecherche(value: string) {
  const [recherche, setRecherche] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setRecherche(value), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return recherche;
}

function Champ({ titre, valeur }: { titre: string; valeur?: string | null }) {
  return <div className="base-clients__field"><span>{titre}</span><strong>{valeur || "Non renseigné"}</strong></div>;
}

function Vehicules({ items }: { items: VehiculeClient[] }) {
  return <section className="base-clients__detail-section">
    <h4><CarOutlined /> Véhicules enregistrés <span>{items.length}</span></h4>
    {items.length === 0 ? <p className="base-clients__muted">Aucun véhicule enregistré.</p> :
      <div className="base-clients__vehicle-list">{items.map((vehicule) =>
        <div className="base-clients__vehicle" key={vehicule.id}>
          <strong>{vehicule.immatriculation}</strong>
          <span>{[vehicule.marque, vehicule.modele].filter(Boolean).join(" ") || libelleStatut(vehicule.type)}</span>
          <small>{libelleStatut(vehicule.statut)}{vehicule.couleur ? ` · ${vehicule.couleur}` : ""}</small>
        </div>)}</div>}
  </section>;
}

function Demandes({ items }: { items: DemandeClient[] }) {
  return <section className="base-clients__detail-section">
    <h4><CalendarOutlined /> Historique des demandes <span>{items.length}</span></h4>
    {items.length === 0 ? <p className="base-clients__muted">Aucune demande enregistrée.</p> :
      <div className="base-clients__history">{items.map((demande) =>
        <article className="base-clients__history-card" key={demande.reference}>
          <div className="base-clients__history-head"><strong>{demande.reference}</strong>
            <span className="base-clients__pill">{libelleStatut(demande.statut)}</span></div>
          <p>{demande.dateSoumission ? "Soumise" : "Créée"} le {date(demande.dateSoumission || demande.dateCreation)}
            {` · Canal : ${libelleStatut(demande.canalInitiation)}`}</p>
        </article>)}</div>}
  </section>;
}

function DetailRegulier({ client }: { client: ClientRegulierDetail }) {
  return <>
    <div className="base-clients__detail-title"><span className="base-clients__avatar"><IdcardOutlined /></span>
      <div><span className="base-clients__eyebrow">Fiche client régulier</span>
        <h3>{client.prenom} {client.nom}</h3><p>Client depuis le {date(client.dateCreation)}</p></div>
      <span className={`base-clients__status base-clients__status--${client.statut.toLowerCase()}`}>{libelleStatut(client.statut)}</span>
    </div>
    <div className="base-clients__fields">
      <Champ titre="CIN" valeur={client.cin} />
      <Champ titre="E-mail" valeur={client.email} />
      <Champ titre="Téléphone" valeur={client.telephone} />
      <Champ titre="Dernière mise à jour" valeur={date(client.dateModification)} />
    </div>
    <Vehicules items={client.vehicules} />
    <section className="base-clients__detail-section">
      <h4><CalendarOutlined /> Historique des abonnements <span>{client.abonnements.length}</span></h4>
      {client.abonnements.length === 0 ? <p className="base-clients__muted">Aucun abonnement enregistré.</p> :
        <div className="base-clients__history">{client.abonnements.map((abonnement) =>
          <article className="base-clients__history-card" key={abonnement.id}>
            <div className="base-clients__history-head"><strong>{abonnement.reference}</strong>
              <span className="base-clients__pill">{libelleStatut(abonnement.statut)}</span></div>
            <p>Créé le {date(abonnement.dateCreation)}</p>
            {abonnement.affectations.map((affectation, index) =>
              <p key={`${affectation.parkingId}-${index}`}>
                Parking : <b>{affectation.parkingNom}</b> · {date(affectation.dateDebut)} – {affectation.dateFin ? date(affectation.dateFin) : "en cours"}
              </p>)}
            {abonnement.periodes.map((periode) =>
              <div className="base-clients__period" key={periode.numero}>
                <span>Période {periode.numero} · {date(periode.dateDebut)} – {date(periode.dateFin)}</span>
                <strong>{argent(periode.prixHT)} HT</strong>
                <small>{libelleStatut(periode.statut)}</small>
              </div>)}
          </article>)}</div>}
    </section>
    <Demandes items={client.demandes} />
  </>;
}

function DetailCorporate({ client }: { client: ClientCorporateDetail }) {
  const contact = [client.prenomContactPrincipal, client.nomContactPrincipal].filter(Boolean).join(" ");
  return <>
    <div className="base-clients__detail-title"><span className="base-clients__avatar base-clients__avatar--corporate"><BankOutlined /></span>
      <div><span className="base-clients__eyebrow">Fiche entreprise</span>
        <h3>{client.raisonSociale}</h3><p>Client depuis le {date(client.dateCreation)}</p></div>
      <span className={`base-clients__status base-clients__status--${client.statut.toLowerCase()}`}>{libelleStatut(client.statut)}</span>
    </div>
    <div className="base-clients__fields">
      <Champ titre="ICE" valeur={client.ice} />
      <Champ titre="Registre de commerce" valeur={client.numeroRC} />
      <Champ titre="Adresse du siège" valeur={client.adresseSiege} />
      <Champ titre="E-mail" valeur={client.email} />
      <Champ titre="Téléphone" valeur={client.telephone} />
      <Champ titre="Contact principal" valeur={contact} />
      <Champ titre="Fonction du contact" valeur={client.fonctionContactPrincipal} />
      <Champ titre="Dernière mise à jour" valeur={date(client.dateModification)} />
    </div>
    <Vehicules items={client.vehicules} />
    <section className="base-clients__detail-section">
      <h4><CalendarOutlined /> Historique des contrats <span>{client.contrats.length}</span></h4>
      {client.contrats.length === 0 ? <p className="base-clients__muted">Aucun contrat enregistré.</p> :
        <div className="base-clients__history">{client.contrats.map((contrat) =>
          <article className="base-clients__history-card" key={contrat.id}>
            <div className="base-clients__history-head"><strong>{contrat.reference}</strong>
              <span className="base-clients__pill">{libelleStatut(contrat.statut)}</span></div>
            <p>Créé le {date(contrat.dateCreation)} · {contrat.nombrePlaces} places contractuelles</p>
            {contrat.dateDebut && <p>Validité : {date(contrat.dateDebut)} – {date(contrat.dateFin)}</p>}
            {contrat.abonnementReference && <p>Abonnement : <b>{contrat.abonnementReference}</b>
              {contrat.abonnementStatut && ` · ${libelleStatut(contrat.abonnementStatut)}`}</p>}
          </article>)}</div>}
    </section>
    <Demandes items={client.demandes} />
  </>;
}

function NavigationPages({ page, total, taille, onPage }: {
  page: number; total: number; taille: number; onPage: (value: number) => void;
}) {
  if (total <= taille) return null;
  const dernierePage = Math.max(0, Math.ceil(total / taille) - 1);
  return <nav className="base-clients__pagination" aria-label="Pagination des clients">
    <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)}>Précédent</button>
    <span>Page {page + 1} / {dernierePage + 1}</span>
    <button type="button" disabled={page >= dernierePage} onClick={() => onPage(page + 1)}>Suivant</button>
  </nav>;
}

const VIDE: FiltresBaseClients = { recherche: "", statut: "", dateDebut: "", dateFin: "", page: 0 };

export function BaseClientsPage() {
  const { role } = useAuth();
  const [statut, setStatut] = useState<StatutClient | "">("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rechercheRegulier, setRechercheRegulier] = useState("");
  const [rechercheCorporate, setRechercheCorporate] = useState("");
  const [pageRegulier, setPageRegulier] = useState(0);
  const [pageCorporate, setPageCorporate] = useState(0);
  const [selectionRegulier, setSelectionRegulier] = useState<number | null>(null);
  const [selectionCorporate, setSelectionCorporate] = useState<number | null>(null);
  const rechercheRegulierStable = useRecherche(rechercheRegulier);
  const rechercheCorporateStable = useRecherche(rechercheCorporate);
  const datesValides = !dateDebut || !dateFin || dateDebut <= dateFin;

  const filtresReguliers: FiltresBaseClients = { recherche: rechercheRegulierStable, statut, dateDebut, dateFin, page: pageRegulier };
  const filtresCorporate: FiltresBaseClients = { recherche: rechercheCorporateStable, statut, dateDebut, dateFin, page: pageCorporate };
  const reguliers = useQuery({ queryKey: ["base-clients-reguliers", filtresReguliers],
    queryFn: () => listerClientsReguliers(filtresReguliers), enabled: datesValides });
  const corporate = useQuery({ queryKey: ["base-clients-corporate", filtresCorporate],
    queryFn: () => listerClientsCorporate(filtresCorporate), enabled: datesValides });

  useEffect(() => {
    if (!reguliers.data) return;
    setSelectionRegulier((courant) => reguliers.data.content.some((item) => item.id === courant)
      ? courant : (reguliers.data.content[0]?.id ?? null));
  }, [reguliers.data]);
  useEffect(() => {
    if (!corporate.data) return;
    setSelectionCorporate((courant) => corporate.data.content.some((item) => item.id === courant)
      ? courant : (corporate.data.content[0]?.id ?? null));
  }, [corporate.data]);

  const detailRegulier = useQuery({ queryKey: ["base-client-regulier", selectionRegulier],
    queryFn: () => consulterClientRegulier(selectionRegulier!), enabled: selectionRegulier !== null });
  const detailCorporate = useQuery({ queryKey: ["base-client-corporate", selectionCorporate],
    queryFn: () => consulterClientCorporate(selectionCorporate!), enabled: selectionCorporate !== null });

  function changerFiltres(action: () => void) {
    action();
    setPageRegulier(0);
    setPageCorporate(0);
    setSelectionRegulier(null);
    setSelectionCorporate(null);
  }

  function reinitialiser() {
    changerFiltres(() => {
      setStatut(VIDE.statut);
      setDateDebut(""); setDateFin("");
      setRechercheRegulier(""); setRechercheCorporate("");
    });
  }

  return <main className="base-clients">
    <header className="base-clients__hero">
      <div><span className="base-clients__eyebrow">Espace {role === "COMPTABLE" ? "comptable" : "responsable"} · Répertoire central</span>
        <h1>Base des clients</h1>
        <p>Consultez les clients réguliers et corporate, leurs coordonnées et leur historique réel.</p></div>
      <TeamOutlined className="base-clients__hero-icon" aria-hidden="true" />
    </header>

    <section className="base-clients__filters" aria-label="Filtres communs">
      <div><span className="base-clients__eyebrow">Affiner les résultats</span><h2>Filtres</h2></div>
      <label>Statut du client
        <select value={statut} onChange={(event) => changerFiltres(() => setStatut(event.target.value as StatutClient | ""))}>
          <option value="">Tous les statuts</option><option value="ACTIF">Actif</option><option value="ARCHIVE">Archivé</option>
        </select></label>
      <label>Inscrit à partir du
        <input type="date" value={dateDebut} onChange={(event) => changerFiltres(() => setDateDebut(event.target.value))} /></label>
      <label>Inscrit jusqu’au
        <input type="date" value={dateFin} onChange={(event) => changerFiltres(() => setDateFin(event.target.value))} /></label>
      <button type="button" onClick={reinitialiser}>Réinitialiser</button>
      {!datesValides && <p className="base-clients__validation">La date de début doit précéder la date de fin.</p>}
    </section>

    <section className="base-clients__section" aria-labelledby="base-reguliers-title">
      <div className="base-clients__section-head"><div><span className="base-clients__eyebrow">Particuliers</span>
        <h2 id="base-reguliers-title">Clients réguliers</h2></div>
        <span className="base-clients__count">{reguliers.data?.totalElements ?? "—"} résultat(s)</span></div>
      <div className="base-clients__split">
        <div className="base-clients__list-panel">
          <label className="base-clients__search"><SearchOutlined /><input type="search" value={rechercheRegulier}
            onChange={(event) => { setRechercheRegulier(event.target.value); setPageRegulier(0); setSelectionRegulier(null); }}
            placeholder="Nom, prénom, CIN ou contact" aria-label="Rechercher un client régulier" /></label>
          <ListeReguliers page={reguliers.data} chargement={reguliers.isPending} erreur={reguliers.isError}
            selection={selectionRegulier} onSelection={setSelectionRegulier} onPage={(page) => { setPageRegulier(page); setSelectionRegulier(null); }} />
        </div>
        <div className="base-clients__detail-panel" aria-live="polite">
          {detailRegulier.isError ? <p className="base-clients__error">Impossible de charger cette fiche client.</p> :
            detailRegulier.isPending ? <p className="base-clients__muted">{selectionRegulier ? "Chargement de la fiche…" : "Sélectionnez un client pour afficher sa fiche."}</p> :
              detailRegulier.data && <DetailRegulier client={detailRegulier.data} />}
        </div>
      </div>
    </section>

    <section className="base-clients__section" aria-labelledby="base-corporate-title">
      <div className="base-clients__section-head"><div><span className="base-clients__eyebrow">Entreprises</span>
        <h2 id="base-corporate-title">Clients corporate</h2></div>
        <span className="base-clients__count">{corporate.data?.totalElements ?? "—"} résultat(s)</span></div>
      <div className="base-clients__split">
        <div className="base-clients__list-panel">
          <label className="base-clients__search"><SearchOutlined /><input type="search" value={rechercheCorporate}
            onChange={(event) => { setRechercheCorporate(event.target.value); setPageCorporate(0); setSelectionCorporate(null); }}
            placeholder="Entreprise, ICE, RC ou contact" aria-label="Rechercher un client corporate" /></label>
          <ListeCorporate page={corporate.data} chargement={corporate.isPending} erreur={corporate.isError}
            selection={selectionCorporate} onSelection={setSelectionCorporate} onPage={(page) => { setPageCorporate(page); setSelectionCorporate(null); }} />
        </div>
        <div className="base-clients__detail-panel" aria-live="polite">
          {detailCorporate.isError ? <p className="base-clients__error">Impossible de charger cette fiche entreprise.</p> :
            detailCorporate.isPending ? <p className="base-clients__muted">{selectionCorporate ? "Chargement de l’historique…" : "Sélectionnez une entreprise pour consulter son historique."}</p> :
              detailCorporate.data && <DetailCorporate client={detailCorporate.data} />}
        </div>
      </div>
    </section>
  </main>;
}

function ListeReguliers({ page, chargement, erreur, selection, onSelection, onPage }: {
  page?: PageClients<{ id: number; nomComplet: string; cin: string; email: string | null; telephone: string | null; statut: StatutClient }>;
  chargement: boolean; erreur: boolean; selection: number | null;
  onSelection: (id: number) => void; onPage: (page: number) => void;
}) {
  if (erreur) return <p className="base-clients__error">Impossible de charger les clients réguliers.</p>;
  if (chargement) return <p className="base-clients__muted">Chargement des clients…</p>;
  if (!page?.content.length) return <p className="base-clients__muted">Aucun client régulier ne correspond aux filtres.</p>;
  return <><div className="base-clients__items">{page.content.map((client) =>
    <button type="button" className={`base-clients__item ${selection === client.id ? "is-selected" : ""}`}
      key={client.id} onClick={() => onSelection(client.id)} aria-pressed={selection === client.id}>
      <span className="base-clients__item-icon"><IdcardOutlined /></span>
      <span className="base-clients__item-main"><strong>{client.nomComplet}</strong>
        <small>CIN {client.cin} · {client.telephone || client.email || "Contact non renseigné"}</small></span>
      <span className={`base-clients__status base-clients__status--${client.statut.toLowerCase()}`}>{libelleStatut(client.statut)}</span>
    </button>)}</div>
    <NavigationPages page={page.page} total={page.totalElements} taille={page.size} onPage={onPage} />
  </>;
}

function ListeCorporate({ page, chargement, erreur, selection, onSelection, onPage }: {
  page?: PageClients<{ id: number; raisonSociale: string; ice: string; email: string | null; telephone: string | null; statut: StatutClient }>;
  chargement: boolean; erreur: boolean; selection: number | null;
  onSelection: (id: number) => void; onPage: (page: number) => void;
}) {
  if (erreur) return <p className="base-clients__error">Impossible de charger les entreprises.</p>;
  if (chargement) return <p className="base-clients__muted">Chargement des entreprises…</p>;
  if (!page?.content.length) return <p className="base-clients__muted">Aucune entreprise ne correspond aux filtres.</p>;
  return <><div className="base-clients__items">{page.content.map((client) =>
    <button type="button" className={`base-clients__item ${selection === client.id ? "is-selected" : ""}`}
      key={client.id} onClick={() => onSelection(client.id)} aria-pressed={selection === client.id}>
      <span className="base-clients__item-icon base-clients__item-icon--corporate"><BankOutlined /></span>
      <span className="base-clients__item-main"><strong>{client.raisonSociale}</strong>
        <small>ICE {client.ice} · {client.telephone || client.email || "Contact non renseigné"}</small></span>
      <span className={`base-clients__status base-clients__status--${client.statut.toLowerCase()}`}>{libelleStatut(client.statut)}</span>
    </button>)}</div>
    <NavigationPages page={page.page} total={page.totalElements} taille={page.size} onPage={onPage} />
  </>;
}
