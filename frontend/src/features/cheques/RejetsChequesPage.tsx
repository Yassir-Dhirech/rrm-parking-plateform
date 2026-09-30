import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Alert, Button, Card, DatePicker, Empty, Input, Space, Spin, Tag } from "antd";
import { useAuth } from "../../context/AuthContext";
import {
  agirDossier, confirmerOperationRejet, declarerRejet, listerOperationsRejet,
  listerRejetsCheques, listerNotificationsRejet, rechercherCheques, regulariserCheque,
  telechargerDocumentCorrectif, type ChequeCandidat, type DossierRejetCheque,
  type NotificationRejetCheque, type OperationRejetCheque,
} from "../../api/rejetsChequesApi";
import { RegularisationPaiementModal } from "./RegularisationPaiementModal";
import "./RejetsChequesPage.css";

function erreurLisible(erreur: unknown) {
  if (axios.isAxiosError<{ detail?: string }>(erreur)) {
    return erreur.response?.data?.detail || erreur.message;
  }
  return erreur instanceof Error ? erreur.message : "Une erreur est survenue";
}

const libelles: Record<DossierRejetCheque["statut"], string> = {
  EN_ATTENTE_VALIDATION: "À valider par le responsable",
  BLOCAGE_EN_COURS: "Cartes à désactiver",
  BLOQUE: "Bloqué, paiement attendu",
  REGULARISATION_ENREGISTREE: "Paiement reçu, validation du responsable attendue",
  REACTIVATION_EN_COURS: "Cartes à réactiver",
  TERMINE: "Accès rétabli",
};

