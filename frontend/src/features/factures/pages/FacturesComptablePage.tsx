import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Input, Select, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  listerFacturesComptable,
  telechargerFactureComptablePdf,
  type FiltresFacturesComptable,
  type PorteeFactures,
} from "../../../api/facturationApi";
import { useAuth } from "../../../context/AuthContext";
import type { FactureResponse } from "../facturationTypes";
import "./FacturesComptablePage.css";

const TAILLE_PAGE = 12;
const monnaie = (valeur: number) =>
  `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valeur)} DH`;

function dateLisible(date: string | null) {
  return date ? new Date(date).toLocaleDateString("fr-FR") : "—";
}

const libelleStatut: Record<FactureResponse["statut"], string> = {
  BROUILLON: "Brouillon",
  EMISE: "Émise",
  ANNULEE: "Annulée",
};

function CarteFacture({
  facture,
  ouvrir,
  portee,
}: {
  facture: FactureResponse;
  ouvrir: (id: number) => void;
  portee: PorteeFactures;
}) {
  const [telechargement, setTelechargement] = useState(false);
  const [erreurPdf, setErreurPdf] = useState(false);
  const initiales = facture.clientNom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((partie) => partie.charAt(0).toUpperCase())
    .join("") || "?";

  async function telecharger() {
    setTelechargement(true);
    setErreurPdf(false);
    try {
      const pdf = await telechargerFactureComptablePdf(facture.id, portee);
      const url = URL.createObjectURL(pdf);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `${facture.numero}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setErreurPdf(true);
    } finally {
      setTelechargement(false);
    }
  }

  return (
    <article className="comptable-facture-card">
      <div className="comptable-facture-personne">
        <span className="comptable-facture-avatar" aria-hidden="true">{initiales}</span>
        <div className="comptable-facture-identite">
          <strong title={facture.clientNom}>{facture.clientNom}</strong>
          <span className={`comptable-facture-statut comptable-facture-statut--${facture.statut.toLowerCase()}`}>
            {libelleStatut[facture.statut]}
          </span>
        </div>
      </div>
      <div className="comptable-facture-meta">
        <span><strong>{facture.numero}</strong></span>
        <span>{dateLisible(facture.dateEmission ?? facture.dateCreation)}</span>
      </div>
      <div className="comptable-facture-meta comptable-facture-meta--secondaire">
        <span title={facture.parkingNom ?? undefined}>{facture.parkingNom ?? "Parking non renseigné"}</span>
        <span>{facture.modePaiement === "CHEQUE" ? "Chèque" : "Espèces"}</span>
      </div>
      <div className="comptable-facture-lignes">
        <div className="comptable-facture-ligne comptable-facture-ligne--entete">
          <span>Désignation</span><span>Qté</span><span>Montant TTC</span>
        </div>
        {facture.lignes.slice(0, 3).map((ligne, index) => (
          <div className="comptable-facture-ligne" key={ligne.id ?? `${ligne.typeLigne}-${index}`}>
            <span title={ligne.description}>{ligne.description}</span>
            <span>{ligne.quantite}</span>
            <span>{monnaie(ligne.montantTtc)}</span>
          </div>
        ))}
        {facture.lignes.length > 3 && (
          <span className="comptable-facture-autres">
            + {facture.lignes.length - 3} autre(s) ligne(s) · Voir détails
          </span>
        )}
        {facture.lignes.length === 0 && <span className="comptable-facture-autres">Aucune ligne</span>}
      </div>
      <div className="comptable-facture-total">
        <span>Total TTC</span><strong>{monnaie(facture.totalTtc)}</strong>
      </div>
      <div className="comptable-facture-actions">
        <Button onClick={() => ouvrir(facture.id)}>Voir détails</Button>
        {facture.statut === "EMISE" && (
          <Button type="primary" loading={telechargement} onClick={telecharger}>
            Télécharger PDF
          </Button>
        )}
      </div>
      {erreurPdf && <span className="comptable-facture-erreur" role="alert">Téléchargement impossible. Réessayez.</span>}
    </article>
  );
}

export function FacturesComptablePage() {
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const portee: PorteeFactures = role === "SUPERVISEUR" ? "superviseur"
    : role === "RESPONSABLE" ? "responsable" : "comptable";
  const [page, setPage] = useState(0);
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState<FiltresFacturesComptable["statut"]>();
  const [modePaiement, setModePaiement] = useState<FiltresFacturesComptable["modePaiement"]>();
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    const minuterie = window.setTimeout(() => {
      setRecherche(saisie.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(minuterie);
  }, [saisie]);

  const filtres: FiltresFacturesComptable = {
    recherche: recherche || undefined,
    statut,
    modePaiement,
    dateDebut: dateDebut || undefined,
    dateFin: dateFin || undefined,
  };
  const periodeInvalide = Boolean(dateDebut && dateFin && dateFin < dateDebut);
  const factures = useQuery({
    queryKey: ["factures-registre", portee, token, page, recherche, statut, modePaiement, dateDebut, dateFin],
    queryFn: () => listerFacturesComptable(page, filtres, TAILLE_PAGE, portee),
    enabled: !periodeInvalide,
  });
  const resultat = periodeInvalide ? undefined : factures.data;
  const totalFiltres = resultat?.factures.totalElements ?? 0;
  const cheques = resultat?.nombreCheques ?? 0;
  const especes = resultat?.nombreEspeces ?? 0;
  const totalPaiements = cheques + especes;
  const pourcentageCheques = totalPaiements ? (cheques / totalPaiements) * 100 : 0;
  const pourcentageEspeces = totalPaiements ? (especes / totalPaiements) * 100 : 0;
  const pages = Math.max(1, Math.ceil(totalFiltres / TAILLE_PAGE));

  function reinitialiser() {
    setSaisie("");
    setRecherche("");
    setStatut(undefined);
    setModePaiement(undefined);
    setDateDebut("");
    setDateFin("");
    setPage(0);
  }

  return (
    <main className={`comptable-factures ${portee === "superviseur" ? "supervisor-screen supervisor-factures" : ""}`}>
      <header className="comptable-factures-header">
        <div>
          <p className="comptable-factures-surtitre">{portee === "superviseur"
            ? "Espace superviseur · Parkings affectés"
            : portee === "responsable" ? "Espace responsable · Tous les parkings" : "Espace comptable"}</p>
          <h1>Registre des factures</h1>
          <p>Consultez les factures enregistrées et leurs paiements.</p>
        </div>
      </header>

      <section className="comptable-factures-resume" aria-label="Synthèse des factures">
        <div className="comptable-factures-kpi">
          <span>Nombre total de factures</span>
          <strong>{resultat?.totalFactures ?? "—"}</strong>
          <small>{resultat && `${totalFiltres} facture(s) avec les filtres actifs`}</small>
        </div>
        <div className="comptable-factures-repartition">
          <div className="comptable-factures-repartition-texte">
            <strong>Répartition des modes de paiement</strong>
            <span>Factures correspondant aux filtres · {totalPaiements} au total</span>
            <div className="comptable-factures-legende">
              <span><i className="comptable-factures-point comptable-factures-point--cheque" /> Chèques : {cheques} ({pourcentageCheques.toFixed(1)} %)</span>
              <span><i className="comptable-factures-point comptable-factures-point--espece" /> Espèces : {especes} ({pourcentageEspeces.toFixed(1)} %)</span>
            </div>
          </div>
          <div
            className="comptable-factures-camembert"
            style={{ background: totalPaiements ? `conic-gradient(#7458c5 0% ${pourcentageCheques}%, #32a783 ${pourcentageCheques}% 100%)` : "#e9e9f0" }}
            role="img"
            aria-label={`Chèques : ${pourcentageCheques.toFixed(1)} %, espèces : ${pourcentageEspeces.toFixed(1)} %`}
          ><span>{totalPaiements}</span></div>
        </div>
      </section>

      <section className="comptable-factures-filtres" aria-label="Recherche et filtres">
        <Input.Search
          placeholder="Numéro, référence ou client"
          aria-label="Rechercher une facture"
          value={saisie}
          maxLength={100}
          allowClear
          onChange={(evenement) => setSaisie(evenement.target.value)}
          className="comptable-factures-recherche"
        />
        <Select
          aria-label="Filtrer par statut"
          placeholder="Tous les statuts"
          allowClear
          value={statut}
          onChange={(valeur) => { setStatut(valeur); setPage(0); }}
          options={[
            { value: "EMISE", label: "Émise" },
            { value: "BROUILLON", label: "Brouillon" },
            { value: "ANNULEE", label: "Annulée" },
          ]}
        />
        <Select
          aria-label="Filtrer par mode de paiement"
          placeholder="Tous les paiements"
          allowClear
          value={modePaiement}
          onChange={(valeur) => { setModePaiement(valeur); setPage(0); }}
          options={[{ value: "CHEQUE", label: "Chèque" }, { value: "ESPECE", label: "Espèces" }]}
        />
        <label>Création du <input type="date" value={dateDebut} max={dateFin || undefined} onChange={(e) => { setDateDebut(e.target.value); setPage(0); }} /></label>
        <label>Au <input type="date" value={dateFin} min={dateDebut || undefined} onChange={(e) => { setDateFin(e.target.value); setPage(0); }} /></label>
        <Button onClick={reinitialiser}>Réinitialiser</Button>
      </section>

      {periodeInvalide && <Alert showIcon type="warning" message="La date de fin doit être égale ou postérieure à la date de début." />}
      {factures.isError && !periodeInvalide && (
        <Alert showIcon type="error" message="Impossible de charger les factures" action={<Button onClick={() => factures.refetch()}>Réessayer</Button>} />
      )}
      {factures.isPending && !periodeInvalide && <div className="comptable-factures-chargement"><Spin tip="Chargement des factures"><div /></Spin></div>}
      {!periodeInvalide && !factures.isPending && !factures.isError && (
        <>
          <div className="comptable-factures-liste-entete">
            <h2>Factures</h2><span>{totalFiltres} résultat(s)</span>
          </div>
          {totalFiltres === 0 ? (
            <div className="comptable-factures-vide">Aucune facture ne correspond à votre recherche.</div>
          ) : (
            <div className="comptable-factures-grille">
              {resultat?.factures.content.map((facture) => (
                <CarteFacture key={facture.id} facture={facture} portee={portee} ouvrir={(id) => navigate(`/${portee}/factures/${id}`)} />
              ))}
            </div>
          )}
          {pages > 1 && (
            <nav className="comptable-factures-pagination" aria-label="Pages des factures">
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</Button>
              <span>Page {page + 1} sur {pages}</span>
              <Button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Suivant</Button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