export function RejetsChequesPage() {
  const { role } = useAuth();
  const [dossiers, setDossiers] = useState<DossierRejetCheque[]>([]);
  const [notifications, setNotifications] = useState<NotificationRejetCheque[]>([]);
  const [recherche, setRecherche] = useState("");
  const [candidats, setCandidats] = useState<ChequeCandidat[]>([]);
  const [page, setPage] = useState(0);
  const [nombrePages, setNombrePages] = useState(0);
  const [paiementChoisi, setPaiementChoisi] = useState<ChequeCandidat | null>(null);
  const [dateLettre, setDateLettre] = useState("");
  const [rapport, setRapport] = useState("");
  const [rechercheClient, setRechercheClient] = useState("");
  const [dossierPaiement, setDossierPaiement] = useState<DossierRejetCheque | null>(null);
  const [operations, setOperations] = useState<Record<number, OperationRejetCheque[]>>({});
  const [attente, setAttente] = useState(false);
  const [messageErreur, setMessageErreur] = useState("");
  const [messageSucces, setMessageSucces] = useState("");

  const charger = useCallback(async () => {
    try {
      const [dossiersRecus, notificationsRecues] = await Promise.all([
        listerRejetsCheques(), listerNotificationsRejet(),
      ]);
      setDossiers(dossiersRecus);
      setNotifications(notificationsRecues);
    } catch (erreur) {
      setMessageErreur(erreurLisible(erreur));
    }
  }, []);

  useEffect(() => {
    void charger();
    const intervalle = window.setInterval(() => { void charger(); }, 20_000);
    return () => window.clearInterval(intervalle);
  }, [charger]);

  async function chercherCheques(numeroPage = 0) {
    setAttente(true);
    setMessageErreur("");
    try {
      const reponse = await rechercherCheques(recherche, numeroPage);
      setCandidats(reponse.content);
      setNombrePages(reponse.totalPages);
      setPage(numeroPage);
    } catch (erreur) {
      setMessageErreur(erreurLisible(erreur));
    } finally {
      setAttente(false);
    }
  }

  async function executer(action: () => Promise<unknown>) {
    setAttente(true);
    setMessageErreur("");
    setMessageSucces("");
    try {
      await action();
      await charger();
      setMessageSucces("Opération enregistrée.");
      setOperations({});
    } catch (erreur) {
      setMessageErreur(erreurLisible(erreur));
    } finally {
      setAttente(false);
    }
  }

  async function chargerOperations(id: number, action: "bloquer" | "reactiver") {
    setMessageErreur("");
    try {
      const resultat = await listerOperationsRejet(id, action);
      setOperations((actuel) => ({ ...actuel, [id]: resultat }));
    } catch (erreur) {
      setMessageErreur(erreurLisible(erreur));
    }
  }

  const visibles = dossiers.filter((dossier) => {
    if (role === "AGENT") {
      const terme = rechercheClient.trim().toLocaleLowerCase("fr-FR");
      if (terme && ![dossier.clientNom, dossier.clientIdentifiant, dossier.clientTelephone,
        dossier.clientEmail, dossier.referenceAbonnement, dossier.numeroCheque]
        .some((valeur) => valeur?.toLocaleLowerCase("fr-FR").includes(terme))) {
        return false;
      }
      return true;
    }
    if (role === "SUPERVISEUR") return ["BLOCAGE_EN_COURS", "REACTIVATION_EN_COURS"].includes(dossier.statut);
    return true;
  });

  const estResponsable = role === "RESPONSABLE";
  const dossiersEnAttente = dossiers.filter((dossier) => dossier.statut === "EN_ATTENTE_VALIDATION");
  const historique = dossiers.filter((dossier) => dossier.statut !== "EN_ATTENTE_VALIDATION");
  const termeResponsable = rechercheClient.trim().toLocaleLowerCase("fr-FR");
  const dossiersAffiches = estResponsable && termeResponsable
    ? visibles.filter((dossier) => [dossier.clientNom, dossier.clientIdentifiant,
      dossier.clientTelephone, dossier.clientEmail, dossier.referenceAbonnement,
      dossier.numeroCheque, dossier.parkingNom, String(dossier.id)]
      .some((valeur) => valeur?.toLocaleLowerCase("fr-FR").includes(termeResponsable)))
    : visibles;

  function voirDossier(id: number) {
    setRechercheClient("");
    window.requestAnimationFrame(() => {
      document.getElementById(`rejet-dossier-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <div className={`rejets-page ${role === "AGENT" ? "rejets-page--agent" : ""} ${role === "SUPERVISEUR" ? "rejets-page--superviseur" : ""} ${estResponsable ? "rejets-page--responsable" : ""}`}>
      {!estResponsable && <header className="rejets-page__hero">
        <span className="rejets-page__eyebrow">SUIVI DES PAIEMENTS · {role === "AGENT" ? "ESPACE AGENT" : "REJETS DE CHÈQUES"}</span>
        <h1>{role === "AGENT" ? "Abonnements bloqués à régulariser" : "Rejets bancaires de chèques"}</h1>
        <p>Un dossier concerne uniquement l'abonnement lié au chèque rejeté. La désactivation et
          la réactivation des cartes sont déclarées après l'action sur le système des barrières.</p>
        {role === "AGENT" && <span className="rejets-page__count">{visibles.filter((dossier) => dossier.statut === "BLOQUE").length} paiement(s) attendu(s)</span>}
      </header>}
      {estResponsable && <p className="rejets-page__intro">Suivez les chèques rejetés, validez les blocages et consultez chaque étape de régularisation.</p>}
      {messageErreur && <Alert type="error" showIcon message={messageErreur} style={{ marginBottom: 16 }} />}
      {messageSucces && <Alert type="success" showIcon message={messageSucces} style={{ marginBottom: 16 }} />}
      {notifications.length > 0 && (
        <Card title="Dernières notifications du flux de rejet" size="small" style={{ marginBottom: 20 }}>
          {notifications.slice(0, 4).map((notification) => (
            <p key={notification.id}>
              <strong>{notification.sujet}</strong> · {notification.contenu}
            </p>
          ))}
        </Card>
      )}
      {role === "COMPTABLE" && (
        <Card title="Déclarer un chèque rejeté" style={{ marginBottom: 20 }}>
          <Space wrap>
            <Input.Search value={recherche} onChange={(event) => setRecherche(event.target.value)}
              onSearch={() => void chercherCheques()} placeholder="Client, abonnement ou numéro du chèque"
              style={{ width: 340 }} enterButton="Rechercher" />
            {page > 0 && <Button onClick={() => void chercherCheques(page - 1)}>Précédent</Button>}
            {page + 1 < nombrePages && <Button onClick={() => void chercherCheques(page + 1)}>Suivant</Button>}
          </Space>
          {candidats.map((candidat) => (
            <Card key={candidat.paiementId} size="small" style={{ marginTop: 12 }}>
              <Space wrap>
                <strong>{candidat.clientNom}</strong>
                <span>Abonnement {candidat.referenceAbonnement}</span>
                <span>Chèque {candidat.numeroCheque}</span>
                <span>{candidat.montantTtc} MAD</span>
                <Tag>{candidat.statutAbonnement}</Tag>
                <Button onClick={() => setPaiementChoisi(candidat)}>Déclarer le rejet</Button>
              </Space>
            </Card>
          ))}
          {paiementChoisi && (
            <div style={{ marginTop: 20 }}>
              <h3>Rapport pour le chèque {paiementChoisi.numeroCheque}</h3>
              <Space direction="vertical" style={{ width: "100%" }}>
                <label>Date de la lettre bancaire</label>
                <DatePicker onChange={(_, dateString) => setDateLettre(String(dateString))} />
                <label>Constat du comptable</label>
                <Input.TextArea rows={4} maxLength={2000} value={rapport}
                  onChange={(event) => setRapport(event.target.value)}
                  placeholder="Décrire le courrier et les faits constatés, sans inventer le motif de la banque." />
                <Button type="primary" disabled={!dateLettre || !rapport.trim() || attente}
                  onClick={() => void executer(async () => {
                    await declarerRejet(paiementChoisi.paiementId, dateLettre, rapport);
                    setPaiementChoisi(null);
                    setRapport("");
                  })}>Soumettre au responsable</Button>
              </Space>
            </div>
          )}
        </Card>
      )}
      <div className={estResponsable ? "rejets-page__workspace" : undefined}>
      {estResponsable && <aside className="rejets-page__side" aria-label="Suivi des rejets de chèques">
        <section className="rejets-page__summary rejets-page__summary--pending" aria-labelledby="rejets-pending-title">
          <div className="rejets-page__summary-heading">
            <div><span>À TRAITER</span><h2 id="rejets-pending-title">Dossiers de blocage en attente de validation</h2></div>
            <strong>{dossiersEnAttente.length}</strong>
          </div>
          {dossiersEnAttente.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun blocage à valider" /> :
            dossiersEnAttente.map((dossier) => <button type="button" key={dossier.id}
              className="rejets-page__summary-item" onClick={() => voirDossier(dossier.id)}>
              <strong>Dossier #{dossier.id} · {dossier.clientNom}</strong>
              <span>{dossier.parkingNom} · {dossier.montantInitialTtc.toLocaleString("fr-MA")} MAD</span>
              <small>Voir et valider le dossier →</small>
            </button>)}
        </section>
        <section className="rejets-page__summary rejets-page__summary--history" aria-labelledby="rejets-history-title">
          <div className="rejets-page__summary-heading">
            <div><span>TRAÇABILITÉ</span><h2 id="rejets-history-title">Historique des demandes passées par le blocage</h2></div>
            <strong>{historique.length}</strong>
          </div>
          {historique.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun dossier dans l'historique" /> :
            historique.map((dossier) => <button type="button" key={dossier.id}
              className="rejets-page__summary-item" onClick={() => voirDossier(dossier.id)}>
              <strong>Dossier #{dossier.id} · {dossier.clientNom}</strong>
              <span>{dossier.parkingNom} · {dossier.dateDeclaration?.slice(0, 10)}</span>
              <small>{libelles[dossier.statut]} →</small>
            </button>)}
        </section>
      </aside>}
      <section className={estResponsable ? "rejets-page__main" : undefined} aria-label={estResponsable ? "Recherche et dossiers de rejet" : undefined}>
      {estResponsable && <div className="rejets-page__search-panel">
        <div><span>RECHERCHE</span><h2>Retrouver un chèque rejeté</h2></div>
        <Input.Search placeholder="Client, CIN / ICE, chèque, abonnement ou parking"
          aria-label="Rechercher un dossier de chèque rejeté" allowClear
          value={rechercheClient} onChange={(evenement) => setRechercheClient(evenement.target.value)} />
      </div>}
      <div className="rejets-page__toolbar">
        <div><span className="rejets-page__eyebrow">DOSSIERS</span><h2>{role === "AGENT" ? "Paiements et comptes bloqués" : estResponsable ? "Dossiers de rejets" : "Dossiers"}</h2></div>
        {role === "AGENT" && (
          <Input.Search placeholder="Nom, CIN / ICE, téléphone, e-mail ou abonnement"
            aria-label="Rechercher un client bloqué" allowClear
            value={rechercheClient} onChange={(evenement) => setRechercheClient(evenement.target.value)} />
        )}
      </div>
      {attente && <Spin />}
      {!dossiersAffiches.length && <Empty description={termeResponsable ? "Aucun dossier ne correspond à la recherche" : "Aucun dossier disponible"} />}
      {dossiersAffiches.map((dossier) => (
        <Card id={`rejet-dossier-${dossier.id}`} key={dossier.id} className="rejets-page__dossier" title={`Dossier #${dossier.id} · ${dossier.clientNom}`}
          extra={<Tag color={dossier.statut === "TERMINE" ? "green" : "orange"}>
            {libelles[dossier.statut]}</Tag>}>
          {role === "AGENT" || role === "SUPERVISEUR" || estResponsable ? (
            <div className="rejets-page__details">
              <div><span>Abonnement</span><strong>{dossier.referenceAbonnement}</strong></div>
              <div><span>Parking</span><strong>{dossier.parkingNom}</strong></div>
              <div><span>Chèque rejeté</span><strong>{dossier.numeroCheque}</strong></div>
              <div className="rejets-page__amount"><span>{role === "AGENT" ? "Montant à régulariser" : "Montant initial"}</span><strong>{dossier.montantInitialTtc.toLocaleString("fr-MA")} MAD</strong></div>
              <div><span>CIN / ICE</span><strong>{dossier.clientIdentifiant || "Non renseigné"}</strong></div>
              <div><span>Téléphone</span><strong>{dossier.clientTelephone || "Non renseigné"}</strong></div>
              <div><span>E-mail</span><strong>{dossier.clientEmail || "Non renseigné"}</strong></div>
              <div><span>Statut de l'abonnement</span><Tag color={dossier.statutAbonnement === "SUSPENDU" ? "red" : "green"}>{dossier.statutAbonnement}</Tag></div>
              <div className="rejets-page__wide"><span>Lettre bancaire du {dossier.dateLettreBanque}</span><strong>{dossier.constatComptable}</strong></div>
              {dossier.factureInitialeNumero && <div><span>Facture initiale</span><strong>{dossier.factureInitialeNumero}</strong></div>}
              {dossier.factureRegularisationNumero && <div><span>Nouvelle facture</span><strong>{dossier.factureRegularisationNumero}</strong></div>}
            </div>
          ) : <>
            <p>Abonnement : <strong>{dossier.referenceAbonnement}</strong> · Parking : {dossier.parkingNom}
              · Chèque rejeté : {dossier.numeroCheque} · Montant initial : {dossier.montantInitialTtc} MAD</p>
            <p>Lettre bancaire du {dossier.dateLettreBanque} · Constat : {dossier.constatComptable}</p>
            {dossier.factureInitialeNumero && <p>Facture initiale : {dossier.factureInitialeNumero}</p>}
            {dossier.factureRegularisationNumero && <p>Nouvelle facture : {dossier.factureRegularisationNumero}</p>}
          </>}
          {dossier.referencePaiementRegularisation && (
            <p>Paiement de remplacement : <strong>{dossier.referencePaiementRegularisation}</strong>
              {dossier.agentRegularisation && ` · enregistré par ${dossier.agentRegularisation}`}
              · {dossier.modePaiementRegularisation}
              {dossier.numeroChequeRegularisation && ` · chèque ${dossier.numeroChequeRegularisation}`}
              {dossier.banqueChequeRegularisation && ` · banque ${dossier.banqueChequeRegularisation}`}
              {dossier.dateEmissionChequeRegularisation && ` · émis le ${dossier.dateEmissionChequeRegularisation}`}
              · <Tag>{dossier.statutPaiementRegularisation}</Tag></p>
          )}
          <Space wrap>
            {dossier.documentCorrectifReference && ["COMPTABLE", "RESPONSABLE"].includes(role ?? "") && (
              <Button onClick={() => void executer(() => telechargerDocumentCorrectif(dossier.id))}>
                Télécharger le document correctif
              </Button>
            )}
            {role === "RESPONSABLE" && dossier.statut === "EN_ATTENTE_VALIDATION" && (
              <Button type="primary" disabled={attente}
                onClick={() => void executer(() => agirDossier(dossier.id, "valider"))}>
                Valider le blocage
              </Button>
            )}
            {role === "RESPONSABLE" && dossier.statut === "REGULARISATION_ENREGISTREE" && (
              <Button type="primary" disabled={attente}
                onClick={() => void executer(() => agirDossier(dossier.id, "reactiver"))}>
                Valider le paiement et demander la réactivation
              </Button>
            )}
            {role === "SUPERVISEUR" && dossier.statut === "BLOCAGE_EN_COURS" && (
              <Button onClick={() => void chargerOperations(dossier.id, "bloquer")}>Voir les cartes à bloquer</Button>
            )}
            {role === "SUPERVISEUR" && dossier.statut === "REACTIVATION_EN_COURS" && (
              <Button onClick={() => void chargerOperations(dossier.id, "reactiver")}>Voir les cartes à réactiver</Button>
            )}
          </Space>
          {role === "AGENT" && dossier.statut === "BLOQUE" && (
            <div style={{ marginTop: 20 }}>
              <Button type="primary" disabled={attente}
                onClick={() => setDossierPaiement(dossier)}>Enregistrer le paiement</Button>
            </div>
          )}
          {operations[dossier.id]?.map((operation) => (
            <Card size="small" key={operation.id} style={{ marginTop: 12 }}>
              <Space wrap>
                <span>Carte {operation.numeroCarte || operation.carteReference}</span>
                <span>{operation.reference}</span>
                <Button type="primary" disabled={attente} onClick={() => void executer(() =>
                  confirmerOperationRejet(dossier.id, operation.id,
                    dossier.statut === "BLOCAGE_EN_COURS" ? "bloquer" : "reactiver"))}>
                  Déclarer {dossier.statut === "BLOCAGE_EN_COURS" ? "la désactivation" : "l'activation"}
                </Button>
              </Space>
            </Card>
          ))}
        </Card>
      ))}
      </section>
      </div>
      <RegularisationPaiementModal dossier={dossierPaiement} attente={attente}
        onFermer={() => { if (!attente) setDossierPaiement(null); }}
        onSoumettre={(id, valeurs) => void executer(async () => {
          await regulariserCheque(id, {
            modePaiement: valeurs.modePaiement,
            ...(valeurs.modePaiement === "CHEQUE"
              ? { numeroCheque: valeurs.numeroCheque?.trim(),
                  banqueCheque: valeurs.banqueCheque?.trim(),
                  dateEmissionCheque: valeurs.dateEmissionCheque,
                  chequeCertifie: valeurs.chequeCertifie }
              : {}),
          });
          setDossierPaiement(null);
        })}
      />
    </div>
  );
}
